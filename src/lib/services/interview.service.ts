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