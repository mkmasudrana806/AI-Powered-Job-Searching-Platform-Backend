import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUser, TUser, TUserName } from "./user.interface";
import config from "../../config/env";

const userNameSchema = new Schema<TUserName>({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
});

const userSchema = new Schema<TUser, IUser>(
  {
    name: {
      type: userNameSchema,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ----------- pre middleware hook to hash password -----------
userSchema.pre("save", async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

// ----------- hide password to client response -----------
userSchema.post("save", function (doc) {
  doc.password = "";
});

// ----------- hide password to client response -----------
userSchema.post("find", function (docs) {
  docs.forEach((doc: TUser) => {
    doc.password = "";
  });
});

// ----------- hide password to client response -----------
userSchema.post("findOneAndUpdate", function (doc) {
  doc.password = "";
});

// ----------- isPasswordMatch statics methods -----------
userSchema.statics.isPasswordMatch = async function (
  plainPassword: string,
  hashedPassword: string
) {
  const result = await bcrypt.compare(plainPassword, hashedPassword);
  return result;
};

// ----------- check is jwt issued before password change -----------
userSchema.statics.isJWTIssuedBeforePasswordChange = function (
  passwordChangedTimestamp: Date,
  jwtIssuedtimestamp: number
) {
  // UTC datetime to milliseconds
  const passwordChangedtime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedtime > jwtIssuedtimestamp;
};

// make a model and export
export const User = model<TUser, IUser>("Users", userSchema);
