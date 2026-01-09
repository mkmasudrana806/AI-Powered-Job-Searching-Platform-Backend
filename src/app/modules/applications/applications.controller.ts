import { application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { ApplicationServices } from "./applications.service";

/**
 * ------------------ apply job ------------------
 */
const applyJob = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const applicantId = req.user.userId;
  const payload = req.body;
  const result = await ApplicationServices.applyJobIntoDB(
    jobId,
    applicantId,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

/**
 * -------------------- get my applications -------------------
 */
const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const applicantId = req.user.userId;
  const query = req.query;
  const { meta, result } = await ApplicationServices.getMyApplicationsFromDB(
    applicantId,
    query
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Applications retrived successfully",
    meta: meta,
    data: result,
  });
});

/**
 * -------------------- withdrawn Application ----------------
 */
const withdrawApplication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const applicantId = req.user.userId;
    const applicationId = req.params.applicationId;

    const result = await ApplicationServices.withdrawApplicationFromDB(
      applicationId,
      applicantId
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Applications withdrawn successfully",
      data: result,
    });
  }
);

/**
 * -------------------- withdrawn Application ----------------
 */
const getApplicationsForAJob = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params.companyId;
    const jobId = req.params.jobId;
    const query = req.query;

    const { data, meta } =
      await ApplicationServices.getApplicationsForAJobFromDB(
        companyId,
        jobId,
        query
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Applications retrived successfully",
      meta: meta,
      data: data,
    });
  }
);

/**
 * -------------------- update Application status ----------------
 */
const updateApplicationStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params.companyId;
    const applicationId = req.params.applicationId;
    const payload = req.body;
    const userId = req.user.userId;

    const result = await ApplicationServices.updateApplicationStatusIntoDB(
      companyId,
      applicationId,
      userId,
      payload
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Applications status changed successfully",
      data: result,
    });
  }
);

/**
 * --------------- get my single application details -------------------
 */
const getSingleApplication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.userId;

    const result = await ApplicationServices.getMySingleApplicationFromDB(
      applicationId,
      userId
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Application details retrieved successfully",
      data: result,
    });
  }
);

export const ApplicationControllers = {
  applyJob,
  getMyApplications,
  withdrawApplication,
  getApplicationsForAJob,
  updateApplicationStatus,
  getSingleApplication,
};
