import express from "express";
import { UserControllers } from "./user.controller";
import validateRequestData from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middlewares/auth";
const router = express.Router();

// create an user
router.post(
  "/create-user",
  validateRequestData(UserValidations.createUserValidationSchema),
  UserControllers.createAnUser
);

// get all users
router.get("/", auth("admin"), UserControllers.getAllUsers);

// get me route
router.get("/getMe", auth("user", "admin"), UserControllers.getMe);

// delete an user
router.delete("/:id", auth("admin"), UserControllers.deleteUser);

// update an user
router.patch(
  "/:id",
  auth("user", "admin"),
  validateRequestData(UserValidations.updateUserValidationsSchema),
  UserControllers.updateUser
);

// change user status
router.post(
  "/change-status/:id",
  auth("admin"),
  validateRequestData(UserValidations.changeUserStatusSchema),
  UserControllers.changeUserStatus
);

export const UserRoutes = router;
