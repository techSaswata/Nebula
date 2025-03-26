"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Sparkles, 
  GraduationCap, 
  Target, 
  Users, 
  Video, 
  ArrowRight, 
  Copy, 
  CheckCircle,
  BookOpen,
  Brain,
  Trophy,
  Rocket,
  Star,
  MessageCircle,
  Gift,
  X,
  Tag
} from "lucide-react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
  const [promoCode] = useState("SASW3CA7")
  const [copied, setCopied] = useState(false)
  const [showPromo, setShowPromo] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        setShowPromo(false)
      }, 500)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promoCode)
      setCopied(true)
      toast.success("Promo code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }

  const handleApplyNow = async () => {
    try {
      await navigator.clipboard.writeText(promoCode)
      toast.success("Promo code copied! Opening Scaler website...")
      // Open Scaler School of Technology website in a new window
      window.open("https://www.scaler.com/school-of-technology/", "_blank")
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Floating Promo Widget */}
      {showPromo && (
        <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative bg-white/30 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden group">
            <button 
              onClick={() => setShowPromo(false)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/20 text-violet-600 hover:bg-white/30 transition-colors z-10"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                  <Gift className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Special Offer!</h3>
                  <p className="text-xs text-gray-700">Get 50% OFF on NSET registration</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <code className="font-mono text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{promoCode}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-md bg-white/20 text-violet-600 hover:bg-white/30 transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <Button 
                  onClick={handleApplyNow}
                  className="w-full bg-gradient-to-r from-violet-600/80 to-indigo-600/80 hover:from-violet-700/90 hover:to-indigo-700/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group backdrop-blur-sm text-sm py-1.5"
                >
                  Apply Now
                  <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Promo Button */}
      {!showPromo && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <Button
            onClick={() => {
              setShowPromo(true)
              setIsVisible(true)
            }}
            className="bg-gradient-to-r from-violet-600/80 to-indigo-600/80 hover:from-violet-700/90 hover:to-indigo-700/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group rounded-full px-3 py-1.5 text-sm backdrop-blur-sm"
          >
            <Tag className="w-3.5 h-3.5 mr-1.5" />
            Promo Code
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 -z-10" />
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-200 text-violet-600 font-medium shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Your Gateway to Scaler School of Technology</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tight">
              Master the
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> NSET Exam </span>
              with Confidence
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our comprehensive preparation program designed to help you excel in the Scaler School of Technology entrance exam. Get expert guidance, practice resources, and personalized feedback.
            </p>
            <div className="flex gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-violet-200 text-violet-700 hover:bg-violet-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Explore Courses
              </Button>
            </div>
            <div className="pt-8 flex items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Extensive Test Series</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Experienced Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>AI Interview Preparation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-4xl font-bold">
              Everything You Need to
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Ace NSET</span>
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive resources and tools designed to maximize your preparation and boost your confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Comprehensive Study Material",
                description: "Access detailed notes, video lectures, and practice questions covering all NSET topics.",
                color: "rose"
              },
              {
                icon: Target,
                title: "Mock Tests",
                description: "Practice with full-length tests that simulate the actual NSET exam environment.",
                color: "amber"
              },
              {
                icon: Brain,
                title: "Topic-Wise Practice",
                description: "Focus on specific areas with our curated question banks and detailed solutions.",
                color: "emerald"
              },
              {
                icon: MessageCircle,
                title: "Mock Interviews",
                description: "Prepare for the interview round with our experienced mentors and get personalized feedback.",
                color: "cyan"
              },
              {
                icon: Trophy,
                title: "Performance Analytics",
                description: "Track your progress with detailed analytics and identify areas for improvement.",
                color: "violet"
              },
              {
                icon: Rocket,
                title: "Expert Guidance",
                description: "Get mentored by SST students who have excelled in NSET and academics.",
                color: "fuchsia"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className={`group bg-white border border-${feature.color}-200 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-${feature.color}-200/50 animate-fade-in`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${feature.color}-500`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="container mx-auto text-center px-8">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-4xl font-bold">
              Learn from the
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Best</span>
            </h2>
            <p className="text-xl text-gray-600">
              Our mentors are SST students who have excelled in NSET and are passionate about helping you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[85rem] mx-auto">
            {[
              {
                name: "Saswata Das",
                role: "Co-Founder",
                image: "/mentors/saswata.jpg",
                achievements: [
                  "AIR 4039 in JEE Adv. 2024",
                  "Mentored 50+ NSET aspirants",
                  "1k+ followers on LinkedIn",
                  "Member of Innovation Lab"
                ]
              },
              {
                name: "Harshit Tiwari",
                role: "Co-Founder",
                image: "/mentors/harshit.jpg",
                achievements: [
                  "25% Scholarship at SST",
                  "AIR 100 in NDA",
                  "Specialist @CodeForces"
                ]
              },
              {
                name: "Rohan Jangam",
                role: "Co-Founder",
                image: "/mentors/rohan.jpg",
                achievements: [
                  "Member @NlogN-Club-SST",
                  "Member @OSS Club-SST"
                ]
              },
              {
                name: "Ankit Kumar",
                role: "Co-Founder",
                image: "/mentors/ankit.jpg",
                achievements: [
                  "Member @NlogN-Club-SST",
                  "SIH 2024 Grand Finalist",
                  "Member @OSS Club-SST"
                ]
              }
            ].map((mentor, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-xl animate-fade-in flex flex-col w-full"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-lg">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-6 pt-14 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-1">{mentor.name}</h3>
                  {mentor.role && (
                    <p className="text-violet-600 font-medium mb-4">{mentor.role}</p>
                  )}
                  <div className="space-y-2 flex-1">
                    <h4 className="font-semibold text-gray-900"></h4>
                    <ul className="text-sm space-y-2 min-h-[120px]">
                      {mentor.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <Star className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-left">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 border-violet-200 text-violet-600 hover:bg-violet-50 group"
                  >
                    Connect on LinkedIn
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 -z-10" />
        <div className="container mx-auto text-center text-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Start Your NSET Journey Today
            </h2>
            <p className="text-xl text-white/90">
              Join hundreds of successful students who have achieved their dream of studying at Scaler School of Technology.
            </p>
            <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>
            <div className="pt-8 flex items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Join 500+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span>Expert Mentorship</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>First Ever AI Interview Prep</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}