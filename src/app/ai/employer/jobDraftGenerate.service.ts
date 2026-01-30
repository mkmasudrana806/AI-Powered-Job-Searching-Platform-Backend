// TODO: ai metrics like token count, latency model store in DB for all AI generation

import httpStatus from "http-status";
import { Company } from "../../modules/companies/companies.model";
import AppError from "../../utils/AppError";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import getJobPostAssistantPrompt from "../prompts/jobPostAssistant.prompt";
import { countryCurrencyMap } from "../../utils/countryCurrencyMap";
import aiServices from "../aiService";
import { AiResponseSchema } from "../aiResponseSchema";

const generateJobDraftService = async (
  companyId: string,
  userInput: string,
) => {
  validateObjectIDs({ name: "companyId", value: companyId });

  // fetch company for that user
  const company = await Company.findById(companyId);
  // throw error is company is not approved or not found
  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found!");
  } else if (company?.status !== "approved") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can generate, because your company is ${company?.status}`,
    );
  }

  // get company location. it help more precise job draft generation
  const location = {
    city: company.location?.city || "Remote/Global",
    country: company.location?.country || "International",
    officeAddress: company.location?.officeAddress || "Remote",
  };

  // currency extract
  const currency = company.location?.country
    ? countryCurrencyMap[company.location.country]
    : "USD";

  // generate prompt
  const { systemPrompt, userPrompt } = getJobPostAssistantPrompt(
    userInput,
    location,
    currency,
  );

  // generate job post draft
  const aiResponse = await aiServices.generateContent(
    systemPrompt,
    userPrompt,
    AiResponseSchema.aiJobPostAssistant,
  );

  return {
    ...JSON.parse(aiResponse),
    status: "draft",
  };
};

export default generateJobDraftService;
