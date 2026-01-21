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

  const dinominator = Math.sqrt(normA) * Math.sqrt(normB);

  // avoid division by zero
  if (dinominator === 0) return 0;

  const rawSimilarity = dot / dinominator;

  // conver to fixed size and number type and percentage
  const matchingScore = Number((rawSimilarity * 100).toFixed(2));

  return matchingScore;
};

export default cosineSimilarity;
