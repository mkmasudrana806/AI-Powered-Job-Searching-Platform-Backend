import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { ApplicationValidations } from "./applications.validation";
import { ApplicationControllers } from "./applications.controller";
import requireCompanyAccess from "../../middlewares/authCompany";
const router = Router();

// apply job (job seeker)
router.post(
  "/jobs/:jobId/applications",
  auth("user"),
  validateRequestData(ApplicationValidations.applyJobValidationSchema),
  ApplicationControllers.applyJob,
);

// get all job of an applicants (job seeker)
router.get(
  "/me/applications",
  auth("user"),
  ApplicationControllers.getMyApplications,
);

// withdraw an application (job seeker)
router.patch(
  "/applications/:applicationId/withdraw",
  auth("user"),
  ApplicationControllers.withdrawApplication,
);

// update application status (recruiter, owner)
router.patch(
  "/companies/:companyId/applications/:applicationId/status",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequestData(ApplicationValidations.updateApplicationStatusValidation),
  ApplicationControllers.updateApplicationStatus,
);

// get single application (job seeker)
router.get(
  "/me/applications/:applicationId",
  auth("user"),
  ApplicationControllers.getSingleApplication,
);

// get applications for a job (recruiter)
router.get(
  "/companies/:companyId/jobs/:jobId/applications",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  ApplicationControllers.getApplicationsForAJob,
);

// ========= ai related routes ==========
router.get(
  "/applications/ai/:jobId/generate-cover-letter",
  auth("user"),
  ApplicationControllers.generateCoverLetter,
);

export const ApplicationRoutes = router;
