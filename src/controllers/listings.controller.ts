// src/controllers/listings.controller.ts
import { Request, Response, NextFunction } from "express";
import { ListingService } from "../services/listings.service";
import { ApiError } from "../utils/errorHandler";

export const ListingController = {
  /**
   * Create a new exchange listing. The listings's country will be automatically
   * set to the authenticated user's country of residence.
   * POST /api/v1/listings
   *
   */
  createListing: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id || !req.user.countryOfResidence) {
        return next(
          new ApiError("Authentication required or user data imcomplete", 401)
        );
      }

      const { countryOfResidence } = req.user; // Get country from authenticated user
      const listingData = { ...req.body, location: countryOfResidence };
      const newListing = await ListingService.createListing(
        listingData,
        req.user.id
      );
      res.status(201).json({
        status: "success",
        message: "Listing created successfully",
        data: {
          listing: newListing,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get matching listings for the authenticated user's active listings.
   * GET //api/v1/listings
   *
   */
  getMatchingListings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id || !req.user.countryOfResidence) {
        return next(new ApiError("User data incomplete.", 401));
      }
      const userId = req.user.id;
      const userCountry = req.user.countryOfResidence;
      const {
        page = "1",
        limit = "10",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      if (isNaN(pageNum) || pageNum < 1) {
        return next(
          new ApiError("Invalid page number, must be at least 1.", 400)
        );
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return next(
          new ApiError("Invalid limit number, must be at least 1.", 400)
        );
      }
      const orderBy: any = {};
      const validSortFields = ["createdAt", "amountFrom", "updatedAt"];
      if (!validSortFields.includes(sortBy as string)) {
        return next(
          new ApiError(
            `Invalid sortBy field. Must be one of: ${validSortFields.join(
              ", "
            )}.`,
            400
          )
        );
      }
      if (sortOrder !== "asc" && sortOrder !== "desc") {
        return next(new ApiError("Invalid sortBy. must be 'asc' or 'desc' ."));
      }

      orderBy[sortBy as string] = sortOrder;

      const { listings, totalListings } =
        await ListingService.getMatchingListings({
          userId,
          userCountryOfResidence: userCountry,
          page: pageNum,
          limit: limitNum,
          orderBy,
        });
      const totalPages = Math.ceil(totalListings / limitNum);
      res.status(200).json({
        status: "success",
        data: {
          listings,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalListings,
            limit: limitNum,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single listing by its UUID, restricted by user's country of residence,
   * active status, and expiration.
   * Get /api/v1/listings/:uuid
   *
   */
  getListingByUuid: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.countryOfResidence) {
        return next(
          new ApiError(
            "Authentication required or country of residence missing from token.",
            401
          )
        );
      }

      const { uuid } = req.params;
      const userCountry = req.user.countryOfResidence;
      const listing = await ListingService.findByUuid(uuid, userCountry);
      if (!listing) {
        return next(
          new ApiError(
            "Listing not found or not available in your country",
            404
          )
        );
      }
      res.status(200).json({
        status: "success",
        data: {
          listing,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Add update, delete, get user's own listings
};
