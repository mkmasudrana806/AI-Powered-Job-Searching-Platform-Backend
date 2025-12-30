
import { ObjectId } from "mongoose";
import { TCompany, TCompanyMiddlewareData } from "../modules/companies/companies.interface";
import { TJwtPayload } from "../modules/auth/auth.interface";

// add user property to Request object
declare global {
  namespace Express {
    interface Request {
      user: TJwtPayload;
      company: TCompanyMiddlewareData;
    }
  }

}
