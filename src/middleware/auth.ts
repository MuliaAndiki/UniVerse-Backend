import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Auth from "../models/Auth";
import { JwtPayload } from "../types/auth.types";
import { Types } from "mongoose";
import { env } from "../utils/env.config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        fullname: string;
        email: string;
        role: string;
      };
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      status: 401,
      message: "Access denied. No token provided.",
    });
    return;
  }

  try {
    if (!env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      res.status(500).json({
        status: 500,
        message: "Server configuration error.",
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & {
      id: string;
    };

    const user = await Auth.findById(decoded._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(403).json({
      status: 403,
      message: "Invalid or expired token.",
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("DEBUG: requireRole - req.user:", req.user);
    console.log("DEBUG: requireRole - Required roles:", roles);
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Akses ditolak. Role tidak sesuai." });
      return;
    }
    next();
  };
};
