import express from "express";
import { UserControllers } from "./user.controller";
import validateRequestData from "../../middlewares/validateRequest";
import { UserValidationSchema } from "./user.validation";
import auth from "../../middlewares/auth";
const router = express.Router();

// --------------- CRUD routes -------------
// create an user
router.post(
  "/",
  validateRequestData(UserValidationSchema.registerUser),
  UserControllers.createAnUser,
);

// get all users
router.get("/", auth("admin"), UserControllers.getAllUsers);

// delete an user
router.delete("/:userId", auth("admin"), UserControllers.deleteUser);

// update an user (status, role)
router.patch("/:id", auth("admin"), UserControllers.updateUser);

// change user status
router.post(
  "/change-status/:id",
  auth("admin"),
  validateRequestData(UserValidationSchema.changeUserStatus),
  UserControllers.changeUserStatus,
);

export const UserRoutes = router;
