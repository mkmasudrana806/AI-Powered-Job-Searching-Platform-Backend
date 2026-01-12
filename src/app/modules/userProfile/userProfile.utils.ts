// when semantic field will be changed, we will regenerate the embedding
// so we need meaning full format of headline, summary, skills, experience (role, year),
// education (degree, field of study), projects (title, description)

import { TUserProfile } from "./userProfile.interface";
import crypto from "crypto";

/**
 * ------------------ build embedding text -----------------------
 *
 * @param profile updated profile data (if any semantic field changes)
 * @returns meaning full text
 */
export const generateEmbeddingText = (
  profile: Partial<TUserProfile>
): string => {
  const lines: string[] = [];

  if (profile.headline) {
    lines.push(`Headline: ${profile.headline}`);
  }

  if (profile.summary) {
    lines.push(`Summary: ${profile.summary}`);
  }

  if (profile.skills?.length) {
    lines.push(`Skills: ${profile.skills.join(", ")}`);
  }

  if (profile.experience?.length) {
    lines.push("Experience:");
    for (const exp of profile.experience) {
      const duration = exp.isCurrent
        ? "Present"
        : exp.endDate
        ? exp.endDate.getFullYear()
        : "Unknown";

      lines.push(
        `- ${exp.role} at ${
          exp.companyName
        } (${exp.startDate.getFullYear()} - ${duration})`
      );

      if (exp.description) {
        lines.push(`  ${exp.description}`);
      }
    }
  }

  if (profile.education?.length) {
    lines.push("Education:");
    for (const edu of profile.education) {
      lines.push(
        `- ${edu.degree || ""} ${edu.fieldOfStudy || ""} at ${edu.institution}`
      );
    }
  }

  if (profile.projects?.length) {
    lines.push("Projects:");
    for (const proj of profile.projects) {
      lines.push(`- ${proj.title}: ${proj.description || ""}`);
    }
  }

  return lines.join("\n").trim();
};

/**
 * generate hash for semantic text. this has used to compare previous semantic
 * and updated semantic changes or not
 *
 * -------------- generate hash --------------
 *
 * @param text embedding text
 * @returns hash
 */
export const generateHash = (text: string): string =>
  crypto.createHash("sha256").update(text).digest("hex");

/**
 * ------------------ crud operation ---------------------
 * @param oldTarget existing experience, projects, certifications, education reference
 * @param crud new actions with payload for experience, projects, certifications, education
 */
// experience, projects, certifications, education crud operation reusable method
export const crudOperation = <T extends { _id: string }>(
  oldTarget: T[],
  crud: {
    add?: T[];
    update?: T[];
    remove?: string[];
  }
) => {
  const { add = [], update = [], remove = [] } = crud;
  // add
  if (add.length) {
    oldTarget.push(...add);
  }

  // update (old and new both has content, then update possible)
  if (update.length && oldTarget.length) {
    for (const updatedExp of update) {
      const existing = oldTarget.find(
        (ex) => ex._id.toString() === updatedExp._id
      );
      if (existing) {
        Object.assign(existing, updatedExp);
      }
    }
  }

  // remove (old and new both should length)
  if (remove.length && oldTarget.length) {
    const removeSet = new Set(remove);
    for (let i = oldTarget.length - 1; i >= 0; i--) {
      if (removeSet.has(oldTarget[i]._id.toString())) {
        oldTarget.splice(i, 1);
      }
    }
  }
};
