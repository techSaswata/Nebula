import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Course {
  id: number;
  name: string;
  tagline: string;
  price: number;
  level: string;
  description: string;
  features: string[];
  whyJoin: string[];
  recommended: boolean;
  highlights: string[];
}

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

export async function getAllCourses(): Promise<Course[]> {
  try {
    const supabase = createClientComponentClient();

    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, Name, "Tag Line", price, level, Description')
      .order('id');

    if (error) {
      console.error('Error fetching courses:', error.message);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    if (!courses || courses.length === 0) {
      throw new Error('No courses available');
    }

    // Add static data for features, whyJoin, recommended, and highlights
    const coursesWithStaticData = courses.map(course => ({
      id: course.id,
      name: course.Name,
      tagline: course["Tag Line"],
      price: course.price,
      level: course.level,
      description: course.Description,
      features: getFeaturesForCourse(course.id),
      whyJoin: getWhyJoinForCourse(course.id),
      recommended: course.id === 5, // Lakshya course is recommended
      highlights: getHighlightsForCourse(course.id)
    }));

    return coursesWithStaticData;
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    throw error;
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