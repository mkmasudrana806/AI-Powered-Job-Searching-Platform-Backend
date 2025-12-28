import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { CompanyServices } from "./companies.service";

// ------------------- create company -------------------
const createCompany = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const result = await CompanyServices.createCompanyIntoDB(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Company created successfully and pending approval",
    data: result,
  });
});

/**
 * ------------------- delete company -------------------
 * Only owner can delete company
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  await CompanyServices.deleteCompanyFromDB(companyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Company deleted successfully",
    data: null,
  });
});

// ------------------- get all companies -------------------
const getAllCompanies = asyncHandler(async (req, res) => {
  const { meta, result } = await CompanyServices.getAllCompaniesFromDB(
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Companies retrieved successfully",
    meta,
    data: result,
  });
});

export const CompanyControllers = {
  createCompany,
  deleteCompany,
  getAllCompanies,
};
