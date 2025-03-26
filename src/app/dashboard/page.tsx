"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Users, 
  Target, 
  BarChart, 
  Video, 
  ArrowRight,
  GraduationCap,
  Award
} from "lucide-react"

const upcomingExams = [
  {
    id: 1,
    title: "NSET Mock Test 1",
    date: "2024-04-15",
    duration: "2 hours",
    status: "Scheduled",
  },
  {
    id: 2,
    title: "NSET Practice Assessment",
    date: "2024-04-20",
    duration: "1.5 hours",
    status: "Scheduled",
  },
]

const upcomingInterviews = [
  {
    id: 1,
    title: "Mock NSET Interview",
    date: "2024-04-18",
    time: "10:00 AM",
    interviewer: "Dr. Sharma",
    status: "Scheduled",
  },
  {
    id: 2,
    title: "Technical Assessment",
    date: "2024-04-22",
    time: "2:00 PM",
    interviewer: "Prof. Gupta",
    status: "Pending",
  },
]

const enrolledCourses = [
  {
    id: 1,
    title: "NSET Complete Preparation",
    progress: 60,
    nextLesson: "Problem Solving Strategies",
    totalStudents: 1234,
  },
  {
    id: 2,
    title: "NSET Advanced Concepts",
    progress: 30,
    nextLesson: "Advanced Mathematics",
    totalStudents: 856,
  },
]

const getProgressColor = (progress: number) => {
  if (progress < 30) return "from-rose-500 to-pink-500"
  if (progress < 70) return "from-amber-500 to-orange-500"
  return "from-emerald-500 to-teal-500"
}

const getSectionStyle = (index: number) => {
  const styles = [
    {
      bg: "bg-gradient-to-br from-violet-50 to-purple-50",
      border: "border-violet-200",
      shadow: "shadow-violet-200/50",
      text: "text-violet-950",
      icon: "text-violet-500"
    },
    {
      bg: "bg-gradient-to-br from-rose-50 to-pink-50",
      border: "border-rose-200",
      shadow: "shadow-rose-200/50",
      text: "text-rose-950",
      icon: "text-rose-500"
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
      border: "border-amber-200",
      shadow: "shadow-amber-200/50",
      text: "text-amber-950",
      icon: "text-amber-500"
    },
    {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      shadow: "shadow-emerald-200/50",
      text: "text-emerald-950",
      icon: "text-emerald-500"
    }
  ]
  return styles[index % styles.length]
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your progress, manage your courses, and prepare for upcoming exams and interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Enrolled Courses */}
            <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:200ms] ${getSectionStyle(0).bg} ${getSectionStyle(0).border} shadow-lg hover:shadow-xl transition-all duration-300 group`}>
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className={`h-6 w-6 ${getSectionStyle(0).icon}`} />
                <h2 className={`text-2xl font-bold ${getSectionStyle(0).text}`}>My Courses</h2>
              </div>
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-white/80 backdrop-blur-sm border border-violet-100 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-violet-200/50"
                  >
                    <h3 className="font-semibold mb-2 text-gray-900">{course.title}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress)} transition-all duration-700 ease-in-out`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <BookOpen className="h-4 w-4" />
                          <span>Next: {course.nextLesson}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{course.totalStudents} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Exams */}
            <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:400ms] ${getSectionStyle(1).bg} ${getSectionStyle(1).border} shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-6">
                <Target className={`h-6 w-6 ${getSectionStyle(1).icon}`} />
                <h2 className={`text-2xl font-bold ${getSectionStyle(1).text}`}>Upcoming Exams</h2>
              </div>
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-rose-200/50"
                  >
                    <h3 className="font-semibold mb-3 text-gray-900">{exam.title}</h3>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{exam.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{exam.duration}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">
                        {exam.status}
                      </span>
                      <Link href={`/exam/${exam.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 group"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Interviews */}
            <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:600ms] ${getSectionStyle(2).bg} ${getSectionStyle(2).border} shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-6">
                <Video className={`h-6 w-6 ${getSectionStyle(2).icon}`} />
                <h2 className={`text-2xl font-bold ${getSectionStyle(2).text}`}>Upcoming Interviews</h2>
              </div>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div 
                    key={interview.id} 
                    className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-amber-200/50"
                  >
                    <h3 className="font-semibold mb-3 text-gray-900">{interview.title}</h3>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{interview.date} at {interview.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">With {interview.interviewer}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {interview.status}
                      </span>
                      <Link href={`/interview/${interview.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-amber-200 text-amber-700 hover:bg-amber-50 group"
                        >
                          Join Interview
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:800ms] ${getSectionStyle(3).bg} ${getSectionStyle(3).border} shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-6">
                <BarChart className={`h-6 w-6 ${getSectionStyle(3).icon}`} />
                <h2 className={`text-2xl font-bold ${getSectionStyle(3).text}`}>Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/courses" className="group">
                  <Button 
                    className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800 group-hover:scale-[1.02] transition-all duration-300" 
                    variant="outline"
                  >
                    Browse Courses
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/practice" className="group">
                  <Button 
                    className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800 group-hover:scale-[1.02] transition-all duration-300" 
                    variant="outline"
                  >
                    Practice Tests
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/schedule-interview" className="group">
                  <Button 
                    className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800 group-hover:scale-[1.02] transition-all duration-300" 
                    variant="outline"
                  >
                    Schedule Interview
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/progress" className="group">
                  <Button 
                    className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-800 group-hover:scale-[1.02] transition-all duration-300" 
                    variant="outline"
                  >
                    View Progress
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}