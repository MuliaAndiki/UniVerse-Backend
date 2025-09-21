import { Request, Response, NextFunction } from "express";

export const roleGuard = (roles: Array<"user" | "organizer" | "campus" | "super-admin">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string } | undefined;

    if (!user?.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(user.role as any)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};

export default roleGuard;
