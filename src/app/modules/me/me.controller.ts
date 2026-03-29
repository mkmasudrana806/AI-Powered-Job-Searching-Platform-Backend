import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { UserProfileServices } from "../userProfile/userProfile.service";
import { UserServices } from "../users/user.service";

/*
============== Users specific controller ============== 
*/

// ------------------- my account info -------------------
const myAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await UserServices.getMe(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My account retrieved successfull",
    data: result,
  });
});

// ------------------- my profile -------------------
const myProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const result = await UserProfileServices.getMyProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My profile retrieved successfull",
    data: result,
  });
});

export const MeController = {
  myProfile,
  myAccount,
};
