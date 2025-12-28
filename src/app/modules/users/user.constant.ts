import { TUser } from "./user.interface";

// allowed fields to update user
export const allowedFieldsToUpdate: (keyof TUser)[] = ["name"];

// search able fields to search
export const searchableFields = ["name.firstName", "email", "address"];
