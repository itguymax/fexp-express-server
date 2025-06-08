// src/services/listings.service.ts
import { prisma } from "../database/prisma";
import { ExchangeListing, ListingType, ListingStatus } from "@prisma/client";

export const ListingService = {
  create: async (
    listingData: any,
    userId: number
  ): Promise<ExchangeListing> => {
    return prisma.exchangeListing.create({
      data: {
        userId: userId,
        currencyFrom: listingData.currencyFrom,
        currencyTo: listingData.currencyTo,
        amountFrom: listingData.amountFrom,
        amountTo: listingData.amountTo,
        exchangeRate: listingData.exchangeRate,
        type: listingData.type as ListingType, // Cast to enum type
        status: ListingStatus.ACTIVE,
        paymentMethod: listingData.paymentMethod,
        location: listingData.location,
        description: listingData.description,
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
