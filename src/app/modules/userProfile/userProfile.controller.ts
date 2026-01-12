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
 * ----------------- update user profile ------------------
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

/**
 * ----------------- get my profile ------------------
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const UserProfile = await UserProfileServices.getMyProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "My Profile retrieved successfully",
    data: UserProfile,
  });
});

/**
 * ----------------- get my profile ------------------
 */
const getUserPublicProfile = asyncHandler(async (req, res) => {
  const userId = req.params.profileId;
  const UserProfile = await UserProfileServices.getUserPublicProfileFromDB(
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Profile retrieved successfully",
    data: UserProfile,
  });
});

export const UserProfileControllers = {
  createUserProfile,
  updateUserProfile,
  getMyProfile,
  getUserPublicProfile,
};
