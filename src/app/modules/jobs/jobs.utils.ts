import httpStatus from "http-status";
import AppError from "../../utils/AppError";

// ------------------- validate business rules for job -------------------
export const validateJobBusinessRules = (job: any) => {
  // title
  if (job.title.length < 10 || job.title.length > 120) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job title must be between 10 and 120 characters"
    );
  }

  // prevent keyword stuffing
  const titleWords = job.title.toLowerCase().split(/\s+/);
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

  // description
  if (job.description.length < 200 || job.description.length > 5000) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job description must be between 200 and 5000 characters"
    );
  }

  // basic HTML/script protection
  if (/<script|<\/script>|<iframe/i.test(job.description)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Job description contains unsafe HTML"
    );
  }

  // responsibilities
  if (!job.responsibilities || job.responsibilities.length < 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least 3 responsibilities are required"
    );
  }

  if (job.responsibilities.length > 12) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Too many responsibilities (max 12)"
    );
  }

  const uniqueResponsibilities = new Set(
    job.responsibilities.map((r: string) => r.toLowerCase())
  );
  if (uniqueResponsibilities.size !== job.responsibilities.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Duplicate responsibilities are not allowed"
    );
  }

  // skills
  if (!job.requiredSkills || job.requiredSkills.length < 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least 3 required skills are needed"
    );
  }

  job.requiredSkills = [
    ...new Set(job.requiredSkills.map((s: string) => s.toLowerCase())),
  ];

  // salary
  const salary = job.salary;

  if (salary.type === "fixed" && salary.min !== salary.max) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Fixed salary must have same min and max value"
    );
  }

  if (salary.type === "range" && salary.min >= salary.max) {
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

  // qualification consistency
  if (
    job.qualifications.educationLevel !== "not_required" &&
    /not required|no degree/i.test(job.qualifications.text)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Qualification text contradicts education level"
    );
  }

  // location
  if (job.location?.remote === true && job.location?.geo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Remote jobs should not include geo coordinates"
    );
  }

  return true;
};


// ----------------- build Embedding text --------------
export const buildEmbeddingText = (job: any): string => {
  const responsibilitiesText = job.responsibilities
    .map((r: string) => `- ${r}`)
    .join("\n");

  const skillsText = job.requiredSkills.join(", ");

  return `
Job Title:
${job.title}

Job Description:
${job.description}

Responsibilities:
${responsibilitiesText}

Required Skills:
${skillsText}

Qualifications:
${job.qualifications.text}

Experience Level:
${job.experienceLevel}
`.trim();
};
