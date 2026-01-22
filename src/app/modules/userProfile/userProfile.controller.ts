import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "../jobs/jobs.service";
import { UserProfileServices } from "./userProfile.service";
import resumeDoctorService from "../../ai/jobSeeker/resumeDoctor.service";
import skillGapAnalysisService from "../../ai/jobSeeker/skillGapAnalysis.service";

/**
 * ----------------- create user profile ------------------
 */
const createUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const UserProfile = await UserProfileServices.createUserProfileIntoDB(
    userId,
    payload,
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
    payload,
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
  const UserProfile =
    await UserProfileServices.getUserPublicProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Profile retrieved successfully",
    data: UserProfile,
  });
});

// =============== ai services ===============
/**
 * ------------- resume analysis (resume doctor) -------------
 */
const getResumeDoctor = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { jobId } = req.body;

  const result = await resumeDoctorService(userId, jobId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Resume doctor analyzed successfully",
    data: result,
  });
});

/**
 * ------------------- get skill gap analysis -------------------
 */
const getSkillGapAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const result = await skillGapAnalysisService(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Skill gaps analyzed successfully",
    data: result,
  });
});

export const UserProfileControllers = {
  createUserProfile,
  updateUserProfile,
  getMyProfile,
  getUserPublicProfile,
  getResumeDoctor,
  getSkillGapAnalysis,
};
