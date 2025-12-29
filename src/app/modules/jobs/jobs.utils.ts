import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { TJob } from "./jobs.interface";

// validate title
export const validateTitle = (title: string) => {
  if (title?.length < 10 || title.length > 120) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job title must be between 10 and 120 characters"
    );
  }

  // prevent keyword stuffing
  const titleWords = title.toLowerCase().split(/\s+/);
  const repeatedWords = titleWords.filter(
    (w: string, i: number, arr: string[]) =>
      arr.indexOf(w) !== i && w.length > 3
  );

  if (repeatedWords.length > 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job title contains excessive repeated words"
    );
  }
};

// validate description
export const validateDescription = (description: string) => {
  if (description.length < 200 || description.length > 5000) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job description must be between 200 and 5000 characters"
    );
  }

  // basic HTML/script protection
  if (/<script|<\/script>|<iframe/i.test(description)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job description contains unsafe HTML"
    );
  }
};

// validate responsibilities
export const validateResponsibilities = (responsibilities: string[]) => {
  if (!responsibilities || responsibilities.length < 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least 3 responsibilities are required"
    );
  }

  if (responsibilities.length > 12) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Too many responsibilities (max 12)"
    );
  }

  const uniqueResponsibilities = new Set(
    responsibilities.map((r: string) => r.toLowerCase())
  );
  if (uniqueResponsibilities.size !== responsibilities.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Duplicate responsibilities are not allowed"
    );
  }
};

// validate skills
export const validateSkills = (requiredSkills: string[]) => {
  if (!requiredSkills || requiredSkills.length < 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least 3 required skills are needed"
    );
  }

  requiredSkills = [
    ...new Set(requiredSkills.map((s: string) => s.toLowerCase())),
  ];
};

// validate salary
export const validateSalary = (salary: TJob["salary"]) => {
  if (salary.type === "fixed" && salary.min !== salary.max) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Fixed salary must have same min and max value"
    );
  }

  if (
    salary?.type === "range" &&
    salary?.min != null &&
    salary?.max != null &&
    salary.min >= salary.max
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Salary range min must be less than max"
    );
  }

  if (
    ["negotiable", "not_disclosed"].includes(salary.type) &&
    (salary.min || salary.max)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Negotiable or undisclosed salary must not include min/max"
    );
  }
};

// validate qualification consistency
export const validateQualificationConsistency = (
  qualifications: TJob["qualifications"]
) => {
  if (
    qualifications.educationLevel !== "not_required" &&
    /not required|no degree/i.test(qualifications.text)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Qualification text contradicts education level"
    );
  }
};

// validate location
export const validateLocation = (location: TJob["location"]) => {
  if (location?.remote === true && location?.geo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Remote jobs should not include geo coordinates"
    );
  }
};

// ------------------- validate business rules for job -------------------
export const validateJobBusinessRules = (job: Partial<TJob>) => {
  // check that at least one field exists
  if (Object.keys(job).length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least one field must be provided for update"
    );
  }

  if (job.title) {
    validateTitle(job.title);
  }
  if (job.description) {
    validateDescription(job.description);
  }
  if (job.responsibilities) {
    validateResponsibilities(job.responsibilities);
  }
  if (job.requiredSkills) {
    validateSkills(job.requiredSkills);
  }
  if (job.salary) {
    validateSalary(job.salary);
  }
  if (job.qualifications) {
    validateQualificationConsistency(job.qualifications);
  }
  if (job.location) {
    validateLocation(job.location);
  }
};

// ----------------- build Embedding text --------------
export const buildEmbeddingText = (job: any): string => {
  const responsibilitiesText = job.responsibilities
    .map((r: string) => `- ${r}`)
    .join("\n");

  const skillsText = job.requiredSkills.join(", ");
  const embeddingText = `
    Job Title: ${job.title}
    Job Description: ${job.description}
    Responsibilities: ${responsibilitiesText}
    Required Skills: ${skillsText}
    Qualifications: ${job.qualifications.text}
  `;
  return embeddingText;
};


