import e, { raw, Request, Response } from "express";
import { Space, ISpace, Booking, IBooking, Availability } from "../models";
import { AuthenticatedRequest } from "../controllers/auth";
import mongoose from "mongoose";
import { SpaceFilter , AvailabilityFilter, BookingFilter } from "../controllers/filters";

// Get all spaces
export const getAllSpaces = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const spaces = await Space.find();
    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

// Get single space by ID
export const getSpaceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      res.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: space,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

// Create new space
export const createSpace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Received request body:", req.body); // ADD THIS LINE
    console.log("User ID from token:", req.userId); // ⬅️ das sollte nicht undefined sein

    const {
      providerId, // discard
      ...rest
    } = req.body;

    const data: Partial<ISpace> = {
      ...rest,
      providerId: req.userId!, // server-trusted userId
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      publishedDate: new Date(),
      lastUpdate: new Date(),
    };

    const space = await Space.create(data);

    res.status(201).json({
      success: true,
      data: space,
    });
  } catch (error) {
    console.error("Error creating space:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create space",
    });
  }
};

// Update space
export const updateSpace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!space) {
      res.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: space,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Update Error",
      error: (error as Error).message,
    });
  }
};

// Delete space
export const deleteSpace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);

    if (!space) {
      res.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Space deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

export const getSpacesByUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      console.warn("No userId found on request");
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const spaces = await Space.find({ providerId: req.userId });

    res.status(200).json({
      success: true,
      data: spaces,
    });
  } catch (err) {
    console.error("Error in getSpacesByUser:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const searchSpaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postalCode, category, date, from, to, minPrice, maxPrice } = req.query;

    const spaceFilter: SpaceFilter = { active: true };

    if (postalCode) spaceFilter.postalCode = Number(postalCode);
    if (category) spaceFilter.categories = category as string;
    
    const dateFilter = date ? new Date(date as string) : null;

    const constructDate = (d: Date, t: string) => {
      const [hours, minutes] = t.split(":").map(Number);
      const result = new Date(d);
      result.setHours(hours, minutes, 0, 0);
      return result;
    }

    const fromDate = dateFilter && from ? constructDate(dateFilter, from as string) : null;
    const toDate = dateFilter && to ? constructDate(dateFilter, to as string) : null;

    // Hole passende Spaces
    const rawSpaces = await Space.find(spaceFilter).lean();
    const spaceIds = rawSpaces.map((s) => s._id as mongoose.Types.ObjectId);

    // Filter für Availability aufbauen
    const availabilityFilter: AvailabilityFilter = {
      spaceId: { $in: spaceIds },
      isAvailable: true,
    };

    if (dateFilter) {
      availabilityFilter.date = dateFilter;
    }

    if (fromDate && !isNaN(fromDate.getTime())) {
      availabilityFilter.startTime = { $lte: fromDate };
    }
    if (toDate && !isNaN(toDate.getTime())) {
      availabilityFilter.endTime = { $gte: toDate };
    }

    if (minPrice || maxPrice) {
      availabilityFilter.specialPricing = {};
      if (minPrice) availabilityFilter.specialPricing.$gte = Number(minPrice);
      if (maxPrice) availabilityFilter.specialPricing.$lte = Number(maxPrice);
    }

    console.log("Searching spaces with filter:", {
      spaceFilter,
      availabilityFilter,
    });

    const availableSlots = await Availability.find(availabilityFilter).lean();
    const availableSpaceIds = new Set(
      availableSlots.map((slot) =>
        (slot.spaceId as mongoose.Types.ObjectId).toString()
      )
    );

    // Nur verfügbare Spaces behalten
    const filteredSpaces = rawSpaces.filter((s) =>
      availableSpaceIds.has((s._id as mongoose.Types.ObjectId).toString())
    );

    // Preise ermitteln
    const priceMap = new Map<string, number>();
    for (const slot of availableSlots) {
      const id = (slot.spaceId as mongoose.Types.ObjectId).toString();
      const price = slot.specialPricing;

      priceMap.set(id, price);
    }

    // Buchungskonflikte prüfen
    const bookingFilter: BookingFilter = {
      spaceId: { $in: filteredSpaces.map((s) => s._id as mongoose.Types.ObjectId) },
    };
    if (dateFilter) bookingFilter.dateOfBooking = dateFilter;
    if (fromDate && toDate) {
      bookingFilter.$or = [
        {
          startTime: { $lte: fromDate },
          endTime: { $gt: fromDate },
        },
        {
          startTime: { $lt: toDate },
          endTime: { $gte: toDate },
        },
        {
          startTime: { $gte: fromDate },
          endTime: { $lte: toDate },
        },
      ];

    }

    const bookingClashes = await Booking.find(bookingFilter).lean();

    const bookedSpaceIds = new Set(
      bookingClashes.map((booking) =>
        (booking.spaceId as mongoose.Types.ObjectId).toString()
      )
    );
    console.log("Booked space IDs:", bookedSpaceIds);
    console.log(filteredSpaces.length);


    // Filtere die Spaces, die keine Buchungskonflikte haben
    const filteredSpacesWithNoClashes = filteredSpaces.filter((space) => {
      const id = (space._id as mongoose.Types.ObjectId).toString();
      return !bookedSpaceIds.has(id);
    });
    
    console.log("Filtered spaces after booking clash check:", filteredSpacesWithNoClashes.length);

    // Ergebnis vorbereiten
    const result = filteredSpacesWithNoClashes
      .map((space) => {
        const id = (space._id as mongoose.Types.ObjectId).toString();
        return {
          ...space,
          isPromoted: space.promoted >= new Date().setHours(0, 0, 0, 0),
          minPrice: priceMap.get(id),
        };
      })
      .sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return 0;
      });

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error("❌ searchSpaces error:", err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
};
