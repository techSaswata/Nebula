"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Award, ArrowRight, Users, Star, Crown, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllCourses, Course } from "@/lib/services/course.service"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses()
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "text-purple-600"
      case "beginner to intermediate":
        return "text-blue-600"
      case "intermediate":
        return "text-red-600"
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-[#6C4BF4]/20 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-[#6C4BF4] border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative pt-16 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C4BF4]/10 text-[#6C4BF4] text-sm font-medium mb-6 animate-fade-in-up">
                <Star className="w-4 h-4" />
                Ace Your NSET Journey
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                Elevate Your <span className="text-[#6C4BF4]">NSET Prep</span>
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Experience personalized learning with AI mock interviews, practice tests, and expert mentorship to crack NSET
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div 
              key={course.id}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-visible animate-fade-in-up backdrop-blur-sm border border-[#6C4BF4]/10 flex flex-col h-[26rem]"
              style={{ animationDelay: `${(index + 2) * 150}ms` }}
            >
              {course.recommended && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-3">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <Crown className="h-4 w-4" />
                    Popular Choice
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6C4BF4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden" />
              <div className="p-6 relative flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#6C4BF4] transition-colors duration-300">
                      {course.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1.5 ${getLevelColor(course.level)}`}>
                        <Award className="h-4 w-4" />
                        {course.level}
                      </span>
                      {course.price === 0 && (
                        <span className="bg-gradient-to-r from-[#6C4BF4]/10 to-[#5B3FD1]/20 text-[#6C4BF4] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                          Free Course
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-3 line-clamp-2 group-hover:line-clamp-none transition-all duration-500 min-h-[3rem]">
                  {course.tagline}
                </p>

                <div className="space-y-1.5 mb-2 flex-1">
                  {course.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#6C4BF4]" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-3xl font-bold text-[#6C4BF4] group-hover:scale-105 transition-transform duration-300">
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block transform transition-transform duration-300">
                    <Button 
                      className="w-full bg-[#6C4BF4] hover:bg-[#5B3FD1] text-white shadow-md hover:shadow-xl transition-all group text-lg py-4 relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {course.name === "Aarambh" ? "Let's Study" : "View Details"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#5B3FD1] to-[#6C4BF4] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}