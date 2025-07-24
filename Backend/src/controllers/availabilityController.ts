import { Request, Response } from "express";
import { Availability, IAvailability } from "../models";
import FactoryController from "./factoryController";
import { start } from "repl";

// Get single availability by ID
export const getAvailabilitiyById = FactoryController.getById(Availability);

// Get all availabilities by space ID
export const getAvailabilitiesBySpaceId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const availabilities = await Availability.find({
      spaceId: req.params.spaceId,
      date: { $gte: new Date().setHours(0, 0, 0, 0) }, // Filter for future dates
    }).sort({ date: 1 }); // Sort by date ascending

    res.status(200).json({
      success: true,
      count: availabilities.length,
      data: availabilities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

// Create new availability
export const createAvailability = async (
  req_data: any,
  documents: IAvailability[]
): Promise<void> => {
  try {
    let data: IAvailability = req_data;
    let clashes: IAvailability[] = await Availability.find({
      spaceId: data.spaceId,
      date: data.date,
      $or: [
        {
          startTime: { $lte: data.startTime },
          endTime: { $gte: data.startTime },
        },
        {
          startTime: { $lte: data.endTime },
          endTime: { $gte: data.endTime },
        },
        {
          startTime: { $gte: data.startTime },
          endTime: { $lte: data.endTime },
        },
      ],
    });

    if (clashes.length > 0) {
      clashes.push(data);
      console.log("Clashes found:", clashes);
      //find max price in clashes
      const maxPrice = Math.max(
        ...clashes.map((clash) => clash.specialPricing || 0)
      );
      const startTime = Math.min(
        ...clashes.map((clash) => new Date(clash.startTime).getTime())
      );
      const endTime = Math.max(
        ...clashes.map((clash) => new Date(clash.endTime).getTime())
      );

      clashes.pop();
      for (const clash of clashes) {
        await Availability.findByIdAndDelete(clash._id); // Delete clash
      }

      data.specialPricing = maxPrice;
      data.startTime = new Date(startTime);
      data.endTime = new Date(endTime);
    }

    console.log("Creating availability with data:", data); // ADD THIS LINE

    const document = await Availability.create(data);
    documents.push(document);
  } catch (error) {
    console.log("Error creating availability:", error); // ADD THIS LINE
  }
};
export const createAvailabilities = async (
  req: Request,
  res: Response
): Promise<void> => {
  let documents: IAvailability[] = [];
  try {
    console.log("Received request body:", req.body); // ADD THIS LINE

    const interval = ((repetion: string) => {
      switch (repetion) {
        case "never":
          return 0; // No repetition
        case "daily":
          return 24 * 60 * 60 * 1000; // Daily interval in milliseconds
        case "weekly":
          return 7 * 24 * 60 * 60 * 1000; // Weekly interval in milliseconds
        case "biweekly":
          return 14 * 24 * 60 * 60 * 1000; // Biweekly interval in milliseconds
        case "monthly":
          return 28 * 24 * 60 * 60 * 1000; // Monthly interval in milliseconds
        default:
          throw new Error("Invalid repetition type");
      }
    })(req.body.repeat);

    let data = {
      spaceId: req.body.spaceId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      specialPricing: req.body.specialPricing,
    };

    const startDate = new Date(data.date).getTime();
    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)
    const reps: number = req.body.repetitions || 0; // Default to 0 if not provided
    for (let i = 0; i <= reps; i++) {
      const nextDate = new Date(startDate + i * interval);
      data.date = new Date(nextDate);
      data.startTime = new Date(
        nextDate.setHours(startTime.getHours(),startTime.getMinutes())
      );
      data.endTime = new Date(
        nextDate.setHours(endTime.getHours(),endTime.getMinutes())
      );
      await createAvailability(data, documents);
    }
    res.status(201).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

// Delete availability
export const deleteAvailability = FactoryController.delete(Availability);

// Update Availability
export const updateAvailability =
  FactoryController.update<IAvailability>(Availability);
