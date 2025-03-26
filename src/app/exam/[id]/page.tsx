"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Info } from "lucide-react"

const mockExam = {
  id: "1",
  title: "Aptitude Assessment",
  duration: 7200, // 2 hours in seconds
  sections: [
    {
      id: "math",
      title: "Mathematics",
      questions: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        question: `Math Question ${i + 1}`,
        answer: null,
      })),
    },
    {
      id: "logical",
      title: "Logical Reasoning",
      questions: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        question: `Logical Question ${i + 1}`,
        answer: null,
      })),
    }
  ]
}

const guidelines = [
  "The test consists of 2 sections: Mathematics and Logical Reasoning",
  "Each section contains 10 questions",
  "All answers must be integers",
  "You can mark questions for review and return to them later",
  "The timer will start as soon as you begin the test",
  "Submit your answers before the timer runs out",
  "You can navigate between sections using the top navigation bar",
  "Your progress is automatically saved"
]

export default function ExamPage({ params }: { params: { id: string } }) {
  const [showGuidelines, setShowGuidelines] = useState(true)
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: string]: {[key: number]: number | null}}>({
    math: {},
    logical: {}
  })
  const [markedForReview, setMarkedForReview] = useState<{[key: string]: number[]}>({
    math: [],
    logical: []
  })
  const [visitedQuestions, setVisitedQuestions] = useState<{[key: string]: number[]}>({
    math: [0],
    logical: []
  })
  const [timeRemaining, setTimeRemaining] = useState(mockExam.duration)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!showGuidelines) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showGuidelines])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerInput = (value: string) => {
    const numValue = value === "" ? null : parseInt(value)
    const sectionId = mockExam.sections[currentSection].id
    setAnswers(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [currentQuestion]: numValue
      }
    }))
  }

  const handleQuestionClick = (index: number) => {
    const sectionId = mockExam.sections[currentSection].id
    setCurrentQuestion(index)
    if (!visitedQuestions[sectionId].includes(index)) {
      setVisitedQuestions(prev => ({
        ...prev,
        [sectionId]: [...prev[sectionId], index]
      }))
    }
  }

  const getQuestionStatus = (sectionId: string, index: number) => {
    if (markedForReview[sectionId].includes(index)) return "marked"
    if (answers[sectionId][index] !== undefined) return "answered"
    if (!visitedQuestions[sectionId].includes(index)) return "not-visited"
    return "not-answered"
  }

  const toggleMarkForReview = () => {
    const sectionId = mockExam.sections[currentSection].id
    setMarkedForReview(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].includes(currentQuestion)
        ? prev[sectionId].filter(q => q !== currentQuestion)
        : [...prev[sectionId], currentQuestion]
    }))
  }

  const handleSaveAndNext = () => {
    const currentSectionQuestions = mockExam.sections[currentSection].questions
    if (currentQuestion < currentSectionQuestions.length - 1) {
      handleQuestionClick(currentQuestion + 1)
    } else if (currentSection < mockExam.sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentQuestion(0)
      const nextSectionId = mockExam.sections[currentSection + 1].id
      if (!visitedQuestions[nextSectionId].includes(0)) {
        setVisitedQuestions(prev => ({
          ...prev,
          [nextSectionId]: [0]
        }))
      }
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  if (showGuidelines) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-indigo-900 mb-8">
              Test Guidelines
            </h1>
            <div className="space-y-4 mb-8">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{guideline}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowGuidelines(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Start Test
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-indigo-900 mb-4">Test Complete</h1>
            <p className="text-gray-700 mb-8">
              Your responses have been submitted successfully.
            </p>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => window.location.href = "/dashboard"}
            >
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-3 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
          {mockExam.title}
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono bg-black/20 backdrop-blur-sm px-4 py-1 rounded-lg border border-white/20">
            {formatTime(timeRemaining)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-all duration-300 ease-in-out"
            onClick={() => setShowInstructionsDialog(true)}
          >
            <Info className="w-5 h-5 mr-1 animate-pulse" />
            Instructions
          </Button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            {/* Section Navigation */}
            <div className="flex gap-4 mb-6">
              {mockExam.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(index)
                    if (!visitedQuestions[section.id].includes(currentQuestion)) {
                      setVisitedQuestions(prev => ({
                        ...prev,
                        [section.id]: [...prev[section.id], currentQuestion]
                      }))
                    }
                    setCurrentQuestion(0)
                  }}
                  className={`
                    px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5
                    ${currentSection === index
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:text-indigo-600 shadow-sm'
                    }
                  `}
                >
                  {section.title}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Question {currentQuestion + 1}
              </h2>
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-t-4 border-t-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <p className="text-gray-800 mb-6 text-lg">
                  {mockExam.sections[currentSection].questions[currentQuestion].question}
                </p>
                <Input
                  type="number"
                  placeholder="Enter your answer (integer only)"
                  value={answers[mockExam.sections[currentSection].id][currentQuestion] ?? ""}
                  onChange={(e) => handleAnswerInput(e.target.value)}
                  className="mb-6 border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveAndNext}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Save & Next
                  </Button>
                  <Button
                    variant="outline"
                    onClick={toggleMarkForReview}
                    className={`
                      transition-all duration-300 transform hover:-translate-y-0.5
                      ${markedForReview[mockExam.sections[currentSection].id].includes(currentQuestion)
                        ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                        : 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300'
                      }
                    `}
                  >
                    Mark for Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAnswerInput("")}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Clear Response
                  </Button>
                </div>
              </Card>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuestionClick(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuestionClick(Math.min(mockExam.sections[currentSection].questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === mockExam.sections[currentSection].questions.length - 1}
                  className="border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Next
                </Button>
              </div>
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                End Test
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 bg-gradient-to-b from-white to-indigo-50 border-l border-l-indigo-100 p-4 shadow-lg">
          <div className="mb-6 bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2 mb-2 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-gray-600">Not Answered</span>
            </div>
            <div className="flex items-center gap-2 mb-2 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-sm text-gray-600">Marked for Review</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
              <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
              <span className="text-sm text-gray-600">Not Visited</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {mockExam.sections[currentSection].questions.map((_, index) => {
              const status = getQuestionStatus(mockExam.sections[currentSection].id, index)
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(index)}
                  className={`
                    w-8 h-8 text-xs font-medium rounded-lg flex items-center justify-center
                    transform hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md
                    ${status === 'answered' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : ''}
                    ${status === 'not-answered' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : ''}
                    ${status === 'marked' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : ''}
                    ${status === 'not-visited' ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' : ''}
                    ${currentQuestion === index ? 'ring-2 ring-offset-2 ring-indigo-500 animate-pulse' : ''}
                  `}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <Dialog open={showInstructionsDialog} onOpenChange={setShowInstructionsDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-indigo-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Test Instructions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {guidelines.map((guideline, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/80 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700">{guideline}</p>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setShowInstructionsDialog(false)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Continue Test
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}