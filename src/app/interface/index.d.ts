import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import { TCompany, TCompanyMiddlewareData } from "../modules/companies/companies.interface";

// add user property to Request object
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      company: TCompanyMiddlewareData;
    }
  }
}
