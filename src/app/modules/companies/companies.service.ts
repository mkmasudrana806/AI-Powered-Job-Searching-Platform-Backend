import { ObjectId } from "mongoose";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { TCompany } from "./companies.interface";
import { Company } from "./companies.model";

import slugify from "slugify";
import {
  generateUniqueSlug,
  validateCompanyBusinessRules,
} from "./companies.utils";
import { Types } from "mongoose";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const searchableFields = ["name", "industry"];

// ------------------- create company -------------------
const createCompanyIntoDB = async (payload: TCompany, userId: ObjectId) => {
  // apply business rules
  validateCompanyBusinessRules(payload, userId);

  // generate slug
  const baseSlug = slugify(payload.name, { lower: true, strict: true });
  const slug = await generateUniqueSlug(baseSlug);

  // create company
  const data = {
    ...payload,
    slug,
    createdBy: userId,
    members: [
      {
        userId,
        role: "owner",
      },
    ],
  };
  const result = await Company.create(data);
  return result;
};

/**
 * ------------------- delete company -------------------
 * Soft delete
 */
const deleteCompanyFromDB = async (companyId: string) => {
  await Company.findByIdAndUpdate(companyId, { isDeleted: true });
  return "company is deleted successfully";
};

// ------------------- get all public companies -------------------
const getAllCompaniesFromDB = async (query: Record<string, any>) => {
  const companyQuery = new QueryBuilder(
    Company.find({ isPublic: true, status: "approved" }),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fieldsLimiting();

  const meta = await companyQuery.countTotal();
  const result = await companyQuery.modelQuery;

  return { meta, result };
};

export const CompanyServices = {
  createCompanyIntoDB,
  deleteCompanyFromDB,
  getAllCompaniesFromDB,
};
