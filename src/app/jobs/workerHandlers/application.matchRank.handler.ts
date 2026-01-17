import { Types } from "mongoose";
import { Application } from "../../modules/applications/applications.model";

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
    { $unwind: "$profile" },

    // select required filed
    {
      $project: {
        _id: 1,
        appliedAt: 1,
        status: 1,
        matchScore: 1,
        rankingScore: 1,
        aiNotes: 1,
        resumeUrl: 1,

        applicantProfileSnapshot: 1,

        "job._id": 1,
        "job.title": 1,
        "job.experienceLevel": 1,
        "job.location": 1,
        "job.embedding": 1,

        "profile.headline": 1,
        "profile.skills": 1,
        "profile.totalYearsOfExperience": 1,
        "profile.location": 1,
        "profile.embedding": 1,
      },
    },
  ];

  const result = await Application.aggregate(pipeline);
  const application = result[0];

  return application;
};
