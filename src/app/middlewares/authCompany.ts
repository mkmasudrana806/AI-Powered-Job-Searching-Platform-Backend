import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { Company } from "../modules/companies/companies.model";
import { Types } from "mongoose";

const requireCompanyAccess = (...requireRoles: string[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // get companyId from params
      const { companyId } = req.params;

      if (!companyId) {
        throw new AppError(400, "Company ID is required in params");
      }

      // check company is exists
      const company = await Company.findOne(
        { _id: companyId, isDeleted: false },
        { status: 1, members: 1, isDeleted: 1 }
      );
      if (!company) {
        throw new AppError(404, "Your requested company is not found");
      }

      // check company is approved
      if (company.status !== "approved") {
        throw new AppError(403, "Company is not approved");
      }

      if (company.isDeleted) {
        throw new AppError(404, "Company not found");
      }

      // check user is the member of the company
      const userId = req.user?.userId;
      const member =
        company.members?.length > 0 &&
        company?.members?.find((m) => m.userId.toString() === userId);
      if (!member) {
        throw new AppError(403, "You are not a member of this company");
      }

      // check user has required role
      if (requireRoles.length > 0 && !requireRoles.includes(member.role)) {
        throw new AppError(
          403,
          `You have no permission as ${member.role === "owner" ? "an" : "a"} ${
            member.role
          }`
        );
      }

      req.company = {
        companyId: company._id,
        companyMembers: company.members,
        userRoleInCompany: member.role,
      };
      next();
    }
  );
};

export default requireCompanyAccess;
