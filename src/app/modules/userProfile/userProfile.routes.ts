import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserProfileValidations } from "./userProfile.validation";
import { UserProfileControllers } from "./userProfile.controller";
import { SalaryPredictionController } from "../salaryPrediction/salaryPrediction.controller";

const router = express.Router();

// create profile (first time only)
router.post(
  "/me/profile",
  auth("user"),
  validateRequest(UserProfileValidations.createProfileSchema),
  UserProfileControllers.createUserProfile,
);

// update user profile
router.patch(
  "/me/profile",
  auth("user"),
  validateRequest(UserProfileValidations.updateProfileSchema),
  UserProfileControllers.updateUserProfile,
);

// get my profile (only profile owner)
router.get("/me/profile", auth("user"), UserProfileControllers.getMyProfile);

router.get("/profiles/:profileId", UserProfileControllers.getUserPublicProfile);

// ============== ai related routes =============
router.post(
  "/me/profile/ai/resume-doctor",
  auth("user"),
  UserProfileControllers.getResumeDoctor,
);

// --------- skill gap analysis ---------
router.get(
  "/me/profile/ai/skill-gap-analysis",
  auth("user"),
  UserProfileControllers.getSkillGapAnalysis,
);

// ----------- salary prediction ---------
router.get(
  "/me/profie/salary-prediction",
  auth("user"),
  SalaryPredictionController.salaryPrediction,
);
export const UserProfileRoutes = router;
