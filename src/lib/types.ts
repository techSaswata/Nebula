import { ReactNode } from "react";

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
  feedbackId?: string | null;
  feedback?: InterviewFeedback | null;
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
  recommendationScore?: number;
  passStatus?: 'pass' | 'conditional' | 'fail';
  correctAnswers: Record<string, string>;
  wrongAnswers: Record<string, string>;
  unattemptedAnswers: Record<string, string>;
  correct_answers?: string[];
  wrong_answers?: string[];
}

export type InterviewStatus = 'scheduled' | 'active' | 'in-progress' | 'attempted' | 'completed' | 'cancelled';

export interface Transcript {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: string;
  metadata?: {
    topics?: string[];
    questionResult?: {
      questionId: string;
      isCorrect: boolean;
      topic?: string;
    };
  };
}

export interface UpdateInterviewParams {
  id: string;
  status: InterviewStatus;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string; timestamp?: string; type?: string; }[];
  feedbackId?: string;
  correctAnswers?: Record<string, string>;
  wrongAnswers?: Record<string, string>;
  unattemptedAnswers?: Record<string, string>;
}

export interface FeedbackResult {
  success: boolean;
  error?: string;
  feedbackId?: string;
}

export interface DetailedFeedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: {
    [key: string]: number;
  };
  topicsToImprove: string[];
  detailedRemarks: string;
  strengths: string[];
  areasForImprovement: string[];
  created_at: string;
  updated_at: string;
  correctAnswers?: Record<string, string>;
  wrongAnswers?: Record<string, string>;
  unattemptedAnswers?: Record<string, string>;
  passStatus?: 'pass' | 'conditional' | 'fail';
  recommendationScore?: number;
}

export interface CategoryScores {
  communicationSkills: number;
  technicalKnowledge: number;
  problemSolving: number;
  culturalAndRoleFit: number;
  confidenceAndClarity: number;
  questionCompletion: number;
}

export interface DetailedRemarks {
  communication: string;
  technical: string;
  problemSolving: string;
  cultural: string;
  completion: string;
  overall: string;
  confidenceAndClarity: string;
} 