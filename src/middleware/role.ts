import { NextFunction, Response } from "express";
import { Roles } from "../model/User";
import { AuthRequest } from "./auth";

export const requiredRole = (roles: Roles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {

    // ✅ user must be authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    // ✅ check role
    const hasRole = roles.some(role =>
      req.user.roles?.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({
        message: `Requires ${roles.join(" or ")} role`
      });
    }

    next();
  };
};
