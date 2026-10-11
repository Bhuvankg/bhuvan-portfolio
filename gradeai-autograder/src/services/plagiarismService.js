/**
 * Plagiarism Analysis & Cross-Submission Comparison Service
 * Compares student answers across peer submissions and reference materials
 */

function cleanText(text) {
  if (!text) return '';
  return text.trim();
}

function normalizeForComparison(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates 3-word shingles from normalized text
 */
function createShingles(text, k = 3) {
  const words = normalizeForComparison(text).split(' ').filter(w => w.length > 0);
  if (words.length < k) {
    return new Set(words);
  }
  const shingles = new Set();
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return shingles;
}

/**
 * Calculates Jaccard similarity percentage between two texts (0.0 to 100.0)
 */
function calculateJaccardSimilarity(textA, textB) {
  const setA = createShingles(textA, 3);
  const setB = createShingles(textB, 3);

  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const shingle of setA) {
    if (setB.has(shingle)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  if (unionSize === 0) return 0.0;

  const simRatio = intersectionCount / unionSize;
  return Math.round(simRatio * 1000) / 10; // e.g. 84.5%
}

/**
 * Splits text into sentences/phrases to locate matching passages
 */
function extractSentences(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.?!])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);
}

/**
 * Identifies shared sentences or continuous phrases between two texts
 */
function findMatchingExcerpts(textA, textB) {
  const sentencesA = extractSentences(textA);
  const sentencesB = extractSentences(textB);
  const matches = [];

  for (const sentA of sentencesA) {
    const normA = normalizeForComparison(sentA);
    if (normA.split(' ').length < 4) continue;

    for (const sentB of sentencesB) {
      const normB = normalizeForComparison(sentB);
      if (normB.split(' ').length < 4) continue;

      // Exact sentence overlap or high substring similarity
      if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
        matches.push({
          excerptA: sentA,
          excerptB: sentB,
          matchType: 'exact_clause'
        });
        break;
      } else {
        // High shingle similarity for modified phrasing
        const sim = calculateJaccardSimilarity(sentA, sentB);
        if (sim >= 60.0) {
          matches.push({
            excerptA: sentA,
            excerptB: sentB,
            matchType: 'near_duplicate',
            similarity: sim
          });
          break;
        }
      }
    }
  }

  return matches;
}

/**
 * Compares two submissions across all their submitted text answers
 */
function compareSubmissions(submissionA, submissionB, answersA = [], answersB = []) {
  // Aggregate text for each submission across short answer / descriptive questions
  let combinedTextA = '';
  let combinedTextB = '';
  const questionMatches = [];

  for (const ansA of answersA) {
    if (!ansA.answer_text) continue;
    combinedTextA += ' ' + ansA.answer_text;

    const matchingAnsB = answersB.find(b => b.question_id === ansA.question_id && b.answer_text);
    if (matchingAnsB) {
      const qSim = calculateJaccardSimilarity(ansA.answer_text, matchingAnsB.answer_text);
      const excerpts = findMatchingExcerpts(ansA.answer_text, matchingAnsB.answer_text);
      if (qSim > 15.0 || excerpts.length > 0) {
        questionMatches.push({
          questionId: ansA.question_id,
          questionPrompt: ansA.prompt || `Question #${ansA.question_id}`,
          similarityScore: qSim,
          excerpts: excerpts,
          textA: ansA.answer_text,
          textB: matchingAnsB.answer_text
        });
      }
    }
  }

  for (const ansB of answersB) {
    if (ansB.answer_text) {
      combinedTextB += ' ' + ansB.answer_text;
    }
  }

  const overallSimilarity = calculateJaccardSimilarity(combinedTextA, combinedTextB);

  return {
    submissionIdA: submissionA.id,
    submissionIdB: submissionB.id,
    studentNameA: submissionA.student_name,
    studentNameB: submissionB.student_name,
    overallSimilarity: overallSimilarity,
    questionMatches: questionMatches
  };
}

/**
 * Runs Plagiarism Scan across all submissions of an assignment
 */
