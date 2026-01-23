import salaryPredictionQueue from "../../jobs/queues/salaryPrediction.queue";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import SalaryPrediction from "./salaryPrediction.model";

const salaryPrediction = async (userId: string) => {
  // validate user id
  validateObjectIDs({ name: "userId", value: userId });

  // check if already salary predicted
  let predicted = await SalaryPrediction.findOne({ user: userId });

  // if status=completed, return result
  if (predicted?.status === "completed") {
    return predicted;
  }

  // if processing, return status
  if (predicted?.status === "processing") {
    return predicted;
  }

  // as neither processing nor completed.
  // means user 1st time or previous prediction 'invalidate' by idle status
  if (!predicted) {
    predicted = new SalaryPrediction({
      startedAt: new Date(),
      status: "processing",
      user: userId,
    });
  } else {
    predicted.status = "processing";
    predicted.startedAt = new Date();
  }

  await predicted.save();

  // now submit background job for prediction
  // whenever it get completed, set status completed and prediction data
  // when user change profile data and embedding changed, then set status to 'idle'
  salaryPredictionQueue.add(
    "salary-prediction",
    { userId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return predicted;
};

export const SalaryPredictionService = {
  salaryPrediction,
};
