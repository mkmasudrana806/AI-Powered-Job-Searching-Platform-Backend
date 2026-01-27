import express from "express";
import auth from "../../middlewares/auth";
import { InterviewPrepController } from "./interviewPreparation.controller";
const router = express.Router();

// --------------- interview preparation dashboard generate --------------
router.get(
  "/jobs/:jobId/create-dashboard",
  auth("user"),
  InterviewPrepController.interviewPrepDashboard,
);

export const InterviewPrepRoutes = router;
