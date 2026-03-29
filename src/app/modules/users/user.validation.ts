import z from "zod";

// user register schema
const registerUser = z.object({
  body: z.object({
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

// change user status schema
const changeUserStatus = z.object({
  body: z.object({
    status: z.enum(["active", "blocked"], {
      required_error: "User status is required",
    }),
  }),
});

export const UserValidationSchema = {
  registerUser,
  changeUserStatus,
};
