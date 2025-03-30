"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Award, UserCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"

type Course = {
  id: string
  title: string
  description: string
  longDescription: string
  price: number
  duration: string
  level: string
  instructor: string
  topics: string[]
  syllabus: {
    week: number
    title: string
    topics: string[]
  }[]
}

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

const getWeekColor = (week: number) => {
  const colors = [
    { bg: "bg-rose-50", hover: "hover:bg-rose-100", text: "text-rose-700", border: "border-rose-200", light: "bg-rose-100", icon: "bg-rose-400" },
    { bg: "bg-amber-50", hover: "hover:bg-amber-100", text: "text-amber-700", border: "border-amber-200", light: "bg-amber-100", icon: "bg-amber-400" },
    { bg: "bg-emerald-50", hover: "hover:bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-100", icon: "bg-emerald-400" },
    { bg: "bg-cyan-50", hover: "hover:bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", light: "bg-cyan-100", icon: "bg-cyan-400" },
    { bg: "bg-violet-50", hover: "hover:bg-violet-100", text: "text-violet-700", border: "border-violet-200", light: "bg-violet-100", icon: "bg-violet-400" },
    { bg: "bg-pink-50", hover: "hover:bg-pink-100", text: "text-pink-700", border: "border-pink-200", light: "bg-pink-100", icon: "bg-pink-400" },
  ]
  return colors[(week - 1) % colors.length]
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Transform the data to match our Course type
        const transformedCourse: Course = {
          id: data.id,
          title: data.title,
          description: data.description,
          longDescription: data.long_description,
          price: data.price,
          duration: data.duration,
          level: data.level,
          instructor: data.instructor,
          topics: data.topics || [],
          syllabus: data.syllabus || []
        }

        setCourse(transformedCourse)
      } catch (error) {
        console.error('Error fetching course:', error)
        toast.error("Failed to load course details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [params.id, supabase])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Course not found</h1>
            <p className="text-gray-600 mt-2">The course you're looking for doesn't exist or has been removed.</p>
            <Link href="/courses">
              <Button className="mt-4">Back to Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent animate-fade-in">
              {course.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6 animate-slide-up">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full animate-fade-in">
                <Clock className="h-5 w-5 text-rose-500" />
                <span className="font-semibold text-sm text-rose-600">Duration:</span>
                <span className="text-rose-500">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full animate-fade-in [animation-delay:200ms]">
                <Award className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-sm text-gray-700">Level:</span>
                <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full animate-fade-in [animation-delay:400ms]">
                <UserCircle className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-sm text-amber-600">Instructor:</span>
                <span className="text-amber-500">{course.instructor}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 animate-fade-in [animation-delay:600ms]">
              <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                }).format(course.price)}
              </span>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-gray-200 animate-slide-up [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">Course Overview</CardTitle>
            <CardDescription>Key skills you'll master</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.topics.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 bg-cyan-50 p-3 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-cyan-500 mt-0.5" />
                  <span className="text-sm text-cyan-700">{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-gray-200 animate-slide-up [animation-delay:400ms]">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">Course Syllabus</CardTitle>
            <CardDescription>Weekly breakdown of the course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {course.syllabus.map((week) => {
                const color = getWeekColor(week.week)
                return (
                  <div 
                    key={week.week} 
                    className={`border ${color.border} pb-4 last:border-0 ${color.bg} p-4 rounded-lg animate-fade-in`}
                    style={{ animationDelay: `${week.week * 150}ms` }}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${color.text} flex items-center gap-2`}>
                      <span className={`${color.light} px-3 py-1.5 rounded-full text-sm font-bold`}>
                        Week {week.week}
                      </span>
                      <span>{week.title}</span>
                    </h3>
                    <ul className="list-none space-y-2 pl-4">
                      {week.topics.map((topic, index) => (
                        <li 
                          key={index} 
                          className={`${color.text} pl-4 relative opacity-0 animate-slide-up`}
                          style={{ animationDelay: `${week.week * 150 + index * 100}ms` }}
                        >
                          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${color.icon}`}></span>
                          <span className="inline-block">
                            {topic}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}