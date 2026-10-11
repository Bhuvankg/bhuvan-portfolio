const db = require('../config/db');
const { gradeQuestion } = require('../services/aiGradingService');

function getLetterGrade(pct) {
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

/**
 * Trigger AI Grading for a specific submission
 */
async function triggerAiGrading(req, res) {
  try {
    const { submissionId } = req.params;

    const submission = await db.get('SELECT * FROM submissions WHERE id = ?', [submissionId]);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const questions = await db.query(
      'SELECT * FROM questions WHERE assignment_id = ? ORDER BY question_order ASC',
      [submission.assignment_id]
    );

    const allOptions = await db.query(
      `SELECT o.* FROM answer_options o
       JOIN questions q ON o.question_id = q.id
       WHERE q.assignment_id = ?`,
      [submission.assignment_id]
    );

    const studentAnswers = await db.query(
      'SELECT * FROM student_answers WHERE submission_id = ?',
      [submissionId]
    );

    let totalAwarded = 0;
    let totalMax = 0;

    for (const q of questions) {
      const ansRecord = studentAnswers.find(a => a.question_id === q.id) || {};
      const rubrics = await db.query('SELECT * FROM rubric_criteria WHERE question_id = ?', [q.id]);

      const evalResult = await gradeQuestion(q, ansRecord, allOptions, rubrics);

      totalAwarded += evalResult.scoreAwarded;
      totalMax += evalResult.maxScore;

      // Update or insert grading result
      const existingResult = await db.get(
        'SELECT id FROM grading_results WHERE submission_id = ? AND question_id = ?',
        [submissionId, q.id]
      );

      if (existingResult) {
        await db.run(
          `UPDATE grading_results
           SET score_awarded = ?, ai_suggested_score = ?, confidence_level = ?,
               matched_concepts = ?, missing_concepts = ?, reasoning = ?,
               evaluator_type = ?, evaluated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            evalResult.scoreAwarded,
            evalResult.aiSuggestedScore,
            evalResult.confidenceLevel,
            evalResult.matchedConcepts,
            evalResult.missingConcepts,
            evalResult.reasoning,
            evalResult.evaluatorType,
            existingResult.id
          ]
        );
      } else {
        await db.run(
          `INSERT INTO grading_results
           (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            submissionId,
            q.id,
            evalResult.scoreAwarded,
            evalResult.maxScore,
            evalResult.evaluatorType,
            evalResult.aiSuggestedScore,
            evalResult.confidenceLevel,
            evalResult.matchedConcepts,
            evalResult.missingConcepts,
            evalResult.reasoning
          ]
        );
      }
    }

    const percentage = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 1000) / 10 : 0;
    const gradeLetter = getLetterGrade(percentage);

    await db.run(
      `UPDATE submissions
       SET total_score = ?, percentage = ?, grade_letter = ?, status = 'ai_graded', graded_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [totalAwarded, percentage, gradeLetter, submissionId]
    );

    res.json({
      success: true,
      message: 'AI Evaluation completed successfully.',
      totalScore: totalAwarded,
      percentage,
      gradeLetter
    });
  } catch (error) {
    console.error('[Grading Controller] triggerAiGrading error:', error);
    res.status(500).json({ success: false, message: 'AI grading process failed.' });
  }
}

/**
 * Teacher Reviews, Modifies, and Approves Grades
 */
async function saveTeacherReview(req, res) {
  try {
    const { submissionId } = req.params;
    const { questionGrades, overallFeedback, strengths, improvements, teacherNotes } = req.body;
    const teacherId = req.user.id;

    const submission = await db.get(
      `SELECT s.*, a.title as assignment_title
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = ?`,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    let calculatedTotalScore = 0;
    let maxScore = Number(submission.max_score) || 100;

    // Update individual question grades if provided
    if (questionGrades && Array.isArray(questionGrades)) {
      for (const item of questionGrades) {
        const score = Math.max(0, Number(item.score_awarded) || 0);
        calculatedTotalScore += score;

        await db.run(
          `UPDATE grading_results
           SET score_awarded = ?, reasoning = COALESCE(?, reasoning), is_approved = 1, evaluator_type = 'teacher'
           WHERE submission_id = ? AND question_id = ?`,
          [score, item.reasoning || null, submissionId, item.question_id]
        );
      }
    } else {
      // Keep current total score
      calculatedTotalScore = Number(submission.total_score) || 0;
    }

    const percentage = maxScore > 0 ? Math.round((calculatedTotalScore / maxScore) * 1000) / 10 : 0;
    const gradeLetter = getLetterGrade(percentage);

    // Update Submission
    await db.run(
      `UPDATE submissions
       SET total_score = ?, percentage = ?, grade_letter = ?, status = 'reviewed',
           reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
       WHERE id = ?`,
      [calculatedTotalScore, percentage, gradeLetter, teacherId, submissionId]
    );

    // Upsert Feedback
    const existingFeedback = await db.get('SELECT id FROM feedback WHERE submission_id = ?', [submissionId]);
    if (existingFeedback) {
      await db.run(
        `UPDATE feedback
         SET overall_feedback = ?, strengths = ?, improvements = ?, teacher_notes = ?,
             is_published = 1, published_at = CURRENT_TIMESTAMP
         WHERE submission_id = ?`,
        [
          overallFeedback || 'Grade verified and published by instructor.',
          strengths || 'Strong grasp of core subject principles.',
          improvements || 'Review highlighted areas in the question breakdown.',
          teacherNotes || '',
          submissionId
        ]
      );
    } else {
      await db.run(
        `INSERT INTO feedback (submission_id, overall_feedback, strengths, improvements, teacher_notes, is_published, published_at)
         VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [
          submissionId,
          overallFeedback || 'Grade verified and published by instructor.',
          strengths || 'Strong grasp of core subject principles.',
          improvements || 'Review highlighted areas in the question breakdown.',
          teacherNotes || ''
        ]
      );
    }

    // Send Student Notification
    await db.run(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Grade Published', ?, 'success')`,
      [
        submission.student_id,
        `Your submission for "${submission.assignment_title}" has been reviewed and published. Final Grade: ${gradeLetter} (${percentage}%).`
      ]
    );

    // Audit Log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'GRADE_APPROVED', 'submission', ?, ?, ?)`,
      [teacherId, submissionId, `Instructor approved grade ${gradeLetter} (${percentage}%) for submission #${submissionId}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Grade and personalized feedback published successfully.',
      finalScore: calculatedTotalScore,
      percentage,
      gradeLetter
    });
  } catch (error) {
    console.error('[Grading Controller] saveTeacherReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve and publish grade.' });
  }
}

module.exports = {
  triggerAiGrading,
  saveTeacherReview
};
