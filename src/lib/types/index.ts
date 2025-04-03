export type InterviewStatus = 'scheduled' | 'active' | 'attempted' | 'completed' | 'cancelled' | 'in-progress';

export interface Interview {
  id: string;
  title: string;
  description: string;
  userId: string;
  scheduledDate: string;
  status: InterviewStatus;
  duration: number;
  position?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  feedbackId?: string;
  feedback?: InterviewFeedback | null;
}

export interface InterviewFeedback {
  id: string;
  totalScore: number;
  categoryScores: {
    communicationSkills: number;
    technicalKnowledge: number;
    problemSolving: number;
    culturalAndRoleFit: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
} 