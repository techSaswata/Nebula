import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  initialCode: string;
  testCases: TestCase[];
  solution: string;
  hints: string[];
  timeLimit: number;
  memoryLimit: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface QuestionResponse {
  question: CodingQuestion;
  userAnswer: string;
  timeSpent: number;
  isCorrect: boolean;
  feedback: string;
}

export async function getQuestionsByType(type: string): Promise<CodingQuestion[]> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('type', type)
      .order('difficulty');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

export async function getQuestionById(id: string): Promise<CodingQuestion | null> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

export async function submitAnswer(
  questionId: string,
  answer: string,
  timeSpent: number
): Promise<QuestionResponse> {
  const supabase = createClientComponentClient();
  
  try {
    // Get the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    // Get test cases
    const { data: testCases, error: testCasesError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('question_id', questionId);

    if (testCasesError) throw testCasesError;

    // Run test cases
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          // Here you would implement the actual code execution logic
          // For now, we'll just return a mock result
          return {
            passed: true,
            output: "Test passed",
            error: null
          };
        } catch (error) {
          return {
            passed: false,
            output: null,
            error: error.message
          };
        }
      })
    );

    // Check if all test cases passed
    const allPassed = results.every(result => result.passed);

    // Generate feedback
    const feedback = allPassed
      ? "Great job! All test cases passed."
      : "Some test cases failed. Please review your solution.";

    return {
      question,
      userAnswer: answer,
      timeSpent,
      isCorrect: allPassed,
      feedback
    };
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}

export async function getHints(questionId: string): Promise<string[]> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('hints')
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return data.hints || [];
  } catch (error) {
    console.error('Error fetching hints:', error);
    return [];
  }
}

export async function getSolution(questionId: string): Promise<string> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('solution')
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return data.solution;
  } catch (error) {
    console.error('Error fetching solution:', error);
    return '';
  }
}

export async function getRandomQuestions(count: number = 2): Promise<CodingQuestion[]> {
  const supabase = createClientComponentClient();
  
  try {
    // Fetch all questions first
    const { data: allQuestions, error } = await supabase
      .from('interview_questions')
      .select('*');

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    if (!allQuestions || allQuestions.length === 0) {
      console.warn('No questions available in the database');
      return [];
    }

    if (allQuestions.length < count) {
      console.warn(`Not enough questions available. Requested: ${count}, Available: ${allQuestions.length}`);
      return allQuestions;
    }

    // Shuffle the questions array
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    
    // Return the first 'count' questions
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error in getRandomQuestions:', error);
    return [];
  }
} 