import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess, sendError } from '../lib/response';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) return sendError(res, 'User not found', 404);

    // Remove password hash
    const { password, ...userWithoutPassword } = user;
    return sendSuccess(res, userWithoutPassword);
  } catch (error) {
    return sendError(res, 'Failed to fetch profile', 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone },
    });

    const { password, ...userWithoutPassword } = user;
    return sendSuccess(res, userWithoutPassword);
  } catch (error) {
    return sendError(res, 'Failed to update profile', 500);
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const addresses = await prisma.address.findMany({
      where: { userId },
    });
    return sendSuccess(res, addresses);
  } catch (error) {
    return sendError(res, 'Failed to fetch addresses', 500);
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, fullAddress, lat, lng } = req.body;

    const address = await prisma.address.create({
      data: {
        userId,
        title,
        fullAddress,
        lat,
        lng,
      },
    });
    return sendSuccess(res, address);
  } catch (error) {
    return sendError(res, 'Failed to add address', 500);
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await prisma.address.delete({
      where: { id, userId }, // Ensure user owns the address
    });
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return sendError(res, 'Failed to delete address', 500);
  }
};
