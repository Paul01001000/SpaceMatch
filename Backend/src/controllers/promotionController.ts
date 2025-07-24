import { Request, Response } from "express";
import { Promotion, IPromotion, Space } from "../models";
import FactoryController from "./factoryController";

// Get all promotions
export const getAllPromotions = FactoryController.getAll(Promotion);

// Get single availability by ID
export const getPromotionById = FactoryController.getById(Promotion);

// Get all promotions by space ID
export const getPromotionBySpaceId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const promotions = await Promotion.find({
      spaceId: req.params.spaceId,
      end_date: { $gte: new Date().setHours(0, 0, 0, 0) }, // Filter for future dates
    });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

export const createPromotion = FactoryController.create<IPromotion>(Promotion);

export const deletePromotion = FactoryController.delete(Promotion);

export const confirmPromotion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, {
      paymentConfirmed: true,
    });

    if (!promotion) {
      res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    const space = await Space.findByIdAndUpdate(
      promotion.spaceId,
      { promoted: promotion.end_date } // Set the promoted date;
    );

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};
