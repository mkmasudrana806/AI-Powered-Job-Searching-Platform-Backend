import { TEXPERIENCE_LEVEL, TJob } from "../../modules/jobs/jobs.interface";
import {
  TEducation,
  TExperience,
  TUserProfile,
} from "../../modules/userProfile/userProfile.interface";

/**
 * candidate ranking class. for each candidate, calculate ranking score
 * based on job ranking config weight and candidate profile
 */
export class CandidateRanking {
  isTitleMatch: boolean = false;
  isSkillMatch: boolean = false;

  /**
   * @param user user profile data
   * @param job job data
   * @param matchScore profile and job matching score
   * @returns match rank score based on weighted calculation
   */

  public calculate(user: TUserProfile, job: TJob, matchScore: number): number {
    const w = job.rankingConfig;

    // user headline and job title partial matching (if any)
    const titleScore = this.calculatePartialMatch(user.headline, job.title);

    // skills score by skills intersection/overlap
    const skillScore = this.calculateSkillScore(
      user?.skills,
      job?.requiredSkills,
    );

    // experience score based on years vs level
    const expScore = this.calculateExperienceScore(
      job.experienceLevel,
      user.totalYearsOfExperience,
    );

    //  employment type binary match
    const empScore = user.employmentType === job.employmentType ? 1 : 0;

    // if current role matches with description , and skills matches 50%
    const recencyScore = this.calculateRecencyScore(
      job.description,
      user.experience,
    );

    // job field of study and user education matching (if any)
    const eduScore = this.calculateEducationMatch(
      job.qualifications?.fieldsOfStudy,
      user.education,
    );

    // weighted sum calculation
    const scores = [
      { score: matchScore, weight: w.matchScore },
      { score: titleScore, weight: w.titleMatch },
      { score: skillScore, weight: w.skills },
      { score: expScore, weight: w.experienceYears },
      { score: empScore, weight: w.employmentType },
      { score: recencyScore, weight: w.recency },
      { score: eduScore, weight: w.fieldOfStudy },
    ];

    const totalWeightedScore = scores.reduce(
      (sum, item) => sum + item.score * item.weight,
      0,
    );
    const totalPossibleWeight = scores.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    // rank score between 0 to 1
    const rankScore =
      totalPossibleWeight > 0 ? totalWeightedScore / totalPossibleWeight : 0;

    return Number(rankScore.toFixed(2));
  }

  // ---------- calculate headline and title partial match ----------
  private calculatePartialMatch(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    // clean and tokenize both strings
    const tokenize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ") // "/", "(", ")" replace with space
        .split(/\s+/)
        .filter((word) => word.length > 2); // keep only words with length > 2

    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);

    // find common words with partial matching
    const commonWords = tokens1.filter((word) =>
      tokens2.some((t2) => t2.includes(word) || word.includes(t2)),
    );

    // if common words found at least more than 1, calculate match ratio
    if (commonWords.length > 1) {
      this.isTitleMatch = true;

      // calculate match ratio based on smaller token set
      const matchRatio =
        commonWords.length / Math.min(tokens1.length, tokens2.length);

      return parseFloat(matchRatio.toFixed(4));
    }

    return 0;
  }

  // ---------- calculate skill overlap score ----------
  private calculateSkillScore(
    userSkills?: string[],
    jobSkills?: string[],
  ): number {
    if (
      !userSkills ||
      userSkills.length === 0 ||
      !jobSkills ||
      jobSkills.length === 0
    )
      return 0;

    let totalMatchCount = 0;

    // check for each required job skill, against user skills
    jobSkills.forEach((js) => {
      const jobSkillLower = js.toLowerCase().trim();

      // check if any user skill matches this job skill
      const isMatched = userSkills.some((us) => {
        const userSkillLower = us.toLowerCase().trim();

        // check both ways partial match
        return (
          userSkillLower.includes(jobSkillLower) ||
          jobSkillLower.includes(userSkillLower)
        );
      });

      if (isMatched) {
        totalMatchCount++;
      }
    });

    // return matching ratio
    const matchingRatio = Number(
      (totalMatchCount / jobSkills.length).toFixed(4),
    );
    if (matchingRatio >= 0.4) {
      this.isSkillMatch = true;
    }
    return matchingRatio;
  }

  // ---------- calculate experience score ----------
  // user should have skills matching with job required skills (partial match)
  // and user headline should match with job title (partial match)
  // it ensure that experience in other field should not count if skills and title not matching
  private calculateExperienceScore(
    jobLevel: TEXPERIENCE_LEVEL,
    userExperienceTotalYears: number,
  ): number {
    // if no experiences 0
    if (userExperienceTotalYears === 0) {
      return 0;
    }

    const requirements: Record<TEXPERIENCE_LEVEL, number> = {
      junior: 0,
      mid: 2,
      senior: 5,
      lead: 8,
    };
    const requiredYears = requirements[jobLevel];

    const userExperienceYears = Number(userExperienceTotalYears);

    // now calculate score if and only if skill match and title match flag true
    if (!this.isSkillMatch || !this.isTitleMatch) {
      return 0;
    }
    // if user years large than required year, return full score
    const experienceScore =
      userExperienceYears >= requiredYears
        ? 1
        : userExperienceYears / requiredYears;

    return experienceScore;
  }

  // ---------- calculate recency score ----------
  private calculateRecencyScore(
    jobDescription: string,
    userExperiences?: TExperience[],
  ): number {
    if (!userExperiences || userExperiences.length === 0) return 0;

    // check if user has current role that matches job title
    const currentJob = userExperiences?.find((e) => e.isCurrent);
    if (!currentJob) return 0;

    // tokenize current role only
    const tokenize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ") // "/", "(", ")" replace with space
        .split(/\s+/)
        .filter((word) => word.length > 2); // keep only words with length > 2

    const currentRoleTokens = tokenize(currentJob.role);
    const commons = currentRoleTokens.filter((token) => {
      return jobDescription
        .toLocaleLowerCase()
        .includes(token.toLocaleLowerCase());
    });

    if (!commons) return 0;
    // current role 70% match with job description is allowed only
    const matchRatio = commons.length / currentRoleTokens.length;

    // match ratio should > 0.59 and should skills match with job required skills
    return matchRatio > 0.59 && this.isSkillMatch ? 1 : 0;
  }

  // ---------- calculate education field of study match ----------
  private calculateEducationMatch(
    jobStudyQualification?: string[],
    userEdu?: TEducation[],
  ): number {
    // return 0 if any of the data missing
    if (
      !userEdu ||
      userEdu.length === 0 ||
      !jobStudyQualification ||
      jobStudyQualification.length === 0
    )
      return 0;
    const hasMatch = userEdu.some(
      (edu) =>
        edu.fieldOfStudy &&
        jobStudyQualification.some(
          (jf) => jf.toLowerCase() === edu.fieldOfStudy?.toLowerCase(),
        ),
    );
    return hasMatch ? 1 : 0;
  }
}
