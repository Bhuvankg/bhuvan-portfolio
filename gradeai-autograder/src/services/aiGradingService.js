/**
 * AI Auto-Grading Service for GradeAI
 * Handles MCQ evaluation and AI-assisted Short-Answer semantic evaluation
 */

/**
 * Normalizes text for semantic processing
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into word array, removing common filler stopwords
 */
function tokenize(text) {
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'it', 'this',
    'that', 'these', 'those', 'from', 'be', 'been', 'being', 'have', 'has'
  ]);
  return normalizeText(text)
    .split(' ')
    .filter(word => word.length > 2 && !stopwords.has(word));
}

/**
 * Computes Jaccard Similarity between two token sets
 */
function computeJaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Generates n-gram shingles (e.g. 2-word, 3-word combinations)
 */
function getNGrams(tokens, n = 2) {
  const shingles = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    shingles.push(tokens.slice(i, i + n).join(' '));
  }
  return shingles;
}

/**
 * Evaluates Multiple Choice Questions (MCQs)
 */
function gradeMCQ(question, selectedOption, correctOption) {
  const maxScore = Number(question.marks) || 10;
  const isCorrect = selectedOption && correctOption && selectedOption.id === correctOption.id;

  return {
    scoreAwarded: isCorrect ? maxScore : 0,
    maxScore: maxScore,
    evaluatorType: 'auto_mcq',
    aiSuggestedScore: isCorrect ? maxScore : 0,
    confidenceLevel: 'high',
    matchedConcepts: isCorrect ? `Selected correct option (${correctOption.option_letter})` : '',
    missingConcepts: !isCorrect ? `Correct option was (${correctOption.option_letter}): ${correctOption.option_text}` : '',
    reasoning: isCorrect
      ? `Student selected the correct answer (${correctOption.option_letter}). ${question.explanation || ''}`
      : `Student selected option ${selectedOption ? selectedOption.option_letter : 'None'}, but correct answer is ${correctOption ? correctOption.option_letter : 'N/A'}. ${question.explanation || ''}`,
    isApproved: true
  };
}

/**
 * Built-in Semantic & Rubric Evaluation Engine for Short Answers
 * Runs deterministically with zero external dependencies when API key is absent
 */
function evaluateShortAnswerBuiltIn(question, studentAnswer, rubricCriteria = []) {
  const maxMarks = Number(question.marks) || 10;
  const answerText = studentAnswer || '';
  const refText = question.reference_answer || '';
  const keywordsRaw = question.keywords || '';

  // Edge Case: Empty Answer
  if (!answerText.trim()) {
    return {
      scoreAwarded: 0,
      maxScore: maxMarks,
      evaluatorType: 'ai',
      aiSuggestedScore: 0,
      confidenceLevel: 'high',
      matchedConcepts: '',
      missingConcepts: 'No response submitted',
      reasoning: 'The student did not provide an answer for this question.',
      constructiveFeedback: 'Attempt answering by identifying the core definition and providing examples.',
      isApproved: false
    };
  }

  const studentTokens = tokenize(answerText);
  const refTokens = tokenize(refText);

  // 1. Keyword & Concept Analysis
  const targetKeywords = keywordsRaw
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  const matchedKeywordsList = [];
  const missingKeywordsList = [];
  const normalizedStudent = normalizeText(answerText);

  for (const kw of targetKeywords) {
    const normKw = normalizeText(kw);
    // Check direct substring or token stems
    if (normalizedStudent.includes(normKw) || studentTokens.some(t => normKw.includes(t) || t.includes(normKw))) {
      matchedKeywordsList.push(kw);
    } else {
      missingKeywordsList.push(kw);
    }
  }

  const keywordCoverage = targetKeywords.length > 0
    ? matchedKeywordsList.length / targetKeywords.length
    : 0.7;

  // 2. N-Gram & Shingle Semantic Overlap
  const studentShingles = getNGrams(studentTokens, 2);
  const refShingles = getNGrams(refTokens, 2);
  const shingleSim = computeJaccardSimilarity(studentShingles, refShingles);
  const tokenSim = computeJaccardSimilarity(studentTokens, refTokens);

  // 3. Length & Substance Heuristic
  const refWordCount = refTokens.length || 20;
  const studentWordCount = studentTokens.length;
  const lengthRatio = Math.min(1.0, studentWordCount / Math.max(10, refWordCount * 0.7));

  // 4. Combined Semantic Quality Score (0.0 to 1.0)
  // Weights: Keyword/Concept coverage (50%), Token/Shingle overlap (30%), Substance/Length (20%)
  const compositeScore = (keywordCoverage * 0.50) + ((tokenSim * 0.6 + shingleSim * 0.4) * 0.30) + (lengthRatio * 0.20);

  // Scale to question max marks
  let suggestedPoints = Math.round(compositeScore * maxMarks * 10) / 10;
  if (suggestedPoints > maxMarks) suggestedPoints = maxMarks;
  if (suggestedPoints < 0) suggestedPoints = 0;

  // Confidence Level Determination
  let confidence = 'high';
  if (studentWordCount < 5 || targetKeywords.length === 0) {
    confidence = 'medium';
  } else if (compositeScore > 0.35 && compositeScore < 0.65) {
    confidence = 'medium';
  }

  // Constructive Feedback & Reasoning Generation
  let reasoning = '';
  let constructiveFeedback = '';

  if (suggestedPoints >= maxMarks * 0.85) {
    reasoning = `Excellent answer demonstrating comprehensive mastery. Successfully addressed core concepts: ${matchedKeywordsList.slice(0, 3).join(', ')}.`;
    constructiveFeedback = 'Great technical precision! You accurately captured the underlying principles and terminology.';
  } else if (suggestedPoints >= maxMarks * 0.60) {
    reasoning = `Good foundation with partial conceptual coverage. Matched key ideas (${matchedKeywordsList.join(', ')}), but missed nuances: ${missingKeywordsList.slice(0, 2).join(', ')}.`;
    constructiveFeedback = `To achieve full marks, elaborate further on ${missingKeywordsList.length ? missingKeywordsList.slice(0, 2).join(' and ') : 'the theoretical mechanism'} and state the practical implications.`;
  } else if (suggestedPoints > 0) {
    reasoning = `Minimal conceptual coverage. The answer touches on ${matchedKeywordsList.length ? matchedKeywordsList.join(', ') : 'general topic'}, but omits critical components: ${missingKeywordsList.join(', ')}.`;
    constructiveFeedback = `Review the core definitions: ${missingKeywordsList.slice(0, 3).join(', ')}. Structure your explanation step-by-step.`;
  } else {
    reasoning = 'The response does not demonstrate understanding of the required concepts or key criteria.';
    constructiveFeedback = 'Consult the lecture notes and reference materials on this topic before re-attempting.';
  }

  return {
    scoreAwarded: suggestedPoints,
    maxScore: maxMarks,
    evaluatorType: 'ai',
    aiSuggestedScore: suggestedPoints,
    confidenceLevel: confidence,
    matchedConcepts: matchedKeywordsList.join(', ') || 'General domain awareness',
    missingConcepts: missingKeywordsList.join(', ') || 'None identified',
    reasoning: reasoning,
    constructiveFeedback: constructiveFeedback,
    isApproved: false
  };
}

