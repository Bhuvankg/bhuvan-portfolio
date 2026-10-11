const bcrypt = require('bcryptjs');

/**
 * Generates sample educational data for GradeAI
 */
async function getSeedData() {
  const salt = await bcrypt.genSalt(10);
  const teacherHash = await bcrypt.hash('Teacher@123', salt);
  const studentHash = await bcrypt.hash('Student@123', salt);
  const adminHash = await bcrypt.hash('Admin@123', salt);

  const roles = [
    { id: 1, name: 'admin', description: 'System Administrator with full management permissions' },
    { id: 2, name: 'teacher', description: 'Faculty instructor who creates assignments and reviews grades' },
    { id: 3, name: 'student', description: 'Student learner who submits assignments and receives feedback' }
  ];

  const users = [
    {
      id: 1,
      role_id: 1,
      name: 'Dr. Katherine Hayes (Admin)',
      email: 'admin@gradeai.edu',
      password_hash: adminHash,
      department: 'Academic Computing & Administration',
      status: 'active'
    },
    {
      id: 2,
      role_id: 2,
      name: 'Dr. Robert Chen',
      email: 'teacher@gradeai.edu',
      password_hash: teacherHash,
      department: 'Computer Science & AI',
      status: 'active'
    },
    {
      id: 3,
      role_id: 2,
      name: 'Prof. Sarah Jenkins',
      email: 'sarah.jenkins@gradeai.edu',
      password_hash: teacherHash,
      department: 'Data Systems & Software Engineering',
      status: 'active'
    },
    {
      id: 4,
      role_id: 3,
      name: 'Alex Rivera',
      email: 'student1@gradeai.edu',
      password_hash: studentHash,
      department: 'Computer Science',
      status: 'active'
    },
    {
      id: 5,
      role_id: 3,
      name: 'Brenda Vance',
      email: 'student2@gradeai.edu',
      password_hash: studentHash,
      department: 'Computer Science',
      status: 'active'
    },
    {
      id: 6,
      role_id: 3,
      name: 'Carlos Gomez',
      email: 'carlos@gradeai.edu',
      password_hash: studentHash,
      department: 'Artificial Intelligence',
      status: 'active'
    },
    {
      id: 7,
      role_id: 3,
      name: 'Dana Scully',
      email: 'dana@gradeai.edu',
      password_hash: studentHash,
      department: 'Information Technology',
      status: 'active'
    },
    {
      id: 8,
      role_id: 3,
      name: 'Evan Wright',
      email: 'evan@gradeai.edu',
      password_hash: studentHash,
      department: 'Computer Science',
      status: 'active'
    }
  ];

  const courses = [
    {
      id: 1,
      code: 'CS101',
      title: 'Introduction to Algorithms & Complexity',
      description: 'Comprehensive study of divide-and-conquer, greedy techniques, dynamic programming, and asymptotic complexity.',
      semester: 'Fall 2026',
      teacher_id: 2
    },
    {
      id: 2,
      code: 'AI202',
      title: 'Foundations of Artificial Intelligence & NLP',
      description: 'Core concepts in deep learning, vector semantics, self-attention architectures, and modern language processing.',
      semester: 'Fall 2026',
      teacher_id: 2
    },
    {
      id: 3,
      code: 'DB301',
      title: 'Modern Distributed Database Systems',
      description: 'ACID transaction management, multi-version concurrency control (MVCC), consensus protocols, and query optimization.',
      semester: 'Fall 2026',
      teacher_id: 3
    }
  ];

  const enrollments = [
    { course_id: 1, student_id: 4 },
    { course_id: 1, student_id: 5 },
    { course_id: 1, student_id: 6 },
    { course_id: 1, student_id: 7 },
    { course_id: 1, student_id: 8 },
    { course_id: 2, student_id: 4 },
    { course_id: 2, student_id: 5 },
    { course_id: 2, student_id: 6 },
    { course_id: 3, student_id: 4 },
    { course_id: 3, student_id: 7 }
  ];

  const assignments = [
    {
      id: 1,
      course_id: 1,
      created_by: 2,
      title: 'Midterm Examination: Algorithm Analysis & Graph Theory',
      description: 'Assessment covering asymptotic complexity, search algorithms, dynamic programming versus divide-and-conquer, and Dijkstra.',
      instructions: 'Please answer all multiple-choice questions carefully. For short answers, provide precise technical terminology and concise mathematical reasoning. Academic integrity guidelines strictly apply.',
      total_marks: 100.00,
      due_date: '2026-10-25 23:59:00',
      status: 'published',
      allowed_file_types: 'pdf,txt,docx'
    },
    {
      id: 2,
      course_id: 2,
      created_by: 2,
      title: 'Assignment 1: Vector Embeddings & Attention Mechanisms',
      description: 'Exploration of word representations, dot-product attention, positional encodings, and transformers.',
      instructions: 'Answer the conceptual questions thoroughly. Reference key equations or structural components where relevant.',
      total_marks: 100.00,
      due_date: '2026-11-01 23:59:00',
      status: 'published',
      allowed_file_types: 'pdf,txt'
    },
    {
      id: 3,
      course_id: 3,
      created_by: 3,
      title: 'Project Milestone 1: Transaction Isolation & ACID Guarantees',
      description: 'Implementation design review of write-ahead logging (WAL) and strict two-phase locking (2PL).',
      instructions: 'Detail the serialization anomalies prevented by Serializable vs Repeatable Read levels.',
      total_marks: 50.00,
      due_date: '2026-11-15 18:00:00',
      status: 'draft',
      allowed_file_types: 'pdf,docx,sql'
    }
  ];

  const questions = [
    // Assignment 1 Questions (CS101)
    {
      id: 1,
      assignment_id: 1,
      question_order: 1,
      question_type: 'mcq',
      prompt: 'What is the worst-case time complexity of standard QuickSort when the pivot is always chosen as the first element on an already sorted array?',
      marks: 20.00,
      reference_answer: 'Option C: O(N^2)',
      keywords: 'worst-case, quadratic, unbalanced partitions',
      explanation: 'When the array is already sorted and the pivot is chosen as the first element, partitions become completely unbalanced (size 0 and size N-1), leading to an arithmetic progression sum of comparisons: O(N^2).'
    },
    {
      id: 2,
      assignment_id: 1,
      question_order: 2,
      question_type: 'mcq',
      prompt: 'Which abstract data structure is primarily utilized to implement Breadth-First Search (BFS) in an unweighted graph to guarantee finding the shortest path in terms of edge count?',
      marks: 20.00,
      reference_answer: 'Option B: Queue (FIFO)',
      keywords: 'FIFO, Queue, level-order traversal',
      explanation: 'BFS explores vertices level by level using a First-In-First-Out (FIFO) queue, guaranteeing that vertices closer to the source are visited before vertices farther away.'
    },
    {
      id: 3,
      assignment_id: 1,
      question_order: 3,
      question_type: 'short_answer',
      prompt: 'Explain the fundamental difference between Dynamic Programming and Divide-and-Conquer. When should Dynamic Programming be preferred over simple recursion or divide-and-conquer?',
      marks: 30.00,
      reference_answer: 'Divide-and-Conquer partitions a problem into disjoint, independent subproblems, recursively solves them, and combines the results (such as in MergeSort). In contrast, Dynamic Programming is applicable when subproblems are overlapping and exhibit optimal substructure. Rather than recomputing overlapping subproblems exponentially, Dynamic Programming solves each distinct subproblem once and caches the result using memoization or bottom-up tabulation.',
      keywords: 'overlapping subproblems, optimal substructure, memoization, tabulation, independent subproblems, cache, redundant computation',
      explanation: 'Full credit requires mentioning: (1) independent vs overlapping subproblems, (2) optimal substructure, and (3) memoization or bottom-up tabulation caching.'
    },
    {
      id: 4,
      assignment_id: 1,
      question_order: 4,
      question_type: 'short_answer',
      prompt: 'Describe Dijkstra\'s algorithm for single-source shortest paths. Why does it fail when graphs contain negative edge weights or negative cycles?',
      marks: 30.00,
      reference_answer: 'Dijkstra\'s algorithm maintains a set of visited vertices and repeatedly selects the unvisited vertex with the minimal known distance from the source using a priority queue (min-heap). It relaxes all outgoing edges from this vertex. It fails with negative edge weights because it greedily assumes that once a vertex is marked visited, its shortest path distance is permanently finalized. A negative edge encountered later could yield a shorter path to an already visited vertex, violating the greedy invariant and potentially looping infinitely in negative cycles.',
      keywords: 'greedy, priority queue, min-heap, relaxation, visited set, negative weights, negative cycles, greedy invariant',
      explanation: 'Student must articulate greedy exploration, relaxation using priority queue, and why negative edges violate the finalized distance invariant.'
    },

    // Assignment 2 Questions (AI202)
    {
      id: 5,
      assignment_id: 2,
      question_order: 1,
      question_type: 'mcq',
      prompt: 'In the Transformer architecture, what is the core mathematical function of the Scaled Dot-Product Attention mechanism?',
      marks: 25.00,
      reference_answer: 'Option B: Softmax((Q * K^T) / sqrt(d_k)) * V',
      keywords: 'softmax, query, key, value, scaling factor',
      explanation: 'Scaled Dot-Product Attention computes compatibility scores between Query and Key vectors, scales by sqrt(d_k) to prevent vanishing gradients in softmax, and takes a weighted sum of Value vectors.'
    },
    {
      id: 6,
      assignment_id: 2,
      question_order: 2,
      question_type: 'mcq',
      prompt: 'Which metric is standardly utilized to evaluate semantic similarity between dense, normalized sentence embedding vectors in high-dimensional space?',
      marks: 25.00,
      reference_answer: 'Option B: Cosine Similarity',
      keywords: 'cosine similarity, angle between vectors, dot product',
      explanation: 'Cosine similarity measures the cosine of the angle between two non-zero vectors, making it invariant to vector magnitude and ideal for semantic comparisons.'
    },
    {
      id: 7,
      assignment_id: 2,
      question_order: 3,
      question_type: 'short_answer',
      prompt: 'Compare the Word2Vec Continuous Bag-of-Words (CBOW) and Skip-Gram models. Which one typically performs better on infrequent words, and why?',
      marks: 50.00,
      reference_answer: 'CBOW predicts the target center word given the surrounding context words, effectively averaging context representations. Skip-Gram reverses this process by predicting the surrounding context words given a single target center word. Skip-Gram generally performs significantly better on rare or infrequent words because it does not average away rare word signals; each context-target pair is trained as a distinct sample, allowing rare words to build distinct embedding representations.',
      keywords: 'CBOW predicts target from context, Skip-Gram predicts context from target, infrequent words, rare words, averaging context, distinct training pairs',
      explanation: 'Must identify the direction of prediction for both models and explain why Skip-gram avoids averaging out rare tokens.'
    }
  ];

  const answerOptions = [
    // Question 1 Options
    { question_id: 1, option_letter: 'A', option_text: 'O(N)', is_correct: 0 },
    { question_id: 1, option_letter: 'B', option_text: 'O(N log N)', is_correct: 0 },
    { question_id: 1, option_letter: 'C', option_text: 'O(N^2)', is_correct: 1 },
    { question_id: 1, option_letter: 'D', option_text: 'O(log N)', is_correct: 0 },

    // Question 2 Options
    { question_id: 2, option_letter: 'A', option_text: 'Stack (LIFO)', is_correct: 0 },
    { question_id: 2, option_letter: 'B', option_text: 'Queue (FIFO)', is_correct: 1 },
    { question_id: 2, option_letter: 'C', option_text: 'Priority Queue (Min-Heap)', is_correct: 0 },
    { question_id: 2, option_letter: 'D', option_text: 'Disjoint Set Union (DSU)', is_correct: 0 },

    // Question 5 Options
    { question_id: 5, option_letter: 'A', option_text: 'Sigmoid((Q + K) * V)', is_correct: 0 },
    { question_id: 5, option_letter: 'B', option_text: 'Softmax((Q * K^T) / sqrt(d_k)) * V', is_correct: 1 },
    { question_id: 5, option_letter: 'C', option_text: 'ReLU(W_1 * X + b_1) * W_2', is_correct: 0 },
    { question_id: 5, option_letter: 'D', option_text: 'Cosine((Q * V) / K)', is_correct: 0 },

    // Question 6 Options
    { question_id: 6, option_letter: 'A', option_text: 'Hamming Distance', is_correct: 0 },
    { question_id: 6, option_letter: 'B', option_text: 'Cosine Similarity', is_correct: 1 },
    { question_id: 6, option_letter: 'C', option_text: 'Levenshtein Edit Distance', is_correct: 0 },
    { question_id: 6, option_letter: 'D', option_text: 'Jaro-Winkler Metric', is_correct: 0 }
  ];

  const rubricCriteria = [
    {
      question_id: 3,
      criterion_name: 'Concept Distinction',
      description: 'Distinguishes between independent disjoint subproblems and overlapping subproblems.',
      weight_percentage: 50.00,
      max_points: 15.00
    },
    {
      question_id: 3,
      criterion_name: 'Dynamic Programming Optimization',
      description: 'Explains memoization, tabulation, optimal substructure, and caching redundant computations.',
      weight_percentage: 50.00,
      max_points: 15.00
    },
    {
      question_id: 4,
      criterion_name: 'Algorithm Mechanism',
      description: 'Accurately outlines greedy selection, min-heap priority queue, and edge relaxation.',
      weight_percentage: 50.00,
      max_points: 15.00
    },
    {
      question_id: 4,
      criterion_name: 'Negative Weight Failure Rationale',
      description: 'Identifies the violation of greedy optimality invariant and potential infinite decrease loops.',
      weight_percentage: 50.00,
      max_points: 15.00
    }
  ];

  return {
    roles,
    users,
    courses,
    enrollments,
    assignments,
    questions,
    answerOptions,
    rubricCriteria
  };
}

module.exports = { getSeedData };
