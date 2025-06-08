// src/controllers/listings.controller.ts
import { Request, Response, NextFunction } from "express";
import { ListingService } from "../services/listings.service";
import { ApiError } from "../utils/errorHandler";

export const ListingController = {
  createListing: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError("Authentication required", 401));
      }
      const newListing = await ListingService.create(req.body, req.user.id);
      res.status(201).json(newListing);
    } catch (error) {
      next(error);
    }
  },

  getAllListings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listings = await ListingService.findAllActive();
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  },

  getListingById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const listing = await ListingService.findById(parseInt(id));
      if (!listing) {
        return next(new ApiError("Listing not found", 404));
      }
      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  },

  // TODO: Add update, delete, get user's own listings
};
