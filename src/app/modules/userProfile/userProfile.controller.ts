import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "../jobs/jobs.service";
import { UserProfileServices } from "./userProfile.service";

const createUserProfile = asyncHandler(async (req, res) => {
const userId = req.user.userId;
const payload = req.body;
  const UserProfile = await UserProfileServices.createUserProfileIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "UserProfile created successfully",
    data: UserProfile,
  });
});


export const UserProfileControllers = {
    createUserProfile
}