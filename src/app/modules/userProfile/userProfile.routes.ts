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

// update user profile
router.patch(
  "/me/profile",
  auth("user"),
  validateRequest(UserProfileValidations.updateProfileSchema),
  UserProfileControllers.updateUserProfile
);

// get my profile (only profile owner)
router.get("/me/profile", auth("user"), UserProfileControllers.getMyProfile);

router.get("/profiles/:profileId", UserProfileControllers.getUserPublicProfile);

export const UserProfileRoutes = router;
