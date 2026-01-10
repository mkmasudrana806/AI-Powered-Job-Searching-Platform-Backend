import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserProfileValidations } from "./userProfile.validation";
import { UserProfileControllers } from "./userProfile.controller";

const router = express.Router();

// create profile (first time only)
router.post(
  "/me/profile",
  auth("user"),
  validateRequest(UserProfileValidations.createProfileSchema),
  UserProfileControllers.createUserProfile
);

export const UserProfileRoutes = router;
