"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Sparkles, Users, BookOpen, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Search, Filter, BookOpen, Clock, Award, ArrowRight, Users } from "lucide-react"

const mockCourses = [
  {
    id: 1,
    title: "NSET Complete Preparation",
    description: "Comprehensive course covering all NSET topics with practice tests and detailed explanations.",
    price: 99,
    duration: "12 weeks",
    level: "Beginner",
    students: 1234,
    image: "/courses/nset-complete.jpg"
  },
  {
    id: 2,
    title: "NSET Advanced Problem Solving",
    description: "Master advanced problem-solving techniques for higher scores in NSET examination.",
    price: 149,
    duration: "8 weeks",
    level: "Advanced",
    students: 856,
    image: "/courses/problem-solving.jpg"
  },
  {
    id: 3,
    title: "NSET Mock Test Series",
    description: "Practice with real NSET-style questions and get detailed performance analytics.",
    price: 79,
    duration: "6 weeks",
    level: "Intermediate",
    students: 2156,
    image: "/courses/mock-tests.jpg"
  },
  {
    id: 4,
    title: "NSET Crash Course",
    description: "Quick revision of all important topics with focus on most frequently asked questions.",
    price: 59,
    duration: "4 weeks",
    level: "Intermediate",
    students: 1589,
    image: "/courses/crash-course.jpg"
  },
  {
    id: 5,
    title: "NSET Interview Preparation",
    description: "Comprehensive guide to ace the NSET interview round with mock interviews.",
    price: 129,
    duration: "6 weeks",
    level: "Advanced",
    students: 745,
    image: "/courses/interview-prep.jpg"
  },
  {
    id: 6,
    title: "NSET Fundamentals",
    description: "Build strong foundations with this beginner-friendly course covering basic concepts.",
    price: 89,
    duration: "10 weeks",
    level: "Beginner",
    students: 3267,
    image: "/courses/fundamentals.jpg"
  }
]

type Course = {
  id: number
  title: string
  description: string
  price: number
  duration: string
  level: string
  students: number
  image: string
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesLevel =
      selectedLevel === "all" || course.level.toLowerCase() === selectedLevel
    return matchesSearch && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm shadow-green-100"
      case "intermediate":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100"
      case "advanced":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm shadow-purple-100"
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm"
    }
  }

  const getCourseColor = (index: number) => {
    const colors = [
      { bg: "from-rose-50 to-rose-100", text: "text-rose-700", border: "border-rose-200", hover: "group-hover:bg-rose-100", icon: "text-rose-500", shadow: "shadow-rose-200/50" },
      { bg: "from-amber-50 to-amber-100", text: "text-amber-700", border: "border-amber-200", hover: "group-hover:bg-amber-100", icon: "text-amber-500", shadow: "shadow-amber-200/50" },
      { bg: "from-emerald-50 to-emerald-100", text: "text-emerald-700", border: "border-emerald-200", hover: "group-hover:bg-emerald-100", icon: "text-emerald-500", shadow: "shadow-emerald-200/50" },
      { bg: "from-cyan-50 to-cyan-100", text: "text-cyan-700", border: "border-cyan-200", hover: "group-hover:bg-cyan-100", icon: "text-cyan-500", shadow: "shadow-cyan-200/50" },
      { bg: "from-violet-50 to-violet-100", text: "text-violet-700", border: "border-violet-200", hover: "group-hover:bg-violet-100", icon: "text-violet-500", shadow: "shadow-violet-200/50" },
      { bg: "from-pink-50 to-pink-100", text: "text-pink-700", border: "border-pink-200", hover: "group-hover:bg-pink-100", icon: "text-pink-500", shadow: "shadow-pink-200/50" }
    ]
    return colors[index % colors.length]
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Choose Your Path to Success
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect course package that aligns with your preparation needs and goals.
            Each package is designed to provide you with the right tools and support for your NSET journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const color = getCourseColor(index)
            return (
              <div
                key={course.id}
                className={`group relative bg-gradient-to-br ${color.bg} border ${color.border} rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${color.shadow} animate-fade-in transform-gpu origin-center`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out rounded-2xl pointer-events-none" />
                <div className="relative space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${color.text} group-hover:bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500`}>
                      {course.title}
                    </h3>
                    <span className={`${getLevelColor(course.level)} text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium`}>
                      <Award className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      {course.level}
                    </span>
                  </div>

                  <p className="text-gray-600 line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${color.text}`}>
                      <Clock className={`h-4 w-4 ${color.icon}`} />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatPrice(course.price)}</div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className={`text-2xl font-bold ${color.text} group-hover:bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500`}>
                      ${course.price}
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <Button 
                        className={`bg-white border ${color.border} ${color.text} group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 hover:scale-105`}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    {course.id === 1 ? "Let's Study" : "Explore"}
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 