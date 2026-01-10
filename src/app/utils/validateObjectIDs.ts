import { Types } from "mongoose";
import AppError from "./AppError";
import httpStatus from "http-status";

type TValidateObjectIDs = {
  name: string;
  value: string;
};
export const validateObjectIDs = (...ids: TValidateObjectIDs[]) => {
  for (const { name, value } of ids) {
    if (!name || !value || !Types.ObjectId.isValid(value)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${value}`);
    }
  }
};
