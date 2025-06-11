// src/services/listings.service.ts
import { prisma } from "../database/prisma";
import { ExchangeListing, ListingType, ListingStatus } from "@prisma/client";

interface CreateListingInput {
  userId: number;
  type: ListingType;
  currencyFrom: string;
  currencyTo: string;
  amountFrom: number;
  amountTo: number;
  paymentMethod: string;
  description?: string;
  location: string;
}

interface GetAllListingsParams {
  page: number;
  limit: number;
  filters: { [key: string]: any; location?: string };
  orderBy: { [key: string]: "asc" | "desc" };
}
export const ListingService = {
  create: async (
    listingData: CreateListingInput,
    userId: number
  ): Promise<ExchangeListing> => {
    return prisma.exchangeListing.create({
      data: {
        userId: userId,
        currencyFrom: listingData.currencyFrom,
        currencyTo: listingData.currencyTo,
        amountFrom: listingData.amountFrom,
        amountTo: listingData.amountTo,
        type: listingData.type as ListingType, // Cast to enum type
        status: ListingStatus.ACTIVE,
        paymentMethod: listingData.paymentMethod,
        location: listingData.location,
        description: listingData.description,
        exchangeRate: 10, // to be removed
      },
      include: {
        user: {
          select: {
            uuid: true,
            name: true,
            countryOfResidence: true,
          },
        },
      },
    });
  },

  findAllActive: async (): Promise<ExchangeListing[]> => {
    return prisma.exchangeListing.findMany({
      where: { status: ListingStatus.ACTIVE },
      include: {
        user: {
          select: { id: true, uuid: true, email: true, countryOfOrigin: true },
        },
      }, // Include user details
    });
  },

  findById: async (id: number): Promise<ExchangeListing | null> => {
    return prisma.exchangeListing.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, uuid: true, email: true, countryOfOrigin: true },
        },
      },
    });
  },

  // TODO: Add methods for updating, deleting, filtering listings
};
