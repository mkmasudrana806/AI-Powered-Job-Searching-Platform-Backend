import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { JobControllers } from "./jobs.controller";
import { JobValidations } from "./jobs.validation";

const router = express.Router();

// create job
router.post(
  "/create-job",
//   auth("admin"),
  validateRequest(JobValidations.createJobValidationSchema),
  JobControllers.createJob
);

// get all jobs
// router.get("/", JobControllers.getAllJobs);

export const JobRoutes = router;
