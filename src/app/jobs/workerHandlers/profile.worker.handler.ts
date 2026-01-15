import { UserProfile } from "../../modules/userProfile/userProfile.model";

/**
 * --------- generate proifle embedding as background job -------------
 *
 * @param profileId profile for generating embedding
 * @returns message
 */
export const profileEmbeddingHandler = async (profileId: string) => {
  const profile = await UserProfile.findById(profileId).select(
    "embeddingDirty embeddingText"
  );

  // if embedding dirty true, then generate embedding
  if (profile?.embeddingDirty) {
    profile.embeddingDirty = false;

    // TODO: generate embedding
    // set embedding value
    // profile.embedding = generateEmbedding(profile.embeddingText)
    await profile.save();
  }

  return "Embedding is generated!";
};
