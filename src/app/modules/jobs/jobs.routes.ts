import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { JobControllers } from "./jobs.controller";
import { JobValidations } from "./jobs.validation";
import requireCompanyAccess from "../../middlewares/authCompany";

const router = express.Router();

// ------------------- company owner + recruiter -------------------
// Create job as open or draft
router.post(
  "/companies/:companyId/jobs",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequest(JobValidations.createJobValidationSchema),
  JobControllers.createJob,
);

// save job as draft
router.post(
  "/companies/:companyId/jobs/draft",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequest(JobValidations.draftJobValidationSchema),
  JobControllers.createJob,
);

// published draft job
router.patch(
  "/companies/:companyId/jobs/:jobId/publish",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequest(JobValidations.updateJobValidationSchema),
  JobControllers.publishDraftJob,
);

// change job status to open, closed, archived
router.patch(
  "/companies/:companyId/jobs/:jobId/open",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  JobControllers.changeJobStatus,
);

router.patch(
  "/companies/:companyId/jobs/:jobId/close",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  JobControllers.changeJobStatus,
);

router.patch(
  "/companies/:companyId/jobs/:jobId/archive",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  JobControllers.changeJobStatus,
);

//  Update job
router.patch(
  "/companies/:companyId/jobs/:jobId",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequest(JobValidations.updateJobValidationSchema),
  JobControllers.updateJob,
);

// update job ranking cinfiguration
router.patch(
  "/companies/:companyId/jobs/:jobId/ranking-configuration",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequest(JobValidations.updateJobRankConfigSchema),
  JobControllers.updateJobRankingConfig,
);

// Delete job
router.delete(
  "/companies/:companyId/jobs/:jobId",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  JobControllers.deleteJob,
);

// Get all jobs of a company (this is like draft, inactive, closed, jobs)
router.get(
  "/companies/:companyId/jobs",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  JobControllers.getCompanyJobs,
);

// ------------------- public routes -------------------

export const JobRoutes = router;
