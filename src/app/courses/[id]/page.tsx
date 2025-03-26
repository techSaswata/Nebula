"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Award, UserCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

// Mock course data - in a real app, this would come from an API
const mockCourse = {
  id: "1",
  title: "Web Development Fundamentals",
  description: "Learn HTML, CSS, and JavaScript basics",
  longDescription: `This comprehensive course covers everything you need to know about web development fundamentals. 
    Starting from the basics of HTML and CSS, you'll progress through modern JavaScript concepts and learn how to build 
    responsive, interactive websites.`,
  price: 49.99,
  duration: "6 weeks",
  level: "Beginner",
  instructor: "John Doe",
  topics: [
    "HTML5 Structure and Semantics",
    "CSS3 Styling and Layouts",
    "JavaScript Fundamentals",
    "DOM Manipulation",
    "Responsive Design",
    "Basic Web APIs",
  ],
  syllabus: [
    {
      week: 1,
      title: "Introduction to HTML",
      topics: ["Basic HTML structure", "Common HTML elements", "Semantic HTML"],
    },
    {
      week: 2,
      title: "CSS Fundamentals",
      topics: ["CSS selectors", "Box model", "Flexbox layouts"],
    },
    {
      week: 3,
      title: "JavaScript Basics",
      topics: ["Variables and data types", "Control flow", "Functions"],
    },
    {
      week: 4,
      title: "DOM and Events",
      topics: ["DOM traversal", "Event handling", "DOM manipulation"],
    },
    {
      week: 5,
      title: "Responsive Design",
      topics: ["Media queries", "Mobile-first design", "Responsive layouts"],
    },
    {
      week: 6,
      title: "Final Project",
      topics: ["Project planning", "Implementation", "Deployment"],
    },
  ],
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
  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-200/50">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent animate-fade-in">
              {mockCourse.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6 animate-slide-up">
              {mockCourse.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full hover:bg-rose-100 transition-colors animate-fade-in group">
                <Clock className="h-5 w-5 text-rose-500 group-hover:text-rose-600 transition-colors" />
                <span className="font-semibold text-sm text-rose-600">Duration:</span>
                <span className="text-rose-500">{mockCourse.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors animate-fade-in [animation-delay:200ms]">
                <Award className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-sm text-gray-700">Level:</span>
                <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${getLevelColor(mockCourse.level)}`}>
                  {mockCourse.level}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors animate-fade-in [animation-delay:400ms] group">
                <UserCircle className="h-5 w-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
                <span className="font-semibold text-sm text-amber-600">Instructor:</span>
                <span className="text-amber-500">{mockCourse.instructor}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 animate-fade-in [animation-delay:600ms]">
              <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ${mockCourse.price}
              </span>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-indigo-300/50"
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </div>

        <Card className="shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-200/50 border-gray-200 animate-slide-up [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">Course Overview</CardTitle>
            <CardDescription>Key skills you'll master</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCourse.topics.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 bg-cyan-50 p-3 rounded-lg hover:bg-cyan-100 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <CheckCircle className="h-5 w-5 text-cyan-500 mt-0.5 group-hover:scale-110 group-hover:text-cyan-600 transition-all" />
                  <span className="text-sm text-cyan-700">{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-fuchsia-200/50 border-gray-200 animate-slide-up [animation-delay:400ms]">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">Course Syllabus</CardTitle>
            <CardDescription>Weekly breakdown of the course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockCourse.syllabus.map((week) => {
                const color = getWeekColor(week.week)
                return (
                  <div 
                    key={week.week} 
                    className={`border ${color.border} pb-4 last:border-0 group ${color.bg} ${color.hover} p-4 rounded-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-lg animate-fade-in`}
                    style={{ animationDelay: `${week.week * 150}ms` }}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${color.text} transition-colors flex items-center gap-2`}>
                      <span className={`${color.light} px-3 py-1.5 rounded-full text-sm font-bold group-hover:scale-110 transition-transform`}>
                        Week {week.week}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{week.title}</span>
                    </h3>
                    <ul className="list-none space-y-2 pl-4">
                      {week.topics.map((topic, index) => (
                        <li 
                          key={index} 
                          className={`${color.text} transition-all pl-4 relative group/item opacity-0 animate-slide-up`}
                          style={{ animationDelay: `${week.week * 150 + index * 100}ms` }}
                        >
                          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${color.icon} group-hover/item:scale-150 transition-transform duration-500`}></span>
                          <span className="group-hover/item:translate-x-1 transition-transform duration-300 inline-block">
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