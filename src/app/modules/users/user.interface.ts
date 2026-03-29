import { Model } from "mongoose";

// ---------- user interface and type definition ---------
export type TUser = {
  email: string;
  password: string;
  passwordChangedAt: Date;
  status: "active" | "blocked";
  role: "user" | "admin";
  isDeleted: boolean;
};

// statics methods to check isPasswordMatch
export interface IUser extends Model<TUser> {
  isPasswordMatch(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;

  //check if the jwt issued before password change
  isJWTIssuedBeforePasswordChange(
    passwordChangedTimestamp: Date,
    jwtIssuedtimestamp: number,
  ): boolean;
}
