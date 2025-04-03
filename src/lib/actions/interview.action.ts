"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { 
  UpdateInterviewParams,
  CreateFeedbackParams,
  FeedbackResult
} from "@/lib/types";

// Type definitions that should be in @/lib/types
export interface CreateInterviewParams {
  title: string;
  description: string;
  userId?: string;
  scheduledDate: string;
  duration: number;
  position: string;
  company: string;
  notes?: string;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId?: string;
}

export interface TranscriptMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  type?: string;
  metadata?: {
    topics?: string[];
    questionId?: string;
    questionResult?: {
      questionId: string;
      isCorrect: boolean;
      topic?: string;
    };
  };
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: {
    communicationSkills: number;
    technicalKnowledge: number;
    problemSolving: number;
    culturalAndRoleFit: number;
    confidenceAndClarity: number;
    questionCompletion: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  topicsToImprove: {
    correct: string[];
    wrong: string[];
  };
  detailedRemarks: {
    communication: string;
    technical: string;
    problemSolving: string;
    cultural: string;
    completion: string;
    overall: string;
  };
  finalAssessment: string;
  createdAt: string;
  recommendationScore?: number; // 1-10 score for recommendation
  passStatus?: 'pass' | 'conditional' | 'fail';
  correctAnswers: Record<string, string>; // questionId: solution
  wrongAnswers: Record<string, string>; // questionId: solution
  unattemptedAnswers: Record<string, string>; // questionId: "not attempted"
  // For backward compatibility
  correct_answers?: string[];
  wrong_answers?: string[];
}

export interface Interview {
  id: string;
  title: string;
  description: string;
  userId: string;
  scheduledDate: string;
  status: string;
  duration: number;
  position: string;
  company: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  feedbackId?: string | null;
  feedback?: InterviewFeedback | null;
}

export interface Question {
  id: string;
  interviewId: string;
  content: string;
  type: string;
  order: number;
  createdAt: string;
}

export interface GenerateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: TranscriptMessage[];
  correctAnswers?: Record<string, string>;
  wrongAnswers?: Record<string, string>;
  unattemptedAnswers?: Record<string, string>;
}

export type InterviewStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export async function createInterview(params: CreateInterviewParams): Promise<{ success: boolean; error?: string; interviewId?: string }> {
  try {
    const supabase = createServerActionClient({ cookies });
    
    // Get the current user's session if userId is not provided
    let userIdToUse = params.userId;
    if (!userIdToUse) {
      const { data: { session } } = await supabase.auth.getSession();
      userIdToUse = session?.user?.id;
      
      if (!userIdToUse) {
        console.error("No authenticated user found");
        return { success: false, error: "No authenticated user found" };
      }
    }

    // Create the interview record
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        title: params.title,
        description: params.description,
        user_id: userIdToUse,
        scheduled_date: params.scheduledDate,
        duration: params.duration,
        position: params.position,
        company: params.company,
        notes: params.notes,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating interview:", error);
      return { success: false, error: error.message };
    }

    console.log("Created interview:", data);
    return { success: true, interviewId: data.id };
  } catch (error) {
    console.error("Error in createInterview:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create interview" 
    };
  }
}

export async function updateInterview({ id, status }: UpdateInterviewParams): Promise<boolean> {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { error } = await supabase
      .from("interviews")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating interview:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateInterview:", error);
    return false;
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching interview:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getInterviewById:", error);
    return null;
  }
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  try {
    // Create a server-side Supabase client
    const serverSupabase = createServerActionClient({ cookies });
    
    // If no userId is provided, try to get it from the session
    let userIdToUse = userId;
    if (!userIdToUse) {
      const { data: { session } } = await serverSupabase.auth.getSession();
      userIdToUse = session?.user?.id || '';
      
      if (!userIdToUse) {
        console.error("No authenticated user found");
        return null;
      }
    }
    
    console.log("Fetching interviews for user:", userIdToUse);
    
    const { data, error } = await serverSupabase
      .from('interviews')
      .select(`
        *,
        feedback:interview_feedback(*)
      `)
      .eq('user_id', userIdToUse)
      .order('scheduled_date', { ascending: false });

    if (error) {
      console.error("Error fetching interviews:", error);
      return null;
    }

    // Transform from Supabase snake_case to camelCase
    const interviews = data.map(item => {
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        userId: item.user_id,
        scheduledDate: item.scheduled_date,
        status: item.status,
        duration: item.duration,
        position: item.position,
        company: item.company,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        feedbackId: item.feedback?.[0]?.id || null,
        feedback: item.feedback?.[0] ? {
          id: item.feedback[0].id,
          interviewId: item.feedback[0].interview_id,
          userId: item.feedback[0].user_id,
          totalScore: item.feedback[0].total_score,
          categoryScores: {
            communicationSkills: item.feedback[0].category_scores.communication_skills,
            technicalKnowledge: item.feedback[0].category_scores.technical_knowledge,
            problemSolving: item.feedback[0].category_scores.problem_solving,
            culturalAndRoleFit: item.feedback[0].category_scores.cultural_and_role_fit,
            confidenceAndClarity: item.feedback[0].category_scores.confidence_and_clarity,
            questionCompletion: item.feedback[0].category_scores.question_completion
          },
          strengths: item.feedback[0].strengths,
          areasForImprovement: item.feedback[0].areas_for_improvement,
          finalAssessment: item.feedback[0].final_assessment,
          createdAt: item.feedback[0].created_at
        } : null
      } as Interview;
    });

    console.log("Fetched interviews with feedback:", interviews);
    return interviews;
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}

