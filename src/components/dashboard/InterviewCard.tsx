import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Users, ArrowRight } from "lucide-react"
import { Interview } from "@/lib/types"

interface InterviewCardProps {
  interview: Interview
  onViewFeedback?: (interviewId: string, feedbackId: string) => Promise<void>
}

export default function InterviewCard({ interview, onViewFeedback }: InterviewCardProps) {
  // Format the scheduled date and time
  const scheduledDate = new Date(interview.scheduledDate)
  const formattedDate = scheduledDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  })

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-amber-200/50">
      <h3 className="font-semibold mb-3 text-gray-900">{interview.title}</h3>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{formattedDate} at {formattedTime}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Users className="h-4 w-4" />
          <span className="text-sm">Position: {interview.position}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
          {interview.status}
        </span>
        {interview.status === 'completed' && interview.feedbackId && onViewFeedback ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="border-amber-200 text-amber-700 hover:bg-amber-50 group"
            onClick={() => onViewFeedback(interview.id, interview.feedbackId!)}
          >
            View Feedback
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Link href={`/interview/${interview.id}/setup`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-200 text-amber-700 hover:bg-amber-50 group"
            >
              Join Interview
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
} 