// when semantic field will be changed, we will regenerate the embedding
// so we need meaning full format of headline, summary, skills, experience (role, year),
// education (degree, field of study), projects (title, description)

import { TUserProfile } from "./userProfile.interface";

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
