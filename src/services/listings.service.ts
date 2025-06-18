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
  location: string; // passed from user for context/validation
}

interface GetMatchingListingsParams {
  userId: number;
  userCountryOfResidence: string;
  page: number;
  limit: number;
  // filters: { [key: string]: any; location?: string };
  orderBy: { [key: string]: "asc" | "desc" };
}
export const ListingService = {
  /**
   *
   * Create a new exchange listing, setting an expiration date on month from creation
   */
  createListing: async (
    listingData: CreateListingInput,
    userId: number
  ): Promise<ExchangeListing> => {
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + 1)); // Add 1
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
        expiresAt: expiresAt,
      },
      include: {
        user: {
          select: {
            uuid: true,
            name: true,
            countryOfResidence: true,
            countryOfOrigin: true,
          },
        },
      },
    });
  },

  /**
   *
   * Fetches listings that match the authenticated user's active listings.
   * A match means: apposite listing type ,same currency, from a user in the same country, active and not expired.
   * Amount matching is currently not strictly enforced in the query,allowing for flexibility.
   */
  getMatchingListings: async ({
    userId,
    userCountryOfResidence,
    page,
    limit,
    orderBy,
  }: GetMatchingListingsParams) => {
    const skip = (page - 1) * limit;

    //1. Fing the authenticated user's own active listings that need a match
    const userActiveListings = await prisma.exchangeListing.findMany({
      where: {
        userId: userId,
        status: ListingStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true, // Needed to ensure we don't match against self
        type: true,
        currencyFrom: true,
        currencyTo: true,
        user: {
          select: {
            countryOfOrigin: true,
          },
        },
      },
    });
    if (userActiveListings.length === 0) {
      return { listings: [], totalListings: 0 };
    }

    // build OR clause for matching based  on user's active listings

    const matchConditions: any[] = userActiveListings.map((userListing) => ({
      type:
        userListing.type === ListingType.SELL
          ? ListingType.BUY
          : ListingType.SELL,
      currencyFrom: userListing.currencyTo,
      currencyTo: userListing.currencyFrom,
      user: {
        countryOfOrigin: userListing.user.countryOfOrigin,
        countryOfResidence: userCountryOfResidence,
      },
      userId: {
        not: userId, // Exlude listings created by the current user
      },
      status: ListingStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    }));
    // if there is no match conditions, prevent empty OR clause
    if (matchConditions.length === 0) {
      console.log("no match conditions", matchConditions);
      return { listings: [], totalListings: 0 };
    }
    console.log("we have match conditions here", matchConditions);
    const listings = await prisma.exchangeListing.findMany({
      where: {
        OR: matchConditions,
      },
      skip: skip,
      take: limit,
      orderBy: orderBy,
      include: {
        user: {
          select: {
            uuid: true,
            name: true,
            profilePicture: true,
            countryOfResidence: true,
            countryOfOrigin: true,
          },
        },
      },
    });

    console.log("Listing after OR", listings);
    const totalListings = await prisma.exchangeListing.count({
      where: {
        OR: matchConditions,
      },
    });
    return { listings, totalListings };
  },

  findByUuid: async (uuid: string, userCountryOfResidence: string) => {
    const listing = await prisma.exchangeListing.findUnique({
      where: {
        uuid: uuid,
        user: {
          countryOfResidence: userCountryOfResidence,
        },
        status: ListingStatus.ACTIVE,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            uuid: true,
            name: true,
            profilePicture: true,
            countryOfResidence: true,
            countryOfOrigin: true,
          },
        },
        // matches: {
        //   select: {
        //     uuid: true,
        //     status: true,
        //   },
        // },
      },
    });
    return listing;
  },

  // TODO: Add methods for updating, deleting, filtering listings
};
