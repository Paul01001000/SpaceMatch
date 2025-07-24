import { Request, Response } from "express";
import mongoose from "mongoose";
import { Booking, Availability, User } from "../models";
import Space from "../models/Space";
import { AuthenticatedRequest } from "../controllers/auth";
import { AvailabilityFilter , BookingFilter } from "../controllers/filters";

//To find reservations of a space of a provider
export const getReservationsBySpaceId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { spaceId } = req.params;

    if (!spaceId) {
      res.status(400).json({ message: "Space ID is required" });
      return;
    }

    const reservations = await Booking.find({ spaceId })
      .populate("userId", "name email") // Optionally populate user details
      .sort({ dateOfBooking: -1 }); // Sort by booking date descending

    res.status(200).json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reservations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//To find bookings of a user
export const getReservationsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const reservations = await Booking.find({ userId })
      .populate("userId", "name email") // Optionally populate user details
      .sort({ dateOfBooking: -1 }); // Sort by booking date descending

    res.status(200).json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

interface checkSpaceAvailabilityQuery {
  spaceId: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
}

export const checkSpaceAvailability = async (
  query: checkSpaceAvailabilityQuery
): Promise<{ available: boolean; price: number }> => {
  try {
    const { spaceId, date, startTime, endTime } = query;

    const availabilityFilter: AvailabilityFilter = {
      spaceId: spaceId,
      isAvailable: true,
      date: date, 
      startTime: { $lte: startTime },
      endTime: { $gte: endTime },
    }

    const availableSlots = await Availability.find(availabilityFilter).lean();

    console.log("Available slots:", availableSlots);

    if (!availableSlots || availableSlots.length === 0) {
      return { available: false, price: 0};
    }

    const bookingFilter: BookingFilter = {
      spaceId: spaceId,
      dateOfBooking: date,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ]
    }
    const bookingClashes = await Booking.find(bookingFilter);
    console.log("Booking clashes:", bookingClashes);

    // Check if there are any bookings that clash with the requested time
    return { available : !(bookingClashes && bookingClashes.length > 0), price: availableSlots[0].specialPricing };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { available: false, price: 0};
  }
};

export const getSpaceAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
     
    const { spaceId, date, startTime, endTime } = req.body;

    if (!spaceId || !startTime || !endTime) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const { available, price} = await checkSpaceAvailability({
      spaceId,
      date: date, 
      startTime: startTime,
      endTime: endTime,
    });
    if ( available) {
      res.status(200).json({
        available: true,
        price: price
      });
    } else {
      res.status(200).json({
        available: false,
        price: 0,
        message: "Space is not available for booking",
      });
    }
  } catch (error) {
    console.error("Error checking space availability:", error);
    res.status(500).json({
      available: false,
      price: 0,
      message: "Error checking space availability",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createReservation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
    console.log("Creating reservation with body:", req.body);
  try {
    const userId = req.userId; // Get user ID from auth context
    const { spaceId, dateOfBooking, startTime, endTime, totalPrice } =
      req.body;
    if (
      !spaceId ||
      !dateOfBooking ||
      !startTime ||
      !endTime ||
      !totalPrice
    ) {
      res.status(400).json({ message: "All fields are required" });
      console.error("Missing required fields for reservation creation");
      return;
    }
    // Fetch user's name for bookingUserName
    const user = await User.findById(userId).select('firstName lastName');
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const bookingUserName = `${user.firstName} ${user.lastName}`;
    mongoose.startSession().then((session) => {
      session.withTransaction(async () => {
        // Check if the space is available
        const isAvailable = await checkSpaceAvailability({
          spaceId,
          date: dateOfBooking,
          startTime,
          endTime,
        });
        console.log("Space availability:", isAvailable);
        if (!isAvailable) {
          res
            .status(400)
            .json({ message: "Space is not available for booking" });
          return;
        }
        const newReservation = await Booking.create({
          userId, // Replace with actual user ID from auth context
          spaceId,
          dateOfBooking,
          startTime,
          endTime,
          totalPrice,
          bookingUserName,
          status: 'payment outstanding',
        });
        res.status(201).json({
          success: true,
          data: newReservation,
        });
      });
    }).catch((error) => {
      console.error("Error during reservation transaction:", error);
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({
      success: false,
      message: "Error creating reservation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateReservation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reservationId } = req.params;
        const updateData = req.body;

        if (!reservationId) {
            res.status(400).json({ message: 'Reservation ID is required' });
            return;
        }

        const updatedReservation = await Booking.findByIdAndUpdate(reservationId, updateData, { new: true });

        if (!updatedReservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: updatedReservation
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating reservation',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}


//Get spaces of the current provider and then their reservations
export const getReservationsOfProviderSpaces = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      res.status(400).json({ message: "Provider ID is required" });
      return;
    }

    // Step 1: Find all spaces for this provider
    const spaces = await Space.find({ providerId });
    const spaceIds = spaces.map((space) => space._id);

    if (!spaceIds.length) {
      res.status(404).json({ message: "No spaces found for this provider" });
      return;
    }

    // Step 2: Find all bookings for these spaces
    const reservations = await Booking.find({ spaceId: { $in: spaceIds } })
      .populate("spaceId", "title")
      .populate("userId", "name");

    // Map to required fields
    const result = reservations.map((r) => ({
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      bookingUserName:
        r.userId && typeof r.userId === "object" ? r.userId.name : undefined,
      spaceTitle:
        r.spaceId && typeof r.spaceId === "object"
          ? r.spaceId.title
          : undefined,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching reservations of provider spaces:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reservations of provider spaces",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const confirmReservation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, {
      status: 'confirmed',
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

export const deleteOutstandingOldBookings = async (): Promise<void> => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await Booking.deleteMany({
      status: "payment outstanding",
      createdAt: { $lt: oneHourAgo },
    });

  } catch (error) {
    console.error("Error deleting old outstanding bookings:", error);
    
  }
};


