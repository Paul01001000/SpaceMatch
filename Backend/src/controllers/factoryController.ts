import { Request, Response } from "express";
import { Model } from "mongoose";

class FactoryController{
    static getAll(collection: Model<any, {}, {}, {}, any, any>){
        return async (req: Request, res: Response): Promise<void> => {
            try {
              const document = await collection.find();
              res.status(200).json({
                success: true,
                count: document.length,
                data: document
              });
            } catch (error) {
              res.status(500).json({
                success: false,
                message: 'Server Error',
                error: (error as Error).message
              });
            }
          };
    }
    
    static getById(collection: Model<any, {}, {}, {}, any, any>){
        return async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              const document = await collection.findById(req.params.id);
          
              if (!document) {
                res.status(404).json({
                  success: false,
                  message: "Not found",
                });
                return;
              }
          
              res.status(200).json({
                success: true,
                data: document,
              });
            } catch (error) {
              res.status(500).json({
                success: false,
                message: "Server Error",
                error: (error as Error).message,
              });
            }
          };
    }
    static create<T>(collection: Model<any, {}, {}, {}, any, any>){
        return async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              console.log("Received request body:", req.body); // ADD THIS LINE
              
              const data: T = req.body;  
              const document = await collection.create(data);
          
              res.status(201).json({
                success: true,
                data: document,
              });
            } catch (error) {
              res.status(500).json({
                success: false,
                message: "Server Error",
                error: (error as Error).message,
              });
            }
          };
    }

    static update<T>(collection: Model<any, {}, {}, {}, any, any>){
        return async (req: Request, res: Response): Promise<void> => {
            try {
              console.log("Received request body:", req.body); // ADD THIS LINE
              
              const data: Partial<T> = req.body;  
              const space = await collection.findByIdAndUpdate(
                req.params.id,
                data,
                {
                  new: true,
                  runValidators: true
                }
              );
          
              if (!space) {
                res.status(404).json({
                  success: false,
                  message: 'Space not found'
                });
                return;
              }
          
              res.status(200).json({
                success: true,
                data: space
              });
            } catch (error) {
              res.status(400).json({
                success: false,
                message: 'Update Error',
                error: (error as Error).message
              });
            }
          };
    }

    static delete(collection: Model<any, {}, {}, {}, any, any>){
        return async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {

                console.log("Received request body:", req.body); // ADD THIS LINE
                
              const document = await collection.findByIdAndDelete(req.params.id);
          
              if (!document) {
                res.status(404).json({
                  success: false,
                  message: "Not found",
                });
                return;
              }
          
              res.status(200).json({
                success: true,
                message: "Deleted successfully",
              });
            } catch (error) {
              res.status(500).json({
                success: false,
                message: "Server Error",
                error: (error as Error).message,
              });
            }
          };
    }
}
    

export default FactoryController
