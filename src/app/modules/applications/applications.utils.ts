import { TExperience } from "../userProfile/userProfile.interface";

/**
 * ------------ build experience summary ---------------
 *
 * @param experiences experience array
 * @returns formated semantic summary
 *
 * if and only if, user has experiences. else null
 */
export const buildExperienceSummaryText = (experiences: TExperience[]) => {
  let summaries: string[] = [];

  if (experiences.length) {
    experiences.map((exp) => {
      if (exp.companyName && exp.role && exp.startDate) {
        const startYear = exp.startDate.getFullYear();
        const endYear = exp.isCurrent ? "Present" : exp.endDate?.getFullYear();
        summaries.push(
          `${exp.role} at ${exp.companyName} (${startYear} – ${endYear})`
        );
      }
    });
  }

  return summaries.join(" | ");
};
