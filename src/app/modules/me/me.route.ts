import express from "express";
import auth from "../../middlewares/auth";
import { MeController } from "./me.controller";
const router = express.Router();

// ============== Users model specific routes ==============

// get my account info
router.get("/account", auth("user"), MeController.myAccount);

// get my profile
router.get("/profile", auth("user"), MeController.myProfile);

export const meRoutes = router;
