import { Types } from "mongoose";
import { Application } from "../../modules/applications/applications.model";

/**
 * ------------ fetch application details with job and profile ------------
 *
 * @param applicationId applicant id for getting details
 * @returns found application data
 */
export const getApplicationDetails = async (applicationId: string) => {
  const pipeline = [
    // find application
    {
      $match: {
        _id: new Types.ObjectId(applicationId),
      },
    },

    // join job
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    // join user profile
    {
      $lookup: {
        from: "userprofiles",
        localField: "applicant",
        foreignField: "user",
        as: "profile",
      },
    },
    { $unwind: "$profile" }
  ];

  const result = await Application.aggregate(pipeline);
  const application = result[0];

  return application;
};
