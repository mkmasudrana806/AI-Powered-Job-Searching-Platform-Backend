import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { UserProfile } from "./userProfile.model";
import { TUpdateUserProfile, TUserProfile } from "./userProfile.interface";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import { SCALER_FIELDS_UPDATE } from "./userProfile.constant";
import {
  crudOperation,
  generateEmbeddingText,
  generateHash,
} from "./userProfile.utils";

/**
 * ------------------- Create Profile -------------------
 * Note: only when user want to create profile or action based profile creation
 * profile creation time, create profile with headline only. later all action act as 'update'
 * @param userId user id (who will create profile)
 * @param payload user profile data
 * @return message
 */
const createUserProfileIntoDB = async (
  userId: string,
  payload: Partial<TUserProfile>
) => {
  // validate object id
  validateObjectIDs({ name: "user id", value: userId });

  // check if user profile already exists
  const exists = await UserProfile.findOne({ user: userId, isDeleted: false });
  if (exists) {
    throw new AppError(httpStatus.CONFLICT, "User profile already exists");
  }

  const profile = await UserProfile.create({
    ...payload,
    user: userId,
  });
  return profile;
};

/**
 * ---------------- update user profile -------------------
 *
 * @param userId user id to update profile
 * @param payload updated profile payload
 * @return message
 */
const updateUserProfileIntoDB = async (
  userId: string,
  payload: Partial<TUpdateUserProfile>
) => {
  // validate object id
  validateObjectIDs({ name: "user id", value: userId });

  // check if user profile exists
  const profile = await UserProfile.findOne({
    user: userId,
    isDeleted: false,
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile is not found");
  }

  // generate semantic text and hash of old profile data.
  // later we use it after update profile
  let previousSemanticText: string = "";
  let previousHash: string | undefined = profile.previousHash;

  if (!profile?.previousHash) {
    console.log("previous hash nai...");
    previousSemanticText = generateEmbeddingText(profile);
    previousHash = generateHash(previousSemanticText);
  }

  // ----- update single field -----
  for (const field of SCALER_FIELDS_UPDATE) {
    const value = payload[field];
    if (value) {
      profile.set(field, value);
    }
  }

  // ----- skills update -----
  if (Array.isArray(payload.skills)) {
    profile.skills = [...new Set(payload.skills.map((s) => s.trim()))];
  }

  // -------- preferred roles ----
  if (payload?.preferredRoles) {
    profile.preferredRoles = [
      ...new Set(payload.preferredRoles.map((s) => s.trim())),
    ];
  }

  // ----- update experience -----
  if (payload.experience) {
    if (!profile.experience) {
      profile.experience = [];
    }
    crudOperation(profile.experience, payload.experience ?? {});
  }

  // ----- update education -----
  if (payload.education) {
    if (!profile.education) {
      profile.education = [];
    }
    crudOperation(profile.education, payload.education ?? {});
  }

  // ----- update certifications -----
  if (payload.certifications) {
    if (!profile.certifications) {
      profile.certifications = [];
    }
    crudOperation(profile.certifications, payload.certifications ?? {});
  }

  // ----- update experience -----
  if (payload.projects) {
    if (!profile.projects) {
      profile.projects = [];
    }
    crudOperation(profile.projects, payload.projects ?? {});
  }

  // generate semantic text and hash after applying all update
  const updatedSemanticText = generateEmbeddingText(profile);
  const updatedHash = generateHash(updatedSemanticText);

  // if hash changed, update the has and embedding
  const isSemanticValueChanged = previousHash !== updatedHash;

  if (isSemanticValueChanged) {
    profile.previousHash = updatedHash;
    console.log("generate embedding...");
    // generate embedding and add to profile
  }
  await profile.save();

  return profile;
};

/**
 * ------------ get my profile (only owner side) --------------
 *
 * @param userId user id
 * @returns user data
 * only owner profile side, not public
 */
const getMyProfileFromDB = async (userId: string) => {
  // validate userid
  validateObjectIDs({ name: "user id", value: userId });

  const profile = await UserProfile.findOne({
    user: userId,
    isDeleted: false,
  }).populate("user");

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  }
  return profile;
};

/**
 * ------------------- Public Profile of user -------------------
 */
const getUserPublicProfileFromDB = async (profileId: string) => {
  validateObjectIDs({ name: "profile id", value: profileId });

  const profile = await UserProfile.findOne({
    _id: profileId,
    isDeleted: false,
  }).populate("user");

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile not available");
  }

  return profile;
};

export const UserProfileServices = {
  createUserProfileIntoDB,
  updateUserProfileIntoDB,
  getMyProfileFromDB,
  getUserPublicProfileFromDB,
};
