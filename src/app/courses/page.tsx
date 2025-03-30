"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, Filter, BookOpen, Clock, Award, ArrowRight, Users } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"

type Course = {
  id: string
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
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform the data to match our Course type
        const transformedCourses = data.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          duration: course.duration,
          level: course.level,
          students: course.students || 0, // Default to 0 if not set
          image: course.image || "/courses/default-course.jpg" // Default image if not set
        }))

        setCourses(transformedCourses)
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error("Failed to load courses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  const filteredCourses = courses.filter((course) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent animate-fade-in">
              Available Courses
            </h1>
            <p className="text-gray-600 max-w-2xl animate-slide-up [animation-delay:200ms]">
              Explore our comprehensive selection of courses designed to help you excel in your NSET preparation journey.
            </p>
          </div>
          <div className="relative w-full md:w-72 animate-fade-in [animation-delay:400ms]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const color = getCourseColor(index)
            return (
              <div
                key={course.id}
                className={`relative bg-gradient-to-br ${color.bg} border ${color.border} rounded-2xl p-6 ${color.shadow} animate-fade-in transform-gpu origin-center`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${color.text}`}>
                      {course.title}
                    </h3>
                    <span className={`${getLevelColor(course.level)} text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium`}>
                      <Award className="h-4 w-4" />
                      {course.level}
                    </span>
                  </div>

                  <p className="text-gray-600 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${color.text}`}>
                      <Clock className={`h-4 w-4 ${color.icon}`} />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${color.text}`}>
                      <Users className={`h-4 w-4 ${color.icon}`} />
                      <span className="text-sm">{course.students} students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className={`text-2xl font-bold ${color.text}`}>
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                      }).format(course.price)}
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <Button 
                        className={`bg-white border ${color.border} ${color.text}`}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 