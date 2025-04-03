"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { getInterviewsByUserId, getFeedbackByInterviewId, Interview as ActionInterview, InterviewFeedback as ActionInterviewFeedback } from "@/lib/actions/interview.action"
import { Interview, InterviewFeedback, DetailedFeedback } from "@/lib/types"
import { formatDate, getTimeFromNow } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import InterviewCard from "@/components/dashboard/InterviewCard"
import FeedbackPopup from "@/components/interview/FeedbackPopup"
import { toast } from "sonner"
import { BarChart, Loader2, ArrowRight } from "lucide-react"

export default function ProgressPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const feedbackId = searchParams.get('feedback')

  const [interviews, setInterviews] = useState<Interview[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<DetailedFeedback | null>(null)
  
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const userInterviews = await getInterviewsByUserId(user.id)
        if (userInterviews) {
          // Convert ActionInterview to Interview type
          const convertedInterviews: Interview[] = userInterviews.map(interview => ({
            id: interview.id,
            title: interview.title,
            description: interview.description,
            userId: interview.userId,
            scheduledDate: interview.scheduledDate,
            status: interview.status,
            duration: interview.duration,
            position: interview.position,
            company: interview.company,
            notes: interview.notes,
            createdAt: interview.createdAt,
            updatedAt: interview.updatedAt,
            feedbackId: interview.feedbackId,
            feedback: interview.feedback ? {
              id: interview.feedback.id,
              interviewId: interview.feedback.interviewId,
              userId: interview.feedback.userId,
              score: 0, // Default value since it's not in the action type
              feedback: "", // Default value since it's not in the action type
              strengths: interview.feedback.strengths,
              areasForImprovement: interview.feedback.areasForImprovement,
              created_at: interview.feedback.createdAt,
              updated_at: interview.feedback.createdAt
            } : null
          }))
          setInterviews(convertedInterviews)
        }
      } catch (error) {
        console.error("Error fetching interviews:", error)
        toast.error("Failed to fetch interviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterviews()
  }, [user])

  const handleViewFeedback = async (interviewId: string, feedbackId: string) => {
    try {
      if (!user) {
        toast.error("Please log in to view feedback")
        return
      }
      
      const feedback = await getFeedbackByInterviewId({
        interviewId,
        userId: user.id
      })
      
      if (feedback) {
        // Convert ActionInterviewFeedback to DetailedFeedback type
        const detailedFeedback: DetailedFeedback = {
          id: feedback.id,
          interviewId: feedback.interviewId,
          userId: feedback.userId,
          totalScore: feedback.totalScore,
          categoryScores: {
            communicationSkills: feedback.categoryScores.communicationSkills,
            technicalKnowledge: feedback.categoryScores.technicalKnowledge,
            problemSolving: feedback.categoryScores.problemSolving,
            culturalAndRoleFit: feedback.categoryScores.culturalAndRoleFit,
            confidenceAndClarity: feedback.categoryScores.confidenceAndClarity,
            questionCompletion: feedback.categoryScores.questionCompletion
          },
          topicsToImprove: [...feedback.topicsToImprove.correct, ...feedback.topicsToImprove.wrong],
          detailedRemarks: feedback.detailedRemarks.overall,
          strengths: feedback.strengths,
          areasForImprovement: feedback.areasForImprovement,
          created_at: feedback.createdAt,
          updated_at: feedback.createdAt
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

  const completedInterviews = interviews?.filter(i => i.status === 'completed' || i.status === 'attempted') || []

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your interview performance and view detailed feedback to improve your skills.
          </p>
        </div>

        <div className="rounded-2xl p-6 border bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-emerald-950">Interview Results</h2>
            </div>
            <Link href="/schedule-interview">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 group"
              >
                Schedule New
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : completedInterviews.length > 0 ? (
            <div className="space-y-4">
              {completedInterviews.map((interview: Interview) => (
                <InterviewCard 
                  key={interview.id} 
                  interview={interview} 
                  onViewFeedback={handleViewFeedback}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-xl p-6 text-center">
              <p className="text-gray-600">You haven't completed any interviews yet. Schedule one to get started!</p>
              <Link href="/schedule-interview" className="mt-4 inline-block">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                  Schedule Your First Interview
                </Button>
              </Link>
            </div>
          )}
        </div>

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