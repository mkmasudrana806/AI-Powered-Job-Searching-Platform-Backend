import { Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { UserProfile } from "./userProfile.model";
import { TUserProfile } from "./userProfile.interface";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import { generateEmbeddingText } from "./userProfile.utils";

/**
 * ------------------- Create Profile -------------------
 *
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

  // check if any semantic field changes
  let embeddingRelevantChange = false;
  for (const key of Object.keys(payload)) {
    if (EMBEDDING_FIELDS.has(key)) {
      embeddingRelevantChange = true;
      break;
    }
  }

  if (embeddingRelevantChange) {
    // generate embedding text
    const embeddingText = generateEmbeddingText(payload);
    // generate embedding
  }

  const profile = await UserProfile.create({
    ...payload,
    user: userId,
  });

  return profile;
};

export const UserProfileServices = {
  createUserProfileIntoDB,
};
