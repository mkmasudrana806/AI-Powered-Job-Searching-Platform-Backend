import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CompanyControllers } from "./companies.controller";
import { CompanyValidations } from "./companies.validation";
import requireCompanyAccess from "../../middlewares/authCompany";

const router = express.Router();

// create company
router.post(
  "/create-company",
  auth("user"),
  validateRequest(CompanyValidations.createCompanyValidationSchema),
  CompanyControllers.createCompany
);

// DELETE company
router.delete(
  "/:companyId",
  auth("user"),
  requireCompanyAccess("owner"),
  CompanyControllers.deleteCompany
);

// Update company
router.patch(
  "/:companyId",
  auth("user"),
  requireCompanyAccess("owner"),
  validateRequest(CompanyValidations.updateCompanyValidationSchema),
  CompanyControllers.updateCompany
);

// Add recruiter
router.post(
  "/:companyId/recruiters",
  auth("user"),
  requireCompanyAccess("owner"),
  validateRequest(CompanyValidations.addRecruiterValidationSchema),
  CompanyControllers.addRecruiter
);

// Remove recruiter
router.delete(
  "/:companyId/recruiters/:userId",
  auth("user"),
  requireCompanyAccess("owner"),
  CompanyControllers.removeRecruiter
);

// get all public approved companies
router.get("/", CompanyControllers.getAllCompanies);

export const CompanyRoutes = router;
