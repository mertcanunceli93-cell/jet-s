import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.params = schema.parse(req.params);
    next();
  };
};
