import { ObjectId } from "mongoose";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import {
  TCompany,
  TCompanyMiddlewareData,
  TCompanyUpdate,
} from "./companies.interface";
import { Company } from "./companies.model";

import slugify from "slugify";
import {
  generateUniqueSlug,
  validateCompanyBusinessRules,
} from "./companies.utils";
import { Types } from "mongoose";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { User } from "../users/user.model";

const searchableFields = ["name", "industry"];

/**
 *------------------- create company -------------------
 *
 * @param payload company creation data
 * @param userId who will create company
 * @returns newly created company data
 */
const createCompanyIntoDB = async (payload: TCompany, userId: string) => {
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
 * @param companyId company to be deleted
 * @returns success message
 */
const deleteCompanyFromDB = async (companyId: Types.ObjectId) => {
  await Company.findByIdAndUpdate(companyId, { isDeleted: true });
  return "company is deleted successfully";
};

/**
 * ------------------- update company -------------------
 * @param companyId company to be updated
 * @param payload update data
 * @returns updated company
 */
const updateCompanyIntoDB = async (
  companyId: Types.ObjectId,
  payload: TCompanyUpdate
) => {
  const updated = await Company.findByIdAndUpdate(companyId, payload, {
    new: true,
  });
  return updated;
};

/**
 * ------------------- add recruiter -------------------
 * @param company company to which recruiter will be added
 * @param userId userId of the recruiter to be added
 * @returns updated company
 */
const addRecruiterIntoDB = async (
  company: TCompanyMiddlewareData,
  userId: string
) => {
  // check user exists
  const userExists = await User.exists({
    _id: userId,
    isDeleted: false,
    status: "active",
  });
  if (!userExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // check user is already a member
  const alreadyMember = company.companyMembers.some((m: any) =>
    userExists._id.equals(m.userId)
  );

  if (alreadyMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is already a company member"
    );
  }

  const result = await Company.findByIdAndUpdate(
    company.companyId,
    {
      $push: {
        members: { userId, role: "recruiter" },
      },
    },
    { new: true }
  );

  return result;
};

/**
 * ------------------- remove recruiter -------------------
 */
const removeRecruiterFromDB = async (
  company: TCompanyMiddlewareData,
  userId: string
) => {
  const memberIndex = company.companyMembers.findIndex(
    (m: any) => m.userId.toString() === userId
  );

  if (memberIndex === -1) {
    throw new AppError(httpStatus.NOT_FOUND, "Recruiter not found in company");
  }

  if (company.companyMembers[memberIndex].role === "owner") {
    throw new AppError(httpStatus.BAD_REQUEST, "Owner cannot be removed");
  }

  await Company.findByIdAndUpdate(
    company.companyId,
    { $pull: { members: { userId } } },
    { new: true }
  );
  return "Recruiter removed successfully";
};

/**
 * ------------------- get all public companies -------------------
 */
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
  updateCompanyIntoDB,
  addRecruiterIntoDB,
  removeRecruiterFromDB,
  getAllCompaniesFromDB,
};
