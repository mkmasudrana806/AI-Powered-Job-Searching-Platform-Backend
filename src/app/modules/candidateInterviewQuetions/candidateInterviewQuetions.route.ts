import express from "express";
import auth from "../../middlewares/auth";
import requireCompanyAccess from "../../middlewares/authCompany";
import { CIQuestionValidation } from "./candidateInterviewQuestions.validation";
import validateRequestData from "../../middlewares/validateRequest";
import { CIQuestionController } from "./candidateInterviewQuetions.controller";
const router = express.Router();

// candidate specific interview question generation
router.post(
  "/companies/:companyId/job/:jobId",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  validateRequestData(CIQuestionValidation.CIQuestion),
  CIQuestionController.CIQuestionsGenerate,
);

// get all individual interview questions set
router.get(
  "/companies/:companyId/job/:jobId/interview-questions",
  auth("user"),
  requireCompanyAccess("owner", "recruiter"),
  CIQuestionController.getIndividualInterviewQuestions,
);

export const CIQuestionRoutes = router;
