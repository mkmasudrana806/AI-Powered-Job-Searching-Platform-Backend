import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { SalaryPredictionService } from "./salaryPrediction.service";

/**
 * ------------- resume analysis (resume doctor) -------------
 */
const salaryPrediction = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const result = await SalaryPredictionService.salaryPrediction(userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Salary prediction is: ${result}`,
    data: result,
  });
});

export const SalaryPredictionController = {
  salaryPrediction,
};
