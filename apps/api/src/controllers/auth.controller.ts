import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { sendSuccess, sendError } from '../lib/response';

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.warn('JWT_SECRET is missing. Using default fallback secret.');
    return 'J3t1s_P20d_Secr3t_K3y_84729104857';
  }
  return secret;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Bu e-posta adresi zaten kullanılıyor.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'USER',
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret(),
      { expiresIn: '7d' }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    logger.error('auth.register_failed', { message: (error as Error).message });
    return sendError(res, 'Sunucu hatası oluştu.');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Geçersiz e-posta veya şifre.', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return sendError(res, 'Geçersiz e-posta veya şifre.', 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret(),
      { expiresIn: '7d' }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('auth.login_failed', { message: (error as Error).message });
    return sendError(res, 'Sunucu hatası oluştu.');
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });

    if (!user) {
      return sendError(res, 'Kullanıcı bulunamadı.', 404);
    }

    return sendSuccess(res, { user });
  } catch (error) {
    logger.error('auth.me_failed', { message: (error as Error).message });
    return sendError(res, 'Sunucu hatası oluştu.');
  }
};
