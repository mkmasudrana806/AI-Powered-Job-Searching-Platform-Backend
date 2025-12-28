import z from "zod";

const userNameValidationSchema = z.object({
  firstName: z.string({
    required_error: "First name is required",
  }),
  middleName: z.string().optional(),
  lastName: z.string({
    required_error: "Last name is required",
  }),
});

const createUserValidationSchema = z.object({
  body: z.object({
    name: userNameValidationSchema,
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});

// update user name validation schema
const updateUserNameValidationSchema = userNameValidationSchema.partial();

// update user validations schema
const updateUserValidationsSchema = z.object({
  body: z.object({
    name: updateUserNameValidationSchema.optional(),
  }),
});

// change user status schema
const changeUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "blocked"], {
      required_error: "User status is required",
    }),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
  updateUserValidationsSchema,
  changeUserStatusSchema,
};