async function scanAssignmentPlagiarism(db, assignmentId, threshold = 25.0) {
  // Fetch all submissions for the assignment
  const submissions = await db.query(
    `SELECT s.*, u.name as student_name, u.email as student_email
     FROM submissions s
     JOIN users u ON s.student_id = u.id
     WHERE s.assignment_id = ?`,
    [assignmentId]
  );

  if (submissions.length < 2) {
    return {
      scannedCount: submissions.length,
      reportsGenerated: 0,
      message: 'At least two submissions are required to perform peer plagiarism comparison.'
    };
  }

  // Fetch all student answers for this assignment
  const answers = await db.query(
    `SELECT sa.*, q.prompt, q.question_type, q.reference_answer
     FROM student_answers sa
     JOIN questions q ON sa.question_id = q.id
     JOIN submissions s ON sa.submission_id = s.id
     WHERE s.assignment_id = ? AND q.question_type != 'mcq'`,
    [assignmentId]
  );

  // Group answers by submission_id
  const answersBySub = {};
  for (const ans of answers) {
    if (!answersBySub[ans.submission_id]) {
      answersBySub[ans.submission_id] = [];
    }
    answersBySub[ans.submission_id].push(ans);
  }

  const reports = [];

  // Pairwise comparison (N * (N-1) / 2)
  for (let i = 0; i < submissions.length; i++) {
    for (let j = i + 1; j < submissions.length; j++) {
      const subA = submissions[i];
      const subB = submissions[j];
      const answersA = answersBySub[subA.id] || [];
      const answersB = answersBySub[subB.id] || [];

      const comparison = compareSubmissions(subA, subB, answersA, answersB);

      // Check max similarity among individual questions or overall
      const maxQuestionSim = comparison.questionMatches.reduce((max, q) => Math.max(max, q.similarityScore), 0);
      const effectiveSimilarity = Math.max(comparison.overallSimilarity, maxQuestionSim);

      if (effectiveSimilarity >= threshold) {
        // Prepare excerpts JSON
        const excerptsData = JSON.stringify(comparison.questionMatches);

        // Check if report already exists
        const existing = await db.get(
          `SELECT id FROM plagiarism_reports 
           WHERE (submission_id = ? AND matched_submission_id = ?) 
              OR (submission_id = ? AND matched_submission_id = ?)`,
          [subA.id, subB.id, subB.id, subA.id]
        );

        if (existing) {
          await db.run(
            `UPDATE plagiarism_reports 
             SET similarity_score = ?, matching_excerpts = ?, created_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [effectiveSimilarity, excerptsData, existing.id]
          );
        } else {
          await db.run(
            `INSERT INTO plagiarism_reports 
             (submission_id, matched_submission_id, similarity_score, matching_excerpts, source_type, review_status, teacher_notes)
             VALUES (?, ?, ?, ?, 'peer_submission', 'pending', ?)`,
            [
              subA.id,
              subB.id,
              effectiveSimilarity,
              excerptsData,
              `Flagged by automated scan: ${effectiveSimilarity}% similarity detected between ${subA.student_name} and ${subB.student_name}.`
            ]
          );
        }

        // Flag the submissions if not already graded or reviewed
        if (subA.status !== 'reviewed') {
          await db.run('UPDATE submissions SET status = "flagged" WHERE id = ?', [subA.id]);
        }
        if (subB.status !== 'reviewed') {
          await db.run('UPDATE submissions SET status = "flagged" WHERE id = ?', [subB.id]);
        }

        reports.push({
          subA: subA.student_name,
          subB: subB.student_name,
          similarity: effectiveSimilarity
        });
      }
    }
  }

  return {
    scannedCount: submissions.length,
    reportsGenerated: reports.length,
    reports: reports,
    threshold: threshold,
    message: `Scan finished. Analyzed ${submissions.length} submissions. Generated ${reports.length} plagiarism report(s).`
  };
}

module.exports = {
  calculateJaccardSimilarity,
  findMatchingExcerpts,
  compareSubmissions,
  scanAssignmentPlagiarism
};