export async function createFeedback({
  interviewId,
  userId,
  transcript,
  feedbackId,
  correctAnswers,
  wrongAnswers,
  unattemptedAnswers
}: CreateFeedbackParams): Promise<FeedbackResult> {
  try {
    console.log("Creating/updating feedback record for interview:", interviewId);
    console.log("Feedback ID (if updating):", feedbackId || "none");
    
    // Generate actual feedback using the transcript
    // Cast the transcript to the expected type to avoid type errors
    const typedTranscript = transcript.map(msg => ({
      ...msg,
      role: (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') 
        ? msg.role as "user" | "assistant" | "system"
        : "user" // Default to user for any invalid role
    })) as TranscriptMessage[];
    
    const feedbackResult = await generateInterviewFeedback({
      interviewId,
      userId,
      transcript: typedTranscript,
      correctAnswers,
      wrongAnswers,
      unattemptedAnswers
    });
    
    return feedbackResult;
  } catch (error) {
    console.error("Error in createFeedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create feedback",
    };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<InterviewFeedback | null> {
  const { interviewId, userId: clientProvidedUserId } = params;

  try {
    // Create a server-side Supabase client
    const serverSupabase = createServerActionClient({ cookies });
    
    // Get the user session from the server-side client if userId not provided
    let userId = clientProvidedUserId;
    if (!userId) {
      const { data: { session } } = await serverSupabase.auth.getSession();
      userId = session?.user?.id;
      
      if (!userId) {
        console.error("No authenticated user found in server session");
        return null;
      }
    }
    
    console.log("Fetching feedback for interview:", interviewId, "and user:", userId);
    
    const { data, error } = await serverSupabase
      .from('interview_feedback')
      .select('*')
      .eq('interview_id', interviewId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error fetching feedback:", error);
      return null;
    }

    if (!data) {
      console.error("No feedback data found");
      return null;
    }

    console.log("Raw feedback data from database:", JSON.stringify(data, null, 2));

    // Transform from Supabase snake_case to camelCase
    // Handle the new category_scores structure
    const categoryScores = data.category_scores || {};
    
    // Create a properly structured feedback object with fallbacks for missing data
    const feedback: InterviewFeedback = {
      id: data.id,
      interviewId: data.interview_id,
      userId: data.user_id,
      totalScore: data.total_score || 0,
      categoryScores: {
        communicationSkills: categoryScores.communication_skills?.score || 0,
        technicalKnowledge: categoryScores.technical_knowledge?.score || 0,
        problemSolving: categoryScores.problem_solving?.score || 0,
        culturalAndRoleFit: categoryScores.cultural_and_role_fit?.score || 0,
        confidenceAndClarity: categoryScores.confidence_and_clarity?.score || 0,
        questionCompletion: categoryScores.question_completion?.score || 0
      },
      strengths: data.strengths || [],
      areasForImprovement: data.areas_for_improvement || [],
      topicsToImprove: data.topics_to_improve || { correct: [], wrong: [] },
      detailedRemarks: {
        communication: categoryScores.communication_skills?.remarks || "No detailed remarks available.",
        technical: categoryScores.technical_knowledge?.remarks || "No detailed remarks available.",
        problemSolving: categoryScores.problem_solving?.remarks || "No detailed remarks available.",
        cultural: categoryScores.cultural_and_role_fit?.remarks || "No detailed remarks available.",
        completion: categoryScores.question_completion?.remarks || "No completion remarks available.",
        overall: categoryScores.overall_assessment?.remarks || "No overall remarks available."
      },
      finalAssessment: data.final_assessment || "",
      recommendationScore: categoryScores.overall_assessment?.recommendation_score || 0,
      passStatus: categoryScores.overall_assessment?.pass_status || "fail",
      createdAt: data.created_at || new Date().toISOString(),
      correctAnswers: data.correct_answers ? JSON.parse(data.correct_answers) : {},
      wrongAnswers: data.wrong_answers ? JSON.parse(data.wrong_answers) : {},
      unattemptedAnswers: data.unattempted_answers ? JSON.parse(data.unattempted_answers) : {}
    };

    console.log("Transformed feedback:", JSON.stringify(feedback, null, 2));
    return feedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

export async function createQuestion(interviewId: string, content: string, type: string, order: number) {
  try {
    // Create a server-side Supabase client
    const serverSupabase = createServerActionClient({ cookies });
    
    const now = new Date().toISOString();
    
    const { data, error } = await serverSupabase
      .from('questions')
      .insert({
        interview_id: interviewId,
        content,
        type,
        order,
        created_at: now
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating question:", error);
      return { success: false, error: error.message };
    }

    return { success: true, questionId: data.id };
  } catch (error) {
    console.error("Error creating question:", error);
    return { success: false, error: "Failed to create question" };
  }
}

export async function getQuestionsByInterviewId(interviewId: string): Promise<Question[] | null> {
  try {
    // Create a server-side Supabase client
    const serverSupabase = createServerActionClient({ cookies });
    
    const { data, error } = await serverSupabase
      .from('questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('order', { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error);
      return null;
    }

    // Transform from Supabase snake_case to camelCase
    const questions: Question[] = data.map(item => ({
      id: item.id,
      interviewId: item.interview_id,
      content: item.content,
      type: item.type,
      order: item.order,
      createdAt: item.created_at
    }));

    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return null;
  }
}

export async function generateInterviewFeedback({
  interviewId,
  userId,
  transcript,
  correctAnswers = {},
  wrongAnswers = {},
  unattemptedAnswers = {}
}: GenerateFeedbackParams): Promise<FeedbackResult> {
  try {
    console.log("Generating feedback for interview:", interviewId);
    console.log("Transcript data:", JSON.stringify(transcript).substring(0, 500) + "...");
    console.log("Correct answers:", JSON.stringify(correctAnswers));
    console.log("Wrong answers:", JSON.stringify(wrongAnswers));
    console.log("Unattempted answers:", JSON.stringify(unattemptedAnswers));

    // Extract solution performance and question information
    const correctQuestions: string[] = [];
    const wrongQuestions: string[] = [];
    let correctTopics: string[] = [];
    let wrongTopics: string[] = [];
    const unattemptedTopics: string[] = [];
    
    // Use the provided answers objects if available
    if (Object.keys(correctAnswers).length > 0 || Object.keys(wrongAnswers).length > 0) {
      console.log("Using provided answer data instead of extracting from transcript");
      
      // Collect question IDs from the answer objects
      Object.keys(correctAnswers).forEach(id => correctQuestions.push(id));
      Object.keys(wrongAnswers).forEach(id => wrongQuestions.push(id));
      
      // Look for topic information in the transcript using the question IDs
      for (const message of transcript) {
        if (message.metadata?.questionResult) {
          const result = message.metadata.questionResult;
          if (result.questionId && result.topic) {
            if (correctQuestions.includes(result.questionId)) {
              correctTopics.push(result.topic);
            } else if (wrongQuestions.includes(result.questionId)) {
              wrongTopics.push(result.topic);
            }
          }
        }
      }
    } else {
      // Fall back to the existing logic for extracting from the transcript
      // Look for solution assessment messages
      for (const message of transcript) {
        // Check for solution evaluations
        if (message.role === 'system' && typeof message.content === 'string') {
          // Extract question IDs and results from system messages
          if (message.content.includes('question_result')) {
            try {
              const match = message.content.match(/{[^}]*question_result[^}]*}/);
              if (match) {
                const data = JSON.parse(match[0]);
                if (data.question_id) {
                  if (data.is_correct) {
                    correctQuestions.push(data.question_id);
                    if (data.topic) correctTopics.push(data.topic);
                  } else {
                    wrongQuestions.push(data.question_id);
                    if (data.topic) wrongTopics.push(data.topic);
                  }
                }
              }
            } catch (error) {
              console.log("Error parsing question result:", error);
            }
          }
        }
        
        // Check for metadata in messages that might have solution information
        if (message.metadata?.questionResult) {
          const result = message.metadata.questionResult;
          if (result.questionId) {
            if (result.isCorrect) {
              correctQuestions.push(result.questionId);
              if (result.topic) correctTopics.push(result.topic);
            } else {
              wrongQuestions.push(result.questionId);
              if (result.topic) wrongTopics.push(result.topic);
            }
          }
        }
      }
    }

    // Get all question IDs from the transcript metadata
    const allQuestionIds = new Set<string>();
    for (const message of transcript) {
      if (message.metadata?.questionResult?.questionId) {
        allQuestionIds.add(message.metadata.questionResult.questionId);
      }
    }

    // Create unattempted answers object for questions not in correct or wrong answers
    const localUnattemptedAnswers: Record<string, string> = {};
    allQuestionIds.forEach(questionId => {
      if (!correctQuestions.includes(questionId) && !wrongQuestions.includes(questionId)) {
        localUnattemptedAnswers[questionId] = "not attempted";
      }
    });

    // Merge provided unattempted answers with local ones
    const mergedUnattemptedAnswers = {
      ...localUnattemptedAnswers,
      ...unattemptedAnswers
    };

    // Calculate total questions and attempted questions
    const totalQuestions = allQuestionIds.size;
    const attemptedQuestions = correctQuestions.length + wrongQuestions.length;

    // Calculate question completion score
    const questionCompletionScore = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 10 : 0;

    // Also check transcript metadata for topics
    const allTopics = new Set<string>();
    for (const message of transcript) {
      if (message.metadata?.topics && Array.isArray(message.metadata.topics)) {
        message.metadata.topics.forEach(topic => allTopics.add(topic));
      }
    }
    
    // If no explicit correct/wrong categorization found, try to infer from scores
    if (correctQuestions.length === 0 && wrongQuestions.length === 0) {
      // Look for solution messages with scores
      for (const message of transcript) {
        if (message.role === 'user' && typeof message.content === 'string' && 
            message.content.includes('[SOLUTION')) {
          // Try to extract question ID
          const questionIdMatch = message.content.match(/Question (\d+)/i);
          const questionId = questionIdMatch ? questionIdMatch[1] : null;
          
          // Look for score information
          const scoreMatch = message.content.match(/Score:\s*(\d+)/i);
          if (scoreMatch) {
            const score = parseInt(scoreMatch[1]);
            // Consider scores above 70 as correct
            if (score >= 70) {
              if (questionId) correctQuestions.push(questionId);
            } else {
              if (questionId) wrongQuestions.push(questionId);
            }
          }
        }
      }
    }
    
    // Extract topics from the transcript if no explicit topic information found
    if (correctTopics.length === 0 && wrongTopics.length === 0 && allTopics.size > 0) {
      // Distribute topics based on correct/wrong question count ratio
      const allTopicsArray = Array.from(allTopics);
      
      if (correctQuestions.length > 0 || wrongQuestions.length > 0) {
        const totalQuestions = correctQuestions.length + wrongQuestions.length;
        const correctRatio = correctQuestions.length / totalQuestions;
        
        // Distribute topics based on correct/wrong ratio
        const correctCount = Math.round(allTopicsArray.length * correctRatio);
        correctTopics = allTopicsArray.slice(0, correctCount);
        wrongTopics = allTopicsArray.slice(correctCount);
      } else {
        // If no questions were explicitly marked, consider all topics as "to improve"
        wrongTopics = allTopicsArray;
      }
    }

    // Create a consolidated array of topics to improve based on wrong questions
    const topicsToImprove = Array.from(new Set(wrongTopics));
    console.log("Topics identified for improvement:", topicsToImprove);
    
    // Create a topics assessment object
    const topicsAssessment = {
      correct: Array.from(new Set(correctTopics)),
      wrong: topicsToImprove,
      unattempted: Array.from(new Set(unattemptedTopics))
    };
    console.log("Topics assessment:", topicsAssessment);

    // Analyze transcript to generate feedback
    const feedback = analyzeFeedback(transcript, topicsToImprove);
    console.log("Generated feedback:", JSON.stringify(feedback, null, 2));

    // Create a structured feedback object with all the data
    const structuredFeedback = {
      totalScore: feedback.totalScore,
      categoryScores: {
        communicationSkills: feedback.categoryScores.communicationSkills,
        technicalKnowledge: feedback.categoryScores.technicalKnowledge,
        problemSolving: feedback.categoryScores.problemSolving,
        culturalAndRoleFit: feedback.categoryScores.culturalAndRoleFit,
        confidenceAndClarity: feedback.categoryScores.confidenceAndClarity,
        questionCompletion: feedback.categoryScores.questionCompletion
      },
      strengths: feedback.strengths,
      areasForImprovement: feedback.areasForImprovement,
      topicsToImprove: topicsAssessment,
      detailedRemarks: {
        communication: feedback.detailedRemarks.communication,
        technical: feedback.detailedRemarks.technical,
        problemSolving: feedback.detailedRemarks.problemSolving,
        cultural: feedback.detailedRemarks.cultural,
        confidenceAndClarity: feedback.detailedRemarks.confidenceAndClarity,
        completion: feedback.detailedRemarks.completion,
        overall: feedback.detailedRemarks.overall
      },
      recommendationScore: feedback.recommendationScore,
      finalAssessment: feedback.finalAssessment,
      correctAnswers,
      wrongAnswers,
      unattemptedAnswers: mergedUnattemptedAnswers,
      passStatus: feedback.passStatus
    };
    console.log("Generated structured feedback:", JSON.stringify(structuredFeedback, null, 2));

    // Create a server-side Supabase client
    const serverSupabase = createServerActionClient({ cookies });
    
    // Round all scores to integers before saving to database
    const totalScore = Math.round(structuredFeedback.totalScore);

    // Format the final assessment to be more professional
    const formattedFinalAssessment = `# Interview Assessment Summary

## Overall Score: ${totalScore}/10

${structuredFeedback.detailedRemarks.overall}

## Category Breakdown:
- Communication Skills: ${Math.round(structuredFeedback.categoryScores.communicationSkills)}/10
- Technical Knowledge: ${Math.round(structuredFeedback.categoryScores.technicalKnowledge)}/10  
- Problem-Solving: ${Math.round(structuredFeedback.categoryScores.problemSolving)}/10
- Cultural & Role Fit: ${Math.round(structuredFeedback.categoryScores.culturalAndRoleFit)}/10
- Confidence & Clarity: ${Math.round(structuredFeedback.categoryScores.confidenceAndClarity)}/10
- Question Completion: ${Math.round(structuredFeedback.categoryScores.questionCompletion)}/10

## Key Strengths:
${structuredFeedback.strengths.map(s => `- ${s}`).join('\n')}

## Areas for Improvement:
${structuredFeedback.areasForImprovement.map(a => `- ${a}`).join('\n')}

${topicsAssessment.correct.length > 0 || topicsAssessment.wrong.length > 0 ? `
## Topics Analysis:
${topicsAssessment.correct.length > 0 ? `
### Strong Topics:
${topicsAssessment.correct.map((t: string) => `- ${t}`).join('\n')}
` : ''}
${topicsAssessment.wrong.length > 0 ? `
### Topics to Focus On:
${topicsAssessment.wrong.map((t: string) => `- ${t}`).join('\n')}
` : ''}
` : ''}

## Performance Summary:
- Total Questions: ${totalQuestions}
- Questions Attempted: ${attemptedQuestions}
- Questions Completed: ${correctQuestions.length}
- Questions Incorrect: ${wrongQuestions.length}
- Strong topics: ${correctTopics.join(', ') || 'None identified'}
- Topics to improve: ${wrongTopics.join(', ') || 'None identified'}

## Recommendation:
${structuredFeedback.recommendationScore >= 7 ? 'Strongly recommend' : structuredFeedback.recommendationScore >= 5 ? 'Consider with reservations' : 'Not recommended'} for this position.
`;
    
    // Save feedback to interview_feedback table - using only existing columns
    const { data, error } = await serverSupabase
      .from('interview_feedback')
      .insert({
        interview_id: interviewId,
        user_id: userId,
        total_score: totalScore,
        category_scores: {
          communication_skills: {
            score: Math.round(structuredFeedback.categoryScores.communicationSkills),
            remarks: structuredFeedback.detailedRemarks.communication
          },
          technical_knowledge: {
            score: Math.round(structuredFeedback.categoryScores.technicalKnowledge),
            remarks: structuredFeedback.detailedRemarks.technical
          },
          problem_solving: {
            score: Math.round(structuredFeedback.categoryScores.problemSolving),
            remarks: structuredFeedback.detailedRemarks.problemSolving
          },
          cultural_and_role_fit: {
            score: Math.round(structuredFeedback.categoryScores.culturalAndRoleFit),
            remarks: structuredFeedback.detailedRemarks.cultural
          },
          confidence_and_clarity: {
            score: Math.round(structuredFeedback.categoryScores.confidenceAndClarity),
            remarks: structuredFeedback.detailedRemarks.confidenceAndClarity
          },
          question_completion: {
            score: Math.round(structuredFeedback.categoryScores.questionCompletion),
            remarks: structuredFeedback.detailedRemarks.completion
          },
          overall_assessment: {
            score: totalScore,
            remarks: structuredFeedback.detailedRemarks.overall,
            recommendation_score: Math.round(structuredFeedback.recommendationScore || 0),
            pass_status: structuredFeedback.passStatus
          }
        },
        strengths: structuredFeedback.strengths,
        areas_for_improvement: structuredFeedback.areasForImprovement,
        topics_to_improve: structuredFeedback.topicsToImprove,
        correct_answers: JSON.stringify(structuredFeedback.correctAnswers),
        wrong_answers: JSON.stringify(structuredFeedback.wrongAnswers),
        unattempted_answers: JSON.stringify(structuredFeedback.unattemptedAnswers),
        final_assessment: formattedFinalAssessment
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving feedback to database:", error);
      return { success: false, error: error.message };
    }

    // Update interview status to completed
    await updateInterview({
      id: interviewId,
      status: "completed" as InterviewStatus
    });

    console.log("Feedback saved successfully with ID:", data.id);
    return { success: true, feedbackId: data.id };
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate feedback",
    };
  }
}

// Helper function to analyze transcript and generate feedback
function analyzeFeedback(transcript: TranscriptMessage[], topicsToImprove: string[] = []) {
  // Stricter algorithm to analyze the interview transcript
  let communicationScore = 0;
  let technicalScore = 0;
  let problemSolvingScore = 0;
  let culturalFitScore = 0;
  let confidenceScore = 0;
  let questionCompletionScore = 0;
  
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  
  // Count messages to calculate engagement
  const totalMessages = Array.isArray(transcript) ? transcript.length : 0;
  const userMessages = Array.isArray(transcript) ? transcript.filter(msg => msg.role === 'user').length : 0;
  
  // Parse solutions if provided in a structured format
  const solutionScores: number[] = [];
  let correctQuestions = 0;
  let totalQuestions = 0;
  
  // Words indicating confidence or lack thereof
  const confidencePositiveWords = ['confident', 'certain', 'sure', 'definitely', 'absolutely'];
  const confidenceNegativeWords = ['maybe', 'perhaps', 'not sure', 'might', 'possibly', 'i guess', 'i think'];
  
  // Words indicating clear communication or lack thereof
  const communicationPositiveWords = ['therefore', 'because', 'consequently', 'as a result', 'firstly', 'secondly', 'finally', 'in conclusion'];
  const communicationNegativeWords = ['um', 'uh', 'like', 'sort of', 'kind of'];
  
  // Technical keywords that demonstrate depth of knowledge
  const technicalKeywords = [
    'algorithm', 'complexity', 'data structure', 'optimization', 'implementation', 'efficiency',
    'time complexity', 'space complexity', 'edge case', 'corner case', 'big o', 'analysis',
    'recursive', 'iterative', 'object-oriented', 'functional', 'asynchronous', 'concurrent'
  ];
  
  // Problem-solving indicators
  const problemSolvingIndicators = [
    'approach', 'solution', 'alternative', 'trade-off', 'constraint', 'requirement',
    'testing', 'edge case', 'validation', 'verification', 'assumptions', 'clarification'
  ];
  
  if (Array.isArray(transcript)) {
    // Track conversation flow metrics
    const userMessageLengths: number[] = [];
    let confidencePositiveCount = 0;
    let confidenceNegativeCount = 0;
    let communicationPositiveCount = 0;
    let communicationNegativeCount = 0;
    let technicalKeywordCount = 0;
    let problemSolvingIndicatorCount = 0;
    
    // Look for solution messages or metadata
    for (const message of transcript) {
      if (message.metadata?.questionResult) {
        totalQuestions++;
        if (message.metadata.questionResult.isCorrect) {
          correctQuestions++;
        }
      }
      
      if (message.role === 'user' && typeof message.content === 'string') {
        const content = message.content.toLowerCase();
        userMessageLengths.push(content.length);
        
        // Check for solution indication
        if (content.includes('[solution')) {
          // Default to low score if no specific evaluation available
          solutionScores.push(4.0);
        }
        
        // Check for confidence indicators
        confidencePositiveWords.forEach(word => {
          if (content.includes(word)) confidencePositiveCount++;
        });
        
        confidenceNegativeWords.forEach(word => {
          if (content.includes(word)) confidenceNegativeCount++;
        });
        
        // Check for communication quality indicators
        communicationPositiveWords.forEach(word => {
          if (content.includes(word)) communicationPositiveCount++;
        });
        
        communicationNegativeWords.forEach(word => {
          if (content.includes(word)) communicationNegativeCount++;
        });
        
        // Count technical keyword usage
        technicalKeywords.forEach(word => {
          if (content.includes(word)) technicalKeywordCount++;
        });
        
        // Count problem-solving indicator usage
        problemSolvingIndicators.forEach(word => {
          if (content.includes(word)) problemSolvingIndicatorCount++;
        });
      }
    }
    
    // Calculate question completion score - now stricter
    questionCompletionScore = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 10 : 0;
    
    // Evaluate engagement metrics - starting with lower base scores
    const avgMessageLength = userMessageLengths.length > 0 ? 
      userMessageLengths.reduce((sum, len) => sum + len, 0) / userMessageLengths.length : 0;
    
    // Calculate communication score - stricter metrics
    // Base score is now 3 instead of 5
    communicationScore = 3.0;
    
    // Add points based on message length (up to 2 points)
    if (avgMessageLength > 300) communicationScore += 2.0;
    else if (avgMessageLength > 200) communicationScore += 1.5;
    else if (avgMessageLength > 100) communicationScore += 1.0;
    else if (avgMessageLength > 50) communicationScore += 0.5;
    
    // Add points based on communication quality indicators (up to 2 points)
    const communicationQualityScore = 
      Math.min(2.0, (communicationPositiveCount * 0.5) - (communicationNegativeCount * 0.3));
    communicationScore += Math.max(0, communicationQualityScore);
    
    // Add points based on interaction frequency (up to 2 points)
    const interactionRatio = userMessages / Math.max(1, totalMessages);
    communicationScore += Math.min(2.0, interactionRatio * 3);
    
    // Add points for structured responses (up to 1 point)
    const hasStructuredResponses = transcript.some(msg => 
      msg.role === 'user' && 
      typeof msg.content === 'string' && 
      (msg.content.includes("First") || msg.content.includes("Second") || 
       msg.content.includes("Finally") || msg.content.includes("In conclusion"))
    );
    if (hasStructuredResponses) communicationScore += 1.0;

    // Calculate technical score - stricter assessment
    // Base score is now 2 instead of 4
    technicalScore = 2.0;
    
    // Add points based on technical keyword usage (up to 4 points)
    technicalScore += Math.min(4.0, technicalKeywordCount * 0.4);
    
    // Add points based on correct solutions (up to 4 points)
    if (totalQuestions > 0) {
      technicalScore += (correctQuestions / totalQuestions) * 4.0;
    }
    
    // Calculate problem solving score - stricter assessment
    // Base score is now 2 instead of default 7
    problemSolvingScore = 2.0;
    
    // Add points based on problem-solving indicator usage (up to 3 points)
    problemSolvingScore += Math.min(3.0, problemSolvingIndicatorCount * 0.4);
    
    // Add points based on solution scores if available (up to 3 points)
    if (solutionScores.length > 0) {
      const avgSolutionScore = solutionScores.reduce((sum, score) => sum + score, 0) / solutionScores.length;
      problemSolvingScore += (avgSolutionScore / 10) * 3.0;
    }
    
    // Add points for structured problem-solving approach (up to 2 points)
    const hasStructuredApproach = transcript.some(msg => 
      msg.role === 'user' && 
      typeof msg.content === 'string' && 
      (
        (msg.content.includes("approach") && msg.content.includes("time complexity")) ||
        (msg.content.includes("first") && msg.content.includes("then")) ||
        (msg.content.includes("test case") || msg.content.includes("edge case"))
      )
    );
    if (hasStructuredApproach) problemSolvingScore += 2.0;
    
    // Calculate cultural fit score - stricter assessment
    // Base score is now 4 instead of 7.5
    culturalFitScore = 4.0;
    
    // Add points for positive collaboration indicators (up to 3 points)
    const hasTeamFocusedLanguage = transcript.some(msg => 
      msg.role === 'user' && 
      typeof msg.content === 'string' && 
      (
        msg.content.toLowerCase().includes("team") || 
        msg.content.toLowerCase().includes("collaborate") ||
        msg.content.toLowerCase().includes("learn from") ||
        msg.content.toLowerCase().includes("working with others")
      )
    );
    if (hasTeamFocusedLanguage) culturalFitScore += 3.0;
    
    // Add points for adaptability and learning mindset (up to 3 points)
    const hasGrowthMindset = transcript.some(msg => 
      msg.role === 'user' && 
      typeof msg.content === 'string' && 
      (
        msg.content.toLowerCase().includes("improve") || 
        msg.content.toLowerCase().includes("learn") ||
        msg.content.toLowerCase().includes("growth") ||
        msg.content.toLowerCase().includes("challenge") ||
        msg.content.toLowerCase().includes("feedback")
      )
    );
    if (hasGrowthMindset) culturalFitScore += 3.0;
    
    // Calculate confidence score - stricter assessment
    // Base score is now 3 instead of 8
    confidenceScore = 3.0;
    
    // Add points based on confidence indicators (up to 4 points)
    const confidenceRatio = confidencePositiveCount / Math.max(1, confidencePositiveCount + confidenceNegativeCount);
    confidenceScore += confidenceRatio * 4.0;
    
    // Add points for consistent engagement (up to 3 points)
    const responseLengthConsistency = userMessageLengths.length > 1 ? 
      1 - (Math.max(...userMessageLengths) - Math.min(...userMessageLengths)) / Math.max(...userMessageLengths) : 0;
    confidenceScore += responseLengthConsistency * 3.0;
    
    // Build strengths and areas for improvement based on scores
    // Add completion rate to strengths or areas for improvement
    if (questionCompletionScore >= 7) {
      strengths.push(`Correctly answered ${correctQuestions}/${totalQuestions} questions`);
    } else {
      areasForImprovement.push(`Only answered ${correctQuestions}/${totalQuestions} questions correctly - needs improvement`);
    }
    
    // Add communication assessment
    if (communicationScore >= 7) {
      strengths.push("Communicates with clarity and structure");
    } else if (communicationScore < 5) {
      areasForImprovement.push("Needs significant improvement in communication clarity and structure");
    } else {
      areasForImprovement.push("Should work on more structured and clear communication");
    }
    
    // Add technical assessment
    if (technicalScore >= 7) {
      strengths.push("Demonstrates strong technical knowledge");
    } else if (technicalScore < 5) {
      areasForImprovement.push("Shows significant gaps in technical knowledge");
    } else {
      areasForImprovement.push("Requires deeper technical understanding");
    }
    
    // Add problem-solving assessment
    if (problemSolvingScore >= 7) {
      strengths.push("Exhibits effective problem-solving skills");
    } else if (problemSolvingScore < 5) {
      areasForImprovement.push("Problem-solving approach needs significant improvement");
    } else {
      areasForImprovement.push("Should develop a more structured problem-solving approach");
    }
    
    // Add cultural fit assessment
    if (culturalFitScore >= 7) {
      strengths.push("Shows strong alignment with team values");
    } else if (culturalFitScore < 5) {
      areasForImprovement.push("Cultural fit requires further evaluation");
    }
    
    // Add confidence assessment
    if (confidenceScore >= 7) {
      strengths.push("Demonstrates confidence in responses");
    } else if (confidenceScore < 5) {
      areasForImprovement.push("Needs to build more confidence in technical discussions");
    }
  }
  
  // Cap all scores to maximum of 10
  communicationScore = Math.min(10, Math.max(0, communicationScore));
  technicalScore = Math.min(10, Math.max(0, technicalScore));
  problemSolvingScore = Math.min(10, Math.max(0, problemSolvingScore));
  culturalFitScore = Math.min(10, Math.max(0, culturalFitScore));
  confidenceScore = Math.min(10, Math.max(0, confidenceScore));
  questionCompletionScore = Math.min(10, Math.max(0, questionCompletionScore));
  
  // Overall score (weighted with stricter criteria)
  const totalScore = (
    communicationScore * 0.15 + 
    technicalScore * 0.25 + 
    problemSolvingScore * 0.25 + 
    culturalFitScore * 0.15 + 
    confidenceScore * 0.10 +
    questionCompletionScore * 0.10  // Reduced weight for completion
  );
  
  // Calculate recommendation score - more influenced by technical and problem-solving
  const recommendationScore = (
    communicationScore * 0.10 + 
    technicalScore * 0.30 + 
    problemSolvingScore * 0.30 + 
    culturalFitScore * 0.15 + 
    confidenceScore * 0.05 +
    questionCompletionScore * 0.10
  );
  
  // Generate detailed remarks for each category
  const communicationRemark = generateDetailedRemark('communication', communicationScore);
  const technicalRemark = generateDetailedRemark('technical', technicalScore);
  const problemSolvingRemark = generateDetailedRemark('problemSolving', problemSolvingScore);
  const culturalRemark = generateDetailedRemark('cultural', culturalFitScore);
  const confidenceAndClarityRemark = generateDetailedRemark('confidence', confidenceScore);
  const completionRemark = `Question Completion Rate: ${correctQuestions}/${totalQuestions} (Score: ${questionCompletionScore.toFixed(1)}/10)`;
  
  // Default strengths if empty
  if (strengths.length === 0) {
    strengths.push(
      "Some understanding of technical concepts",
      "Shows potential in problem-solving ability"
    );
  }
  
  // Default areas for improvement if empty
  if (areasForImprovement.length === 0) {
    areasForImprovement.push(
      "Needs to improve technical depth",
      "Should develop more structured problem-solving approach",
      "Communication could be clearer and more concise"
    );

    // Add some topics to improve if we have identified topics
    if (topicsToImprove.length > 0) {
      topicsToImprove.forEach(topic => {
        areasForImprovement.push(`Demonstrates gaps in ${topic} knowledge`);
      });
    }
  }
  
  // Generate overall assessment with completion rate - stricter thresholds
  let overallRemark = "";
  let passStatus = "fail";
  
  if (totalScore >= 8.5) {
    overallRemark = `Outstanding candidate with excellent technical skills and communication abilities. Successfully completed ${correctQuestions}/${totalQuestions} questions. Strong recommendation to proceed with hiring.`;
    passStatus = "pass";
  } else if (totalScore >= 7.5) {
    overallRemark = `Strong candidate who demonstrates good technical understanding and problem-solving capabilities. Completed ${correctQuestions}/${totalQuestions} questions successfully. Recommended for further consideration.`;
    passStatus = "pass";
  } else if (totalScore >= 6.5) {
    overallRemark = `Competent candidate with adequate skills. Completed ${correctQuestions}/${totalQuestions} questions. May require additional training or support in some areas. Consider for further interviews.`;
    passStatus = "conditional";
  } else if (totalScore >= 5.5) {
    overallRemark = `Borderline candidate with some potential but notable gaps in knowledge or skills. Completed ${correctQuestions}/${totalQuestions} questions. Proceed with caution and require additional assessments.`;
    passStatus = "conditional";
  } else {
    overallRemark = `Candidate does not currently meet the requirements for this position. Only completed ${correctQuestions}/${totalQuestions} questions successfully. Not recommended for this role at this time.`;
    passStatus = "fail";
  }
  
  // Format final assessment with detailed breakdown including completion rate
  const finalAssessment = `
## Overall Assessment: ${totalScore.toFixed(1)}/10

${overallRemark}

### Question Completion
• Successfully completed: ${correctQuestions}/${totalQuestions} questions
• Completion Score: ${questionCompletionScore.toFixed(1)}/10

### Category Scores
• Communication Skills: ${communicationScore.toFixed(1)}/10
• Technical Knowledge: ${technicalScore.toFixed(1)}/10
• Problem Solving: ${problemSolvingScore.toFixed(1)}/10
• Cultural & Role Fit: ${culturalFitScore.toFixed(1)}/10
• Confidence & Clarity: ${confidenceScore.toFixed(1)}/10

### Key Strengths:
${strengths.map(s => `• ${s}`).join('\n')}

### Areas for Improvement:
${areasForImprovement.map(a => `• ${a}`).join('\n')}

${topicsToImprove.length > 0 ? `
### Topics to Focus On:
${topicsToImprove.map(t => `• ${t}`).join('\n')}
` : ''}

### Recommendation:
${recommendationScore >= 7.5 ? 'Recommend' : recommendationScore >= 6 ? 'Consider with reservations' : 'Not recommended'} for this position.
  `.trim();
  
  return {
    totalScore,
    categoryScores: {
      communicationSkills: communicationScore,
      technicalKnowledge: technicalScore,
      problemSolving: problemSolvingScore,
      culturalAndRoleFit: culturalFitScore,
      confidenceAndClarity: confidenceScore,
      questionCompletion: questionCompletionScore
    },
    strengths,
    areasForImprovement,
    topicsToImprove,
    detailedRemarks: {
      communication: communicationRemark,
      technical: technicalRemark,
      problemSolving: problemSolvingRemark,
      cultural: culturalRemark,
      confidenceAndClarity: confidenceAndClarityRemark,
      completion: completionRemark,
      overall: overallRemark
    },
    recommendationScore,
    finalAssessment,
    passStatus
  };
}

// Helper function to generate detailed remarks based on category and score
function generateDetailedRemark(category: string, score: number): string {
  // Define remark templates for different score ranges
  const remarkTemplates: Record<string, Record<string, string[]>> = {
    communication: {
      excellent: [
        "Communicates ideas with exceptional clarity and precision.",
        "Articulates complex concepts in an accessible and engaging manner.",
        "Demonstrates outstanding active listening and thoughtful responses."
      ],
      good: [
        "Expresses thoughts clearly and logically.",
        "Maintains good balance between listening and speaking.",
        "Explains technical concepts effectively to different audiences."
      ],
      average: [
        "Generally communicates adequately but could be more precise.",
        "Sometimes struggles to articulate complex ideas concisely.",
        "Communication is functional but lacks polish in technical discussions."
      ],
      poor: [
        "Has difficulty expressing technical concepts clearly.",
        "Responses are often confusing or lack logical structure.",
        "Needs significant improvement in communication effectiveness."
      ]
    },
    technical: {
      excellent: [
        "Demonstrates deep technical knowledge across all discussed areas.",
        "Shows mastery of relevant technologies and best practices.",
        "Provides insightful technical solutions with thorough understanding."
      ],
      good: [
        "Shows solid technical foundation and practical knowledge.",
        "Understands core concepts well and applies them appropriately.",
        "Demonstrates good technical reasoning and problem approach."
      ],
      average: [
        "Displays adequate technical knowledge but lacks depth in some areas.",
        "Understanding appears mostly theoretical with limited practical experience.",
        "Technical skillset meets minimum requirements but needs development."
      ],
      poor: [
        "Shows significant gaps in fundamental technical knowledge.",
        "Misunderstands or misapplies important technical concepts.",
        "Technical skills do not meet the minimum requirements for the role."
      ]
    },
    problemSolving: {
      excellent: [
        "Approaches problems with exceptional analytical clarity and creativity.",
        "Breaks down complex problems effectively and navigates to optimal solutions.",
        "Demonstrates strategic thinking and considers multiple approaches."
      ],
      good: [
        "Shows strong logical reasoning when solving problems.",
        "Methodically approaches challenges with good structure.",
        "Can identify and implement appropriate solutions efficiently."
      ],
      average: [
        "Demonstrates basic problem-solving ability but lacks sophistication.",
        "Sometimes misses alternative or more efficient approaches.",
        "Problem-solving process needs more structure and thoroughness."
      ],
      poor: [
        "Struggles with breaking down problems into manageable components.",
        "Often misses key insights needed to solve technical challenges.",
        "Shows limited ability to develop structured approach to problems."
      ]
    },
    cultural: {
      excellent: [
        "Values align exceptionally well with organization culture.",
        "Shows outstanding collaboration mindset and team orientation.",
        "Demonstrates strong adaptability and positive attitude toward feedback."
      ],
      good: [
        "Values appear well-aligned with organization culture.",
        "Shows good collaboration potential and team-oriented mindset.",
        "Receptive to feedback and demonstrates growth mindset."
      ],
      average: [
        "Appears adaptable to company culture with some effort.",
        "Shows adequate but not exceptional team orientation.",
        "Generally receptive to feedback but may be defensive at times."
      ],
      poor: [
        "Values or working style may conflict with organization culture.",
        "Shows limited interest in collaboration or team dynamics.",
        "Demonstrates resistance to feedback or fixed mindset."
      ]
    },
    confidence: {
      excellent: [
        "Demonstrates exceptional confidence in technical discussions.",
        "Presents ideas with conviction and authority.",
        "Handles challenging questions with poise and clarity."
      ],
      good: [
        "Shows good confidence when discussing familiar topics.",
        "Maintains composure when challenged on technical details.",
        "Communicates with reasonable self-assurance."
      ],
      average: [
        "Shows moderate confidence but hesitates on complex topics.",
        "Occasionally appears uncertain when pressed for details.",
        "Could benefit from more assertive technical communication."
      ],
      poor: [
        "Lacks confidence when discussing technical concepts.",
        "Shows excessive hesitation or uncertainty in responses.",
        "Needs to develop more self-assurance in technical discussions."
      ]
    }
  };

  // Select the appropriate category templates
  const categoryTemplates = remarkTemplates[category] || remarkTemplates.technical;
  
  // Select the appropriate score range
  let scoreRange = 'average';
  if (score >= 8) {
    scoreRange = 'excellent';
  } else if (score >= 6) {
    scoreRange = 'good';
  } else if (score < 4) {
    scoreRange = 'poor';
  }
  
  // Get templates for this score range
  const templates = categoryTemplates[scoreRange] || categoryTemplates.average;
  
  // Select a random template from the appropriate range
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Add score to the remark
  return `${selectedTemplate} (Score: ${score.toFixed(1)}/10)`;
}