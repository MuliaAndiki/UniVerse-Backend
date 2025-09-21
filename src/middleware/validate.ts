import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      params: req.params,
      query: req.query,
      body: req.body,
    });
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", errors: result.error.flatten() });
    }
    (req as any).validated = result.data;
    next();
  };
};

export default validate;
