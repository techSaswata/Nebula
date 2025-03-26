"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Calendar as CalendarIcon, Clock, Users, ArrowRight, Video, Target, CheckCircle } from "lucide-react"

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
]

const interviewTypes = [
  {
    id: "technical",
    title: "Technical Interview",
    description: "Assessment of technical skills and problem-solving abilities",
    duration: "1 hour",
    icon: Target,
  },
  {
    id: "system-design",
    title: "System Design Interview",
    description: "Discussion of architecture and system design principles",
    duration: "1 hour",
    icon: Users,
  },
  {
    id: "behavioral",
    title: "Behavioral Interview",
    description: "Evaluation of soft skills and past experiences",
    duration: "45 minutes",
    icon: Video,
  },
]

const getSectionStyle = (index: number) => {
  const styles = [
    {
      bg: "bg-gradient-to-br from-violet-50 to-purple-50",
      border: "border-violet-200",
      shadow: "shadow-violet-200/50",
      text: "text-violet-950",
      icon: "text-violet-500",
      hover: "hover:bg-violet-100",
      selected: "bg-violet-100 border-violet-500",
      muted: "text-violet-600"
    },
    {
      bg: "bg-gradient-to-br from-rose-50 to-pink-50",
      border: "border-rose-200",
      shadow: "shadow-rose-200/50",
      text: "text-rose-950",
      icon: "text-rose-500",
      hover: "hover:bg-rose-100",
      selected: "bg-rose-100 border-rose-500",
      muted: "text-rose-600"
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
      border: "border-amber-200",
      shadow: "shadow-amber-200/50",
      text: "text-amber-950",
      icon: "text-amber-500",
      hover: "hover:bg-amber-100",
      selected: "bg-amber-100 border-amber-500",
      muted: "text-amber-600"
    }
  ]
  return styles[index % styles.length]
}

export default function ScheduleInterviewPage() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !selectedType) {
      toast.error("Please fill in all fields")
      return
    }
    
    toast.success("Interview scheduled successfully!", {
      description: `Your ${interviewTypes.find(t => t.id === selectedType)?.title} is scheduled for ${selectedDate} at ${selectedTime}.`
    })
    
    setSelectedDate("")
    setSelectedTime("")
    setSelectedType("")
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Schedule Your Interview
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose your preferred interview type, date, and time slot for your NSET preparation journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Interview Type Selection */}
          <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:200ms] ${getSectionStyle(0).bg} ${getSectionStyle(0).border} shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-6">
              <Target className={`h-6 w-6 ${getSectionStyle(0).icon}`} />
              <h2 className={`text-2xl font-bold ${getSectionStyle(0).text}`}>Select Interview Type</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${
                      selectedType === type.id
                        ? `${getSectionStyle(0).selected} shadow-lg`
                        : `border-violet-100 ${getSectionStyle(0).hover} hover:shadow-lg hover:shadow-violet-200/50`
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${getSectionStyle(0).icon} group-hover:scale-110 transition-transform`} />
                        <CardTitle className={`text-lg ${getSectionStyle(0).text}`}>{type.title}</CardTitle>
                      </div>
                      <CardDescription className={getSectionStyle(0).muted}>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-sm text-violet-600">
                        <Clock className="h-4 w-4" />
                        <span>Duration: {type.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Date Selection */}
          <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:400ms] ${getSectionStyle(1).bg} ${getSectionStyle(1).border} shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className={`h-6 w-6 ${getSectionStyle(1).icon}`} />
              <h2 className={`text-2xl font-bold ${getSectionStyle(1).text}`}>Select Date</h2>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-xl p-4">
              <input
                type="date"
                className="flex h-12 w-full rounded-lg border border-rose-200 bg-white px-4 py-2 text-base text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </section>

          {/* Time Slot Selection */}
          <section className={`rounded-2xl p-6 border animate-slide-up [animation-delay:600ms] ${getSectionStyle(2).bg} ${getSectionStyle(2).border} shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-6">
              <Clock className={`h-6 w-6 ${getSectionStyle(2).icon}`} />
              <h2 className={`text-2xl font-bold ${getSectionStyle(2).text}`}>Select Time Slot</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`group p-4 text-center rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    selectedTime === time
                      ? `${getSectionStyle(2).selected} shadow-lg`
                      : `border-amber-200 ${getSectionStyle(2).hover} hover:shadow-lg hover:shadow-amber-200/50`
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className={`h-4 w-4 ${selectedTime === time ? "text-amber-600" : "text-amber-500"} group-hover:scale-110 transition-transform`} />
                    <span className={selectedTime === time ? "text-amber-900" : "text-amber-800"}>
                      {time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.01] hover:shadow-indigo-300/50 animate-slide-up [animation-delay:800ms]" 
            size="lg"
          >
            Schedule Interview
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </div>
    </div>
  )
} 