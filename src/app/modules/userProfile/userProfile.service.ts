import { Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { UserProfile } from "./userProfile.model";
import { TUpdateUserProfile, TUserProfile } from "./userProfile.interface";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import { EMBEDDING_FIELDS, SCALER_FIELDS_UPDATE } from "./userProfile.constant";

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

  // ----- update single field -----
  for (const field of SCALER_FIELDS_UPDATE) {
    const value = payload[field];
    if (value) {
      profile.set(field, value);
      if (EMBEDDING_FIELDS.includes(field)) {
      }
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
    const { add = [], update = [], remove = [] } = payload.experience;
    // add
    if (Array.isArray(add)) {
      profile.experience.push(...add);
    }

    // update
    if (Array.isArray(update)) {
      for (const updatedExp of update) {
        const existing = profile.experience.find(
          (ex) => ex._id.toString() === updatedExp._id
        );
        if (existing) {
          Object.assign(existing, updatedExp);
        }
      }
    }

    // remove
    if (remove?.length) {
      console.log("yes remove");
      profile.experience = profile.experience.filter(
        (exp) => !payload!.experience!.remove!.includes(exp._id.toString())
      );
    }
  }

  // ----- update education -----
  if (payload.education) {
    const { add = [], update = [], remove = [] } = payload.education;
    // add
    if (Array.isArray(add)) {
      profile.education.push(...add);
    }

    // update
    if (Array.isArray(update)) {
      for (const updatedExp of update) {
        const existing = profile.education.find(
          (ex) => ex._id.toString() === updatedExp._id
        );
        if (existing) {
          Object.assign(existing, updatedExp);
        }
      }
    }

    // remove
    if (remove?.length) {
      console.log("yes remove");
      profile.education = profile.education.filter(
        (exp) => !payload!.education!.remove!.includes(exp._id.toString())
      );
    }
  }

  // ----- update certifications -----
  if (payload.certifications) {
    const { add = [], update = [], remove = [] } = payload.certifications;
    // add
    if (Array.isArray(add)) {
      profile.certifications.push(...add);
    }

    // update
    if (Array.isArray(update)) {
      for (const updatedExp of update) {
        const existing = profile.certifications.find(
          (ex) => ex._id.toString() === updatedExp._id
        );
        if (existing) {
          Object.assign(existing, updatedExp);
        }
      }
    }

    // remove
    if (remove?.length) {
      console.log("yes remove");
      profile.certifications = profile.certifications.filter(
        (exp) => !payload!.certifications!.remove!.includes(exp._id.toString())
      );
    }
  }

  // ----- update projects -----
  if (payload.projects) {
    const { add = [], update = [], remove = [] } = payload.projects;
    // add
    if (Array.isArray(add)) {
      profile.projects.push(...add);
    }

    // update
    if (Array.isArray(update)) {
      for (const updatedExp of update) {
        const existing = profile.projects.find(
          (ex) => ex._id.toString() === updatedExp._id
        );
        if (existing) {
          Object.assign(existing, updatedExp);
        }
      }
    }

    // remove
    if (remove?.length) {
      console.log("yes remove");
      profile.projects = profile.projects.filter(
        (exp) => !payload!.projects!.remove!.includes(exp._id.toString())
      );
    }
  }

  console.log("before save, education payload: ", payload.education);
  console.log("before save, profile data after all update: ", profile);

  await profile.save();

  return profile;
};

export const UserProfileServices = {
  createUserProfileIntoDB,
  updateUserProfileIntoDB,
};
