"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Users, Clock, CalendarDays, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ScheduleMentorshipPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [date, setDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()

  // Available dates (you can fetch this from your API/backend)
  // months will have 0 based indexing
  const availableDates = [
    new Date(2025, 2, 30), // March 30, 2025 
    new Date(2025, 3, 1),  // April 1, 2025 
    new Date(2025, 3, 2),  // April 2, 2025 
    new Date(2025, 3, 3)   // April 3, 2025 
  ]

  // Function to check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      availableDate.getFullYear() === date.getFullYear() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getDate() === date.getDate()
    )
  }

  // Custom formatter for month display
  const formatCaption = (date: Date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Available times (you can fetch this from your API/backend)
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM"
  ]

  const handleSchedule = async () => {
    if (!date || !selectedTime) {
      toast.error("Please select both date and time")
      return
    }
    if (!isDateAvailable(date)) {
      toast.error("Please select an available date")
      return
    }

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Save the mentorship session
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert([
          {
            user_id: user.id,
            mentor_name: "Dr. Smith", // You can make this dynamic based on available mentors
            date: date.toISOString().split('T')[0],
            time: selectedTime,
            topic: "NSET Preparation",
            status: "scheduled"
          }
        ])
        .select()

      if (error) throw error

      toast.success("Session scheduled successfully!")
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Error scheduling session:', error)
      toast.error("Failed to schedule session. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12 space-y-2 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Schedule a Mentorship Session
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose your preferred date and time for the mentorship session. Our mentors will guide you through your NSET preparation journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100 hover:shadow-xl transition-all duration-300 animate-slide-up [animation-delay:200ms]">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-semibold">Select Date</h2>
          </div>
          <div className="relative">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md"
              formatters={{ formatCaption }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-between items-center px-8 py-2 mb-4",
                caption_label: "text-xl font-medium text-center flex-1",
                nav: "flex items-center justify-between w-full absolute top-0 left-0 px-6",
                nav_button: "h-10 w-10 bg-transparent p-0 text-violet-600 hover:bg-violet-50 rounded-full transition-colors flex items-center justify-center",
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-violet-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-violet-600 text-white hover:bg-violet-600 hover:text-white focus:bg-violet-600 focus:text-white",
                day_today: "bg-violet-100 text-violet-600",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                day_range_middle: "aria-selected:bg-violet-50 aria-selected:text-violet-600",
                day_hidden: "invisible",
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Only highlighted dates are available for booking
          </p>
        </div>

        {/* Time Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100 hover:shadow-xl transition-all duration-300 animate-slide-up [animation-delay:400ms]">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-semibold">Select Time</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  selectedTime === time
                    ? 'border-violet-600 bg-violet-50 text-violet-700 font-medium shadow-lg'
                    : 'border-violet-100 hover:border-violet-200 hover:bg-violet-50/50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Button */}
      <div className="mt-8 flex justify-center animate-slide-up [animation-delay:600ms]">
        <Button
          onClick={handleSchedule}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group px-8 py-6 text-lg"
        >
          Schedule Session
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Users,
            title: "Expert Mentors",
            description: "Learn from experienced SST students who have excelled in NSET"
          },
          {
            icon: Clock,
            title: "Flexible Timing",
            description: "Choose from multiple time slots that suit your schedule"
          },
          {
            icon: CalendarDays,
            title: "Regular Sessions",
            description: "Book recurring sessions to maintain consistent preparation"
          }
        ].map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-violet-100 animate-fade-in"
              style={{ animationDelay: `${(index + 4) * 200}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
} 