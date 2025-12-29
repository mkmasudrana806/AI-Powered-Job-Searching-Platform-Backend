import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { CompanyServices } from "./companies.service";
import { ObjectId } from "mongoose";

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
 * 
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const companyId = req.company.companyId;
  await CompanyServices.deleteCompanyFromDB(companyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Company deleted successfully",
    data: null,
  });
});

/**
 * ------------------- update company -------------------
 */
const updateCompany = asyncHandler(async (req, res) => {
  const companyId = req.company.companyId;
  const data = req.body;
  const updated = await CompanyServices.updateCompanyIntoDB(companyId, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Company updated successfully",
    data: updated,
  });
});

/**
 * ------------------- add recruiter -------------------
 */
const addRecruiter = asyncHandler(async (req, res) => {
  const company = req.company;
  const { userId } = req.body;

  const updated = await CompanyServices.addRecruiterIntoDB(company, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recruiter added successfully",
    data: updated,
  });
});

/**
 * ------------------- remove recruiter -------------------
 */
const removeRecruiter = asyncHandler(async (req, res) => {
  const company = req.company;
  const { userId } = req.params;

  const updated = await CompanyServices.removeRecruiterFromDB(company, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recruiter removed successfully",
    data: updated,
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
  updateCompany,
  addRecruiter,
  removeRecruiter,
  getAllCompanies,
};
