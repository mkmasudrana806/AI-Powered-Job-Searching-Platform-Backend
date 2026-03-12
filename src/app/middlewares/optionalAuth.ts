import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHanlder from "../utils/asyncHandler";
import config from "../config/env";
import { TJwtPayload } from "../modules/auth/auth.interface";
import { User } from "../modules/users/user.model";
/**
 * ------------------- optional auth --------------------
 * no roles required. this auth for non logged in, guest, blocked or any public user
 * if token found, then only i will pass the userId to the req.user.userId
 * in controller, if userId is not found, only we serve public data.
 * if user exists, we return personalized data, user requesting
 */
const optionalAuth = () => {
  return asyncHanlder(
    async (req: Request, res: Response, next: NextFunction) => {
      // full header string
      const authHeader = req.headers?.authorization;

      // extract tokne, except 'Bearer' prefix
      const token = authHeader?.split(" ")[1];

      const optionalReqData = {
        userId: "",
        role: "guest",
        iat: 0,
      };
      // if no token then treat as guest
      if (!token) {
        req.user = optionalReqData;
        req.user = optionalReqData;
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(
          token,
          config.jwt_access_secret as string,
        ) as TJwtPayload;
      } catch (error) {
        // if invalid token then ignore and continue as guest
        req.user = optionalReqData;
        return next();
      }

      const { userId, role, iat } = decoded;

      const user = await User.findOne({ _id: userId, role });

      // if user not found or blocked then treat as guest
      if (!user || user.status === "blocked" || user.isDeleted) {
        req.user = optionalReqData;
        return next();
      }

      // check if token issued before password change
      if (
        user.passwordChangedAt &&
        User.isJWTIssuedBeforePasswordChange(user.passwordChangedAt, iat)
      ) {
        // no problem, we treat it as guest user
        req.user = optionalReqData;
        return next();
      }

      // and finally, we found the authenticate user.
      // we set the decoded info into the request object
      req.user = decoded;
      next();
    },
  );
};

export default optionalAuth;