/**
 * Evaluates Short Answer using Google Gemini API if GEMINI_API_KEY is configured
 */
async function evaluateShortAnswerWithGemini(question, studentAnswer, rubricCriteria = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    return evaluateShortAnswerBuiltIn(question, studentAnswer, rubricCriteria);
  }

  try {
    const prompt = `
You are an expert university professor evaluating an assignment question for a student.
Be fair, objective, rigorous, and constructive.

QUESTION DETAILS:
Prompt: ${question.prompt}
Maximum Marks: ${question.marks}
Reference Answer: ${question.reference_answer || 'N/A'}
Key Concepts & Keywords: ${question.keywords || 'N/A'}
Rubric Criteria: ${JSON.stringify(rubricCriteria)}

STUDENT'S SUBMITTED ANSWER:
"${studentAnswer || '[Empty Answer]'}"

EVALUATION INSTRUCTIONS:
1. Compare student answer conceptually with the reference answer and key concepts.
2. Award partial credit objectively based on how many core ideas were conveyed.
3. Determine confidence level: "high" if evaluation is straightforward, "medium" if ambiguous or borderline, "low" if uncertain.
4. Provide structured output in VALID JSON format with exact keys:
{
  "score": <number between 0 and ${question.marks}>,
  "confidence": "high" | "medium" | "low",
  "matched_concepts": [<list of key concepts present>],
  "missing_concepts": [<list of key concepts missing or incorrect>],
  "reasoning": "<concise paragraph explaining score>",
  "constructive_feedback": "<specific actionable guidance for student improvement>"
}
Only output the JSON object without markdown fences or additional commentary.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      console.warn(`[GradeAI AI] Gemini API call returned ${response.status}. Falling back to built-in semantic engine.`);
      return evaluateShortAnswerBuiltIn(question, studentAnswer, rubricCriteria);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return evaluateShortAnswerBuiltIn(question, studentAnswer, rubricCriteria);
    }

    const cleanJson = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const maxMarks = Number(question.marks) || 10;
    const finalScore = Math.min(maxMarks, Math.max(0, Number(parsed.score) || 0));

    return {
      scoreAwarded: finalScore,
      maxScore: maxMarks,
      evaluatorType: 'ai',
      aiSuggestedScore: finalScore,
      confidenceLevel: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'high',
      matchedConcepts: Array.isArray(parsed.matched_concepts) ? parsed.matched_concepts.join(', ') : String(parsed.matched_concepts || ''),
      missingConcepts: Array.isArray(parsed.missing_concepts) ? parsed.missing_concepts.join(', ') : String(parsed.missing_concepts || ''),
      reasoning: parsed.reasoning || 'Evaluated with Gemini AI.',
      constructiveFeedback: parsed.constructive_feedback || 'Keep up the good work.',
      isApproved: false
    };
  } catch (error) {
    console.warn(`[GradeAI AI] Error invoking Gemini API (${error.message}). Using built-in semantic evaluator fallback.`);
    return evaluateShortAnswerBuiltIn(question, studentAnswer, rubricCriteria);
  }
}

/**
 * Master Evaluation Entrypoint
 */
async function gradeQuestion(question, studentAnswerRecord, allOptions = [], rubricCriteria = []) {
  if (question.question_type === 'mcq') {
    const selectedOption = allOptions.find(o => o.id === studentAnswerRecord.selected_option_id);
    const correctOption = allOptions.find(o => o.question_id === question.id && o.is_correct === 1);
    return gradeMCQ(question, selectedOption, correctOption);
  } else {
    return evaluateShortAnswerWithGemini(question, studentAnswerRecord.answer_text, rubricCriteria);
  }
}

module.exports = {
  gradeMCQ,
  evaluateShortAnswerBuiltIn,
  evaluateShortAnswerWithGemini,
  gradeQuestion
};
