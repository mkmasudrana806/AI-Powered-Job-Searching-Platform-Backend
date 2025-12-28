import express from "express";
import { UserRoutes } from "../modules/users/user.routes";
import { AuthRoutes } from "../modules/auth/auth.rotues";
import { JobRoutes } from "../modules/jobs/jobs.routes";
import { CompanyRoutes } from "../modules/companies/companies.routes";
const router = express.Router();

// user
router.use("/users", UserRoutes);

// auth
router.use("/auth", AuthRoutes);

// jobs
router.use("/jobs", JobRoutes);

// companies
router.use("/companies", CompanyRoutes);

export const ApiRoutes = router;
