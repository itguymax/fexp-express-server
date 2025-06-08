// src/services/transactions.service.ts
import { prisma } from "../database/prisma";
import { Transaction, TransactionStatus } from "@prisma/client";

export const TransactionService = {
  create: async (
    matchId: number,
    senderId: number,
    receiverId: number,
    amount: number,
    currency: string
  ): Promise<Transaction> => {
    return prisma.transaction.create({
      data: {
        matchId,
        senderUserId: senderId,
        receiverUserId: receiverId,
        amount,
        currency,
        status: TransactionStatus.INITIATED,
      },
    });
  },

  findById: async (id: number): Promise<Transaction | null> => {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        match: true,
        sender: { select: { id: true, uuid: true, email: true } },
        receiver: { select: { id: true, uuid: true, email: true } },
      },
    });
  },

  updateStatus: async (
    transactionId: number,
    status: TransactionStatus,
    proofOfPayment?: string
  ): Promise<Transaction> => {
    return prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        proofOfPayment: proofOfPayment || undefined, // Only update if provided
      },
    });
  },

  // TODO: Add methods for listing transactions, filtering, etc.
};
