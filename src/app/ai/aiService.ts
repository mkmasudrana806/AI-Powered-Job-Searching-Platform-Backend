import { GoogleGenAI } from "@google/genai";
import config from "../config/env";
import AppError from "../utils/AppError";
import httpStatus from "http-status";

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
const generateContent = async (userPrompt: string, systemPrompt?: string) => {
  // system instruction
  const systemIns = systemPrompt
    ? {
        role: "system",
        parts: [{ text: systemPrompt }],
      }
    : undefined;

  // push user prompt alwasy
  const userIns = {
    role: "user",
    parts: [{ text: userPrompt }],
  };

  const result = await client.models.generateContent({
    model: config.content_generate_model_name as string,
    config: {
      systemInstruction: systemIns,
    },
    contents: userIns,
  });

  const content = result?.candidates?.[0].content?.parts;
  return content?.[0];
};

const aiServices = {
  generateEmbedding,
  generateContent,
};

export default aiServices;
