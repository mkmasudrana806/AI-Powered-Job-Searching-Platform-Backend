import express from "express";
import { UserRoutes } from "../modules/users/user.routes";
import { AuthRoutes } from "../modules/auth/auth.rotues";
import { JobRoutes } from "../modules/jobs/jobs.routes";
import { CompanyRoutes } from "../modules/companies/companies.routes";
import { ApplicationRoutes } from "../modules/applications/applications.routes";
import { UserProfileRoutes } from "../modules/userProfile/userProfile.routes";
const router = express.Router();

// user
router.use("/users", UserRoutes);

// auth
router.use("/auth", AuthRoutes);

// jobs
router.use("/", JobRoutes);

// companies
router.use("/companies", CompanyRoutes);

// applications
router.use("/", ApplicationRoutes);

// user profile
router.use("/", UserProfileRoutes);

export const ApiRoutes = router;
