/**
 * --------- find two matching percentage based on two vector ---------
 * @param a vector a
 * @param b vector b
 * @returns percentage
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  // conver to fixed size and number type and percentage
  const matchingScore =
    Number((dot / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(4)) * 100;

  return matchingScore;
};

export default cosineSimilarity;
