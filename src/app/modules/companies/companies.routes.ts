import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CompanyControllers } from "./companies.controller";
import { CompanyValidations } from "./companies.validation";
import requireCompanyAuth from "../../middlewares/authCompany";

const router = express.Router();

// create company (authenticated user)
router.post(
  "/create-company",
  auth("user"),
  validateRequest(CompanyValidations.createCompanyValidationSchema),
  CompanyControllers.createCompany
);

/**
 * DELETE company (owner only)
 */
router.delete(
  "/:companyId",
  auth("user"),
  requireCompanyAuth("owner"),
  CompanyControllers.deleteCompany
);

// get all public approved companies
router.get("/", CompanyControllers.getAllCompanies);

export const CompanyRoutes = router;
