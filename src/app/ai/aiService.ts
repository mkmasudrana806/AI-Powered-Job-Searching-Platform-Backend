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

const aiServices = {
  generateEmbedding,
};

export default aiServices;
