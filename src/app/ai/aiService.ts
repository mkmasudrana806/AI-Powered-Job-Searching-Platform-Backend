import { GoogleGenAI } from "@google/genai";
import config from "../config/env";
import AppError from "../utils/AppError";
import httpStatus from "http-status";
import zodToJsonSchema from "zod-to-json-schema";

// set api key
const GEMINI_API_KEY = config.google_api_key;

// create get ai client
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 *
 * ------------ generate embedding (Job, Profile) ---------------
 *  embedding for semantic search, document ranking, document matching
 *
 * @param text semantic text to generate it's embedding
 */
const generateEmbedding = async (text: string) => {
  try {
    // define model configuration
    const response = await client.models.embedContent({
      model: config.embedding_model_name as string,
      contents: text,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: 768,
      },
    });

    const embeddingRes = response.embeddings ?? [];
    const embeddings = embeddingRes[0].values;
    return embeddings;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error in generating Embedding! with : " + error,
    );
  }
};

/**
 * ---------- generate any content with Gemini ---------------
 *
 * @param userPrompt user prompt
 * @param systemPrompt system prompt (optional)
 * @returns
 */
const generateContent = async (
  systemPrompt: string,
  userPrompt: string,
  responseSchema: any,
): Promise<string> => {
  // system instruction
  const systemIns = {
    role: "system",
    parts: [{ text: systemPrompt }],
  };

  // push user prompt alwasy
  const userIns = {
    role: "user",
    parts: [{ text: userPrompt }],
  };

  const result = await client.models.generateContent({
    model: config.content_generate_model_name as string,
    config: {
      systemInstruction: systemIns,
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(responseSchema),
    },
    contents: [userIns], // content inside array
  });

  // extract content part
  const contentPart = result?.candidates?.[0]?.content?.parts?.[0];

  // return the text part and optionally handle if contentPart is undefined
  const responseText = contentPart?.text ?? "";
  return responseText;
};

const aiServices = {
  generateEmbedding,
  generateContent,
};

export default aiServices;
