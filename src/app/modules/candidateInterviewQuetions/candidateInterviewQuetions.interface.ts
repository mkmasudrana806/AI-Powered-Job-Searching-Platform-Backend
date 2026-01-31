import { Types } from "mongoose";

// candidate (C), Interview(I), Question
export type TQuestion = {
  question: string;
  gapIdentified: string;
  intent: string;
  expectedLogic: string;
};

export type TCIQuestion = {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  candidateSummary?: string;
  questions?: [TQuestion];
  status: "generating" | "generated" | "failed";
};
