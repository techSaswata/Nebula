"use client"

import { Button } from "@/components/ui/button"
import { Award, Crown, ArrowRight, BookOpen, Users, Clock, CheckCircle2, Target, Sparkles } from "lucide-react"
import { useEffect, useState, use } from "react"
import { getAllCourses, Course } from "@/lib/services/course.service"

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courses = await getAllCourses()
        const foundCourse = courses.find(c => c.id === parseInt(resolvedParams.id))
        if (!foundCourse) {
          throw new Error('Course not found')
        }
        setCourse(foundCourse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [resolvedParams.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-[#6C4BF4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <p className="text-gray-600">{error || "The course you're looking for doesn't exist."}</p>
        </div>
      </div>
    )
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "text-purple-600"
      case "beginner to intermediate":
        return "text-blue-600"
      case "intermediate":
        return "text-indigo-600"
      case "all levels":
        return "text-purple-600"
      case "intermediate to advanced":
        return "text-emerald-600"
      case "advanced":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* Hero Section with Features */}
      <div className="relative overflow-hidden bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Course Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <span className={`flex items-center gap-1.5 ${getLevelColor(course.level)}`}>
                  <Award className="h-5 w-5" />
                  {course.level}
                </span>
                {course.recommended && (
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Crown className="h-4 w-4" />
                    Popular Choice
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {course.name}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                {course.tagline}
              </p>

              <div className="flex items-center gap-8 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#6C4BF4]" />
                  <span className="text-gray-700">3 Months</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#6C4BF4]" />
                  <span className="text-gray-700">1:1 Mentorship</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#6C4BF4]" />
                  <span className="text-gray-700">Guaranteed Results</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-4xl font-bold text-[#6C4BF4]">
                  {course.price === 0 ? 'Free' : `₹${course.price}`}
                </span>
                <Button className="bg-[#6C4BF4] hover:bg-[#5B3FD1] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                  <span className="flex items-center gap-2">
                    Enroll Now
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </div>
            </div>

            {/* Right Side - What You'll Get */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#6C4BF4]/10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
              <div className="grid grid-cols-1 gap-4">
                {course.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-6 rounded-xl bg-[#F8F7FF] border border-[#6C4BF4]/10">
                    <div className="h-8 w-8 rounded-full bg-[#6C4BF4]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-[#6C4BF4]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{feature}</h3>
                      <p className="text-sm text-gray-600">Enhance your preparation with our comprehensive features.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
        <div className="space-y-12">
          {/* About Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#6C4BF4]/10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Course</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              {course.description}
            </div>
          </section>

          {/* Why Join Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#6C4BF4]/10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Join This Course</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.whyJoin.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-4 p-6 rounded-xl bg-[#F8F7FF] border border-[#6C4BF4]/10">
                  <div className="h-8 w-8 rounded-full bg-[#6C4BF4]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-[#6C4BF4]" />
                  </div>
                  <div>
                    <p className="text-gray-600">{reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Course Highlights */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#6C4BF4]/10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Course Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-3 p-6 rounded-xl bg-[#F8F7FF] border border-[#6C4BF4]/10">
                  <div className="h-6 w-6 rounded-full bg-[#6C4BF4]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-[#6C4BF4]" />
                  </div>
                  <span className="text-gray-600">{highlight}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 
