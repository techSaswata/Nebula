"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Users, 
  ArrowRight,
  GraduationCap,
  Video,
  User
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/actions/interview.action"
import { Interview, DetailedFeedback } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import FeedbackPopup from "@/components/interview/FeedbackPopup"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { createInterview } from "@/lib/actions/interview.action"

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

export default function DashboardPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<DetailedFeedback | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) {
        setInterviews(null)
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const userInterviews = await getInterviewsByUserId(user.id)
        
        if (userInterviews) {
          const convertedInterviews = userInterviews.map(interview => ({
            id: interview.id,
            title: interview.title,
            description: interview.description,
            userId: interview.userId,
            status: interview.status,
            position: interview.position,
            scheduledDate: interview.scheduledDate,
            duration: interview.duration || 60,
            company: interview.company || "NSET",
            notes: interview.notes,
            createdAt: interview.createdAt || new Date().toISOString(),
            updatedAt: interview.updatedAt || new Date().toISOString(),
            feedbackId: interview.feedbackId,
            feedback: interview.feedback ? {
              id: interview.feedback.id,
              interviewId: interview.feedback.interviewId,
              userId: interview.feedback.userId,
              totalScore: interview.feedback.totalScore || 0,
              categoryScores: interview.feedback.categoryScores || {
                communicationSkills: 0,
                technicalKnowledge: 0,
                problemSolving: 0,
                culturalAndRoleFit: 0,
                confidenceAndClarity: 0,
                questionCompletion: 0
              },
              strengths: interview.feedback.strengths || [],
              areasForImprovement: interview.feedback.areasForImprovement || [],
              topicsToImprove: interview.feedback.topicsToImprove || {
                correct: [],
                wrong: []
              },
              detailedRemarks: interview.feedback.detailedRemarks || {
                communication: "",
                technical: "",
                problemSolving: "",
                cultural: "",
                completion: "",
                overall: ""
              },
              finalAssessment: interview.feedback.finalAssessment || "",
              createdAt: interview.feedback.createdAt || new Date().toISOString(),
              recommendationScore: interview.feedback.recommendationScore,
              passStatus: interview.feedback.passStatus,
              correctAnswers: interview.feedback.correctAnswers || {},
              wrongAnswers: interview.feedback.wrongAnswers || {},
              unattemptedAnswers: interview.feedback.unattemptedAnswers || {},
              correct_answers: interview.feedback.correct_answers,
              wrong_answers: interview.feedback.wrong_answers
            } : null
          }))
          setInterviews(convertedInterviews)
        } else {
          setInterviews([])
        }
      } catch (error) {
        console.error("Error fetching interviews:", error)
        toast.error("Failed to fetch interviews")
        setInterviews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterviews()
  }, [user])

  const scheduledInterviews = interviews?.filter(i => i.status === 'scheduled' || i.status === 'active') || []

  const handleViewFeedback = async (interviewId: string, feedbackId: string) => {
    try {
      if (!user?.id) {
        toast.error("Please log in to view feedback")
        return
      }
      
      const feedback = await getFeedbackByInterviewId({
        interviewId,
        userId: user.id
      })
      
      if (feedback) {
        const detailedFeedback: DetailedFeedback = {
          id: feedback.id,
          interviewId: feedback.interviewId,
          userId: feedback.userId,
          totalScore: feedback.totalScore,
          categoryScores: feedback.categoryScores,
          topicsToImprove: [...feedback.topicsToImprove.correct, ...feedback.topicsToImprove.wrong],
          detailedRemarks: feedback.detailedRemarks.overall,
          strengths: feedback.strengths,
          areasForImprovement: feedback.areasForImprovement,
          created_at: feedback.createdAt,
          updated_at: feedback.createdAt,
          correctAnswers: feedback.correctAnswers,
          wrongAnswers: feedback.wrongAnswers,
          unattemptedAnswers: feedback.unattemptedAnswers,
          passStatus: feedback.passStatus,
          recommendationScore: feedback.recommendationScore
        }
        setSelectedFeedback(detailedFeedback)
      } else {
        toast.error("Could not load feedback data. Please try again.")
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
      toast.error("Error loading feedback. Please try again.")
    }
  }

  const startInterview = async () => {
    if (!user) return;
    
    const result = await createInterview({
      userId: user.id,
      interviewType: selectedType || 'DSA',
      position: selectedPosition || 'Software Engineer'
    });
    
    if (result.interviewId) {
      router.push(`/interview/${result.interviewId}/setup`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
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
            {/* My Courses */}
            <section className="rounded-2xl p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="h-6 w-6 text-violet-500" />
                <h2 className="text-2xl font-bold text-violet-950">My Courses</h2>
              </div>
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-white/80 backdrop-blur-sm border border-violet-100 rounded-xl p-4"
                  >
                    <h3 className="font-semibold mb-2 text-gray-900">{course.title}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              course.progress < 30 ? "from-rose-500 to-pink-500" :
                              course.progress < 70 ? "from-amber-500 to-orange-500" :
                              "from-emerald-500 to-teal-500"
                            }`}
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
            <section className="rounded-2xl p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-6 w-6 text-rose-500" />
                <h2 className="text-2xl font-bold text-rose-950">Upcoming Exams</h2>
              </div>
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-xl p-4"
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
                          className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
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
            <section className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Video className="h-6 w-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-amber-950">Upcoming Interviews</h2>
                </div>
                <Link href="/schedule-interview">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    Schedule New
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
                </div>
              ) : scheduledInterviews.length > 0 ? (
              <div className="space-y-4">
                  {scheduledInterviews.map((interview) => (
                  <div 
                    key={interview.id} 
                      className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl p-4"
                  >
                      <h3 className="font-semibold text-gray-900">{interview.title}</h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="h-4 w-4" />
                            <span className="text-sm">{new Date(interview.scheduledDate).toLocaleString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                            <User className="h-4 w-4" />
                            <span className="text-sm">With {interview.company}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                            {interview.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                      </span>
                      <Link href={`/interview/${interview.id}/setup`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          Join Interview
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-4">You don't have any upcoming interviews scheduled</p>
                  <Link href="/schedule-interview">
                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600">
                      Schedule Your First Interview
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* Upcoming Mentorship */}
            <section className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-emerald-500" />
                  <h2 className="text-2xl font-bold text-emerald-950">Upcoming Mentorship</h2>
              </div>
                <Link href="/schedule-mentorship">
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Schedule Another
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900">Dr. Smith</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">2024-04-25 at 10:00 AM</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">NSET Preparation - Problem Solving Strategies</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-950">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/courses">
              <Button 
                variant="outline" 
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 justify-start"
              >
                Browse Courses
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/practice">
                  <Button 
                    variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 justify-start"
                  >
                    Practice Tests
                <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
            <Link href="/schedule-interview">
                  <Button 
                    variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 justify-start"
                  >
                    Schedule Interview
                <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
            <Link href="/progress">
                  <Button 
                    variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 justify-start"
                  >
                    View Progress
                <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </section>

        {/* Feedback popup */}
        {selectedFeedback && (
          <FeedbackPopup 
            feedback={selectedFeedback} 
            onClose={() => setSelectedFeedback(null)} 
          />
        )}
      </div>
    </div>
  )
}