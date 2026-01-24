import httpStatus from "http-status";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import AppError from "../../utils/AppError";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import {
  getFilteredDataSalaryPrediction,
  isExperienceCompatible,
  normalizeSalary,
  percentile,
} from "./utils";
import { countryCurrencyMap } from "../../utils/countryCurrencyMap";
import SalaryPrediction from "../../modules/salaryPrediction/salaryPrediction.model";

/**
 * ------------ predict salary for user -------------
 *
 * @param userId user id for predicting salayr
 */
const predictSalary = async (userId: string) => {
  // fetch user profile
  const profile = await UserProfile.findOne({ user: userId }).select(
    "+embedding",
  );
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
  }

  // get fileted jobs pools
  const jobPool = await getFilteredDataSalaryPrediction(profile);

  // ------------- below more hard filtering and domain mapping ---------s
  // experience filtering to ensure only user's experience level jobs counts
  const experienceFilteredJobs = jobPool.filter((job) =>
    isExperienceCompatible(profile.totalYearsOfExperience, job.experienceLevel),
  );

  // as we DB level filtered salary with range and fixed.
  // we need to normalized salary to average of min and max value
  const salaryNormalizedJobs = experienceFilteredJobs.reduce<any[]>(
    (acc, job) => {
      const normalizedAmount = normalizeSalary(job.salary);
      if (!normalizedAmount) return acc;
      acc.push({
        ...job.toObject(),
        salary: normalizedAmount,
      });
      return acc;
    },
    [],
  );

  // similarity matching more than 65%, only those keeps
  const topJobs = salaryNormalizedJobs
    .map((job) => {
      const score = cosineSimilarity(
        profile.embedding ?? [],
        job.embedding ?? [],
      );
      return { ...job, similarityScore: score };
    })
    .filter((j) => j.similarityScore > 70);

  // calculate min, median, max
  const salaries: number[] = topJobs.map((job) => job.salary.value);

  const p25 = percentile(salaries, 25);
  const p50 = percentile(salaries, 50);
  const p75 = percentile(salaries, 75);

  // calculate confidence
  const confidence =
    topJobs.length >= 80 ? "high" : topJobs.length >= 30 ? "medium" : "low";

  const currency = countryCurrencyMap[profile.location?.country ?? "Unknown"];

  // updated salary prediction status and predicted value in Database
  const result = await SalaryPrediction.findOneAndUpdate(
    {
      user: userId,
    },
    {
      status: "completed",
      completedAt: new Date(),
      result: {
        currency: currency,
        min: p25,
        median: p50,
        max: p75,
        confidence: confidence,
        sampleSize: topJobs.length,
      },
    },
  );

  return "Yes salary prediction full pipeline is worked!";
};

export default predictSalary;
