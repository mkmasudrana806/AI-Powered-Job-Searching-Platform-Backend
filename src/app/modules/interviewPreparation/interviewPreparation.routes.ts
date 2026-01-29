import express from "express";
import auth from "../../middlewares/auth";
import { InterviewPrepController } from "./interviewPreparation.controller";
import { InterviewPreparationSchema } from "./interviewPreparation.validation";
import validateRequestData from "../../middlewares/validateRequest";
const router = express.Router();

// --------------- interview preparation dashboard generate --------------
router.get(
  "/jobs/:jobId/start-prep",
  auth("user"),
  InterviewPrepController.interviewPrepDashboard,
);

// ------------ practice question of interview prepration -------------
router.post(
  "/practice/:prepId/question/:questionId",
  auth("user"),
  validateRequestData(InterviewPreparationSchema.practiceInterviewQuestion),
  InterviewPrepController.interviewQuestionPractice,
);

export const InterviewPrepRoutes = router;
