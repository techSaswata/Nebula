"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Mock interview data - in a real app, this would come from an API
const mockInterview = {
  id: "1",
  title: "Technical Interview",
  interviewer: "John Doe",
  duration: "1 hour",
  status: "In Progress",
  questions: [
    {
      id: 1,
      question: "Can you explain how React's virtual DOM works?",
      type: "technical",
    },
    {
      id: 2,
      question: "What are closures in JavaScript and how do they work?",
      type: "technical",
    },
    {
      id: 3,
      question: "Explain the difference between REST and GraphQL.",
      type: "technical",
    },
  ],
}

export default function InterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [notes, setNotes] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [submittedAnswers, setSubmittedAnswers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer before proceeding")
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setSubmittedAnswers([...submittedAnswers, currentAnswer])
      setCurrentAnswer("")
      
      if (currentQuestion < mockInterview.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        toast.success("Answer submitted successfully!")
      } else {
        toast.success("Interview completed! Redirecting to dashboard...")
        setTimeout(() => router.push("/dashboard"), 1500)
      }
      setIsSubmitting(false)
    }, 1000)
  }

  const handleEndInterview = () => {
    toast.success("Interview ended. Redirecting to dashboard...")
    setTimeout(() => router.push("/dashboard"), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Video and Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Area */}
              <div className="aspect-video bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/25">
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/80 bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm font-medium">
                      Camera is off
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  className={`
                    relative overflow-hidden px-6 py-3 rounded-xl font-medium transition-all duration-300
                    ${isAudioOn 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:from-indigo-700 hover:to-purple-700" 
                      : "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    }
                  `}
                  onClick={() => setIsAudioOn(!isAudioOn)}
                >
                  <span className="relative z-10">{isAudioOn ? "Mute" : "Unmute"}</span>
                </Button>
                <Button
                  variant="outline"
                  className={`
                    relative overflow-hidden px-6 py-3 rounded-xl font-medium transition-all duration-300
                    ${isVideoOn 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700" 
                      : "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    }
                  `}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  <span className="relative z-10">{isVideoOn ? "Turn Off Camera" : "Turn On Camera"}</span>
                </Button>
                <Button 
                  variant="destructive" 
                  className="relative overflow-hidden px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-rose-600 to-red-600 text-white border-0 hover:from-rose-700 hover:to-red-700 transition-all duration-300"
                  onClick={handleEndInterview}
                >
                  <span className="relative z-10">End Interview</span>
                </Button>
              </div>

              {/* Current Question and Answer Section */}
              <Card className="border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-purple-500/25">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-white/90 font-medium">Question {currentQuestion + 1} of {mockInterview.questions.length}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-lg text-white/80">
                    {mockInterview.questions[currentQuestion].question}
                  </p>
                  
                  <div className="space-y-4">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full min-h-[120px] rounded-xl border border-white/20 bg-black/20 backdrop-blur-sm px-4 py-3 text-white/80 placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    />
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 rounded-xl py-3 font-medium"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <span>Submit Answer & Continue</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Interview Info and Notes */}
            <div className="space-y-6">
              {/* Interview Info */}
              <Card className="border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-indigo-500/25">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-white/90 font-medium">Interview Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60">Interviewer</p>
                      <p className="font-medium text-white/90">{mockInterview.interviewer}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Duration</p>
                      <p className="font-medium text-white/90">{mockInterview.duration}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Time Elapsed</p>
                      <p className="font-medium text-white/90 tabular-nums">{formatTime(timeElapsed)}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Progress</p>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${(submittedAnswers.length / mockInterview.questions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-pink-500/25">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-white/90 font-medium">Interview Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <textarea
                    className="w-full min-h-[200px] rounded-xl border border-white/20 bg-black/20 backdrop-blur-sm px-4 py-3 text-white/80 placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Take notes during the interview..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}