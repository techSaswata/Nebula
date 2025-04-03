import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Interview } from "@/types/interview";

interface CourseRow {
  id: number;
  Name: string;
  "Tag Line": string;
  price: number;
  level: string;
  Description: string;
  Tests: number;
  Interviews: number;
  Memberships: number;
  Sold: number;
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const supabase = createClientComponentClient();

    const { data: interview, error } = await supabase
      .from('interviews')
      .select(`
        id,
        user_id,
        course_id,
        status,
        created_at,
        completed_at,
        courses (
          id,
          Name,
          "Tag Line",
          price,
          level,
          Description,
          Tests,
          Interviews,
          Memberships,
          Sold
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching interview:', error.message);
      return null;
    }

    if (!interview) {
      return null;
    }

    // Transform the data to match the Interview interface
    return {
      id: interview.id,
      userId: interview.user_id,
      courseId: interview.course_id,
      status: interview.status,
      createdAt: interview.created_at,
      completedAt: interview.completed_at,
      course: interview.courses ? {
        id: interview.courses.id,
        name: interview.courses.Name,
        tagline: interview.courses["Tag Line"],
        price: interview.courses.price,
        level: interview.courses.level,
        description: interview.courses.Description,
        features: getFeaturesForCourse(interview.courses.id),
        whyJoin: getWhyJoinForCourse(interview.courses.id),
        recommended: interview.courses.id === 5,
        highlights: getHighlightsForCourse(interview.courses.id)
      } : null
    };
  } catch (error) {
    console.error('Error in getInterviewById:', error);
    return null;
  }
}

// Helper functions to get static data based on course ID
function getFeaturesForCourse(courseId: number): string[] {
  const featuresMap: Record<number, string[]> = {
    1: ["1 Mock Test", "1 AI Mock Interview", "Basic Study Materials", "Community Access"],
    2: ["4 Mock Tests", "1 Mentorship Session", "Detailed Performance Analysis", "Study Schedule"],
    3: ["4 AI Mock Interviews", "1 Mentorship Session", "Interview Preparation Guide", "Performance Analytics"],
    4: ["3 Mentorship Sessions", "Personalized Study Plan", "Progress Tracking", "Dedicated Aspirant & Mentor Groups"],
    5: ["4 Mock Tests", "4 AI Mock Interviews", "Weekly Mentorship Sessions", "Dedicated Aspirant & Mentor Groups", "Premium Study Materials", "Priority Support"],
    6: ["10 Mock Tests", "10 AI Mock Interviews", "Weekly Mentorship Sessions", "Dedicated Aspirant & Mentor Groups", "Premium Study Materials", "Priority Support", "Personal Success Coach"]
  };
  return featuresMap[courseId] || [];
}

function getWhyJoinForCourse(courseId: number): string[] {
  const whyJoinMap: Record<number, string[]> = {
    1: ["Zero investment to start your preparation", "Experience our AI-powered interview system", "Join our supportive community", "Get a feel of the actual exam pattern"],
    2: ["Comprehensive test series", "Personalized mentorship", "Structured study plan", "Affordable pricing"],
    3: ["First-ever AI interview system in NSET preparation", "Real-time feedback and improvement suggestions", "Personalized interview strategies", "Expert mentorship guidance"],
    4: ["Regular mentorship support", "Personalized study strategies", "Progress monitoring", "Budget-friendly option"],
    5: ["Balanced mix of tests and interviews", "Weekly mentorship for continuous guidance", "Access to exclusive study materials", "Dedicated community support", "Best value for money"],
    6: ["Maximum practice opportunities", "Intensive interview preparation", "Weekly mentorship for consistent growth", "Exclusive study materials", "Personal success coach", "Highest success rate"]
  };
  return whyJoinMap[courseId] || [];
}

function getHighlightsForCourse(courseId: number): string[] {
  const highlightsMap: Record<number, string[]> = {
    1: ["Experience our revolutionary AI interview system", "Get a taste of the actual exam pattern", "Join our supportive community", "No commitment required"],
    2: ["Regular mock tests for consistent practice", "Expert mentorship guidance", "Detailed performance analysis", "Structured study schedule"],
    3: ["Revolutionary AI interview system", "Real-time feedback and analysis", "Personalized interview strategies", "Expert mentorship support"],
    4: ["Regular mentorship sessions", "Personalized study strategies", "Progress tracking", "Dedicated support"],
    5: ["Comprehensive preparation package", "Weekly mentorship sessions", "Exclusive study materials", "Dedicated community support", "Best value for money"],
    6: ["Maximum practice opportunities", "Intensive interview preparation", "Weekly mentorship sessions", "Exclusive study materials", "Personal success coach", "Highest success rate"]
  };
  return highlightsMap[courseId] || [];
} 