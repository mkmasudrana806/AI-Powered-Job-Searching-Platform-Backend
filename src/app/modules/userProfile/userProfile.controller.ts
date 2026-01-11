import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "../jobs/jobs.service";
import { UserProfileServices } from "./userProfile.service";

/**
 * ----------------- create user profile ------------------
 */
const createUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const UserProfile = await UserProfileServices.createUserProfileIntoDB(
    userId,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "UserProfile created successfully",
    data: UserProfile,
  });
});

/**
 * ----------------- create user profile ------------------
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const UserProfile = await UserProfileServices.updateUserProfileIntoDB(
    userId,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "UserProfile updated successfully",
    data: UserProfile,
  });
});

export const UserProfileControllers = {
  createUserProfile,
  updateUserProfile,
};
