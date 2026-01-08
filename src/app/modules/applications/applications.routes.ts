import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequestData from "../../middlewares/validateRequest";
import { ApplicationValidations } from "./applications.validation";
import { ApplicationControllers } from "./applications.controller";
const router = Router();

// job seeker
router.post(
  "/jobs/:jobId/applications",
  auth("user"),
  validateRequestData(ApplicationValidations.applyJobValidationSchema),
  ApplicationControllers.applyJob
);

router.get(
  "/me/applications"
  // auth("user"),
  // ApplicationControllers.getMyApplications
);

// application lifecycle
router.patch(
  "/applications/:applicationId/withdraw"
  // auth("user"),
  // ApplicationControllers.withdrawApplication
);

router.patch(
  "/applications/:applicationId/status",
  auth("user")
  // requireCompanyAccess("owner", "recruiter"),
  // // validateRequest(ApplicationValidations.updateApplicationStatusValidationSchema),
  // ApplicationControllers.updateApplicationStatus
);

router.get(
  "/applications/:applicationId"
  // auth("user"),
  // ApplicationControllers.getSingleApplication
);

// recruiter
router.get(
  "/companies/:companyId/jobs/:jobId/applications",
  auth("user")
  // requireCompanyAccess("owner", "recruiter"),
  // ApplicationControllers.getJobApplications
);

export const ApplicationRoutes = router;
