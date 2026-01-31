import { model, Schema } from "mongoose";
import { TCIQuestion, TQuestion } from "./candidateInterviewQuetions.interface";

const questionSchema = new Schema<TQuestion>({
  question: String,
  gapIdentified: String,
  intent: String,
  expectedLogic: String,
});

// shortlisted candidate's interview question
const candidateInterviewSchema = new Schema<TCIQuestion>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    candidateSummary: {
      type: String,
    },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ["generating", "generated", "failed"],
      default: "generating",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

candidateInterviewSchema.index({ job: 1, candidate: 1 });

const CIQuestion = model<TCIQuestion>("CIQuestion", candidateInterviewSchema);

export default CIQuestion;
