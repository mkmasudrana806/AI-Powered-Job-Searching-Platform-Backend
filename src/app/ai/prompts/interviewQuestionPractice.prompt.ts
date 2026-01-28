const getQuestionPracticePrompt = (
  questionData: any,
  userAnswer: { user_answer: string },
) => {
  const systemPrompt = `
          You are an Expert Interview Evaluator. 
          Analyze the user's answer against the 'Interviewer Intent' and 'Ideal Talking Points'.
          
          SCORING CRITERIA:
          - 80-100: Uses STAR method, mentions specific projects, and hits all keywords.
          - 50-79: Good logic but lacks specific 'Action' or 'Result' metrics.
          - 0-49: Vague, too short, or misses the technical point.
        `;

  const userPrompt = `
          QUESTION: ${questionData.question}
          INTENT: ${questionData.interviewer_intent}
          IDEAL POINTS: ${questionData.ideal_talking_points.join(", ")}
          
          USER'S TYPED ANSWER: 
          "${userAnswer.user_answer}"
          
          Provide a scorecard in JSON format.
        `;

  return { systemPrompt, userPrompt };
};

export default getQuestionPracticePrompt;
