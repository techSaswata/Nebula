"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

export default function Home() {
  const [promoCode] = useState("SASW3CA7")

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promoCode)
      toast.success("Promo code copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Promo Banner */}
      <div className="bg-[#000000] w-full py-4 px-4 text-center">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <button 
            onClick={copyToClipboard}
            className="group relative bg-white/20 px-3 py-1 rounded-md text-white hover:bg-white/30 transition-colors"
          >
            <code>{promoCode}</code>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/75 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Click to copy
            </span>
          </button>
          <span className="text-white">Use this code for 50% OFF on NSET registration (₹500 instead of ₹1000)</span>
          <Button variant="secondary" size="sm" className="bg-white text-[#000000] hover:bg-white/90">Apply Now</Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Ace the<br />
              <span className="text-[#000000]">Scaler NSET Exam</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive preparation resources to help you secure admission to Scaler School of Technology. Our specialized NSET test series and expert mentorship set you up for success.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-[#000000] hover:bg-[#000000]/90 text-white">Free Sample Test</Button>
              <Button variant="outline" size="lg" className="border-[#000000] text-[#000000] hover:bg-[#000000]/10">Explore Test Series</Button>
            </div>
          </div>
        </div>
      </section>

      {/* NSET Prep Resources */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            NSET <span className="text-[#000000]">Prep Resources</span>
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Everything you need to prepare effectively and ace the Scaler School of Technology entrance exam.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Resource Cards */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-[#000000]/10 p-4 rounded-lg inline-block mb-6">
                <svg className="w-8 h-8 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Comprehensive Test Series</h3>
              <p className="text-gray-600 mb-6">Access our extensive collection of NSET practice tests with detailed solutions and performance analytics.</p>
              <Link href="/courses">
                <Button variant="outline" className="w-full border-[#000000] text-[#000000] hover:bg-[#000000]/10">View Tests</Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-[#000000]/10 p-4 rounded-lg inline-block mb-6">
                <svg className="w-8 h-8 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Topic-Wise Practice</h3>
              <p className="text-gray-600 mb-6">Strengthen specific areas with our topic-focused question banks covering all NSET exam sections.</p>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-[#000000] text-[#000000] hover:bg-[#000000]/10">Start Practice</Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-[#000000]/10 p-4 rounded-lg inline-block mb-6">
                <svg className="w-8 h-8 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Mock Interviews</h3>
              <p className="text-gray-600 mb-6">Practice with simulated interview sessions that mirror the actual Scaler School of Technology selection process.</p>
              <Link href="/interview">
                <Button variant="outline" className="w-full border-[#000000] text-[#000000] hover:bg-[#000000]/10">Schedule Mock</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Our <span className="text-[#000000]">Mentors</span>
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Learn from experienced SST students who've excelled in the NSET exam and
            are ready to guide you to success.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mentor Cards */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="h-40 bg-[#000000]"></div>
              <div className="p-6 relative">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <img
                    src="/mentors/saswata.jpg"
                    alt="Saswata"
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                </div>
                <div className="mt-16 text-center">
                  <h3 className="text-xl font-bold mb-1">Saswata Das (Co-Founder)</h3>
                  <p className="text-[#000000] text-sm mb-4">Guided 40+ aspirants for NSET</p>
                  <div className="space-y-2 text-left mb-6">
                    <h4 className="font-semibold">ACHIEVEMENTS</h4>
                    <ul className="text-sm space-y-1">
                      <li>• AIR loda lussun in JEE Advanced 2024</li>
                      <li>• 1k+ (bss yahi ek chiz hai)followers on LinkedIn</li>
                      <li>• Member of Innovation Lab</li>
                    </ul>
                  </div>
                  <Link href="" className="w-full">
                    <Button variant="outline" className="w-full border-[#4361EE] text-[#4361EE] hover:bg-[#4361EE]/10">
                      Connect on LinkedIn
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="h-40 bg-[#000000]"></div>
              <div className="p-6 relative">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <img
                    src="/mentors/harshit.jpg"
                    alt="Harshit"
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                </div>
                <div className="mt-16 text-center">
                  <h3 className="text-xl font-bold mb-4">Harshit Tiwari (Co-Founder)</h3>
                  <div className="space-y-2 text-left mb-6">
                    <h4 className="font-semibold">ACHIEVEMENTS</h4>
                    <ul className="text-sm space-y-1">
                      <li>• offered 25% Scholarship at SST</li>
                      <li>• AIR 100 in NDA</li>
                      <li>• Member @NlogN-Club-SST</li>
                      <li>• Specialist @CodeForces</li>
                    </ul>
                  </div>
                  <Link href="" className="w-full">
                    <Button variant="outline" className="w-full border-[#4361EE] text-[#4361EE] hover:bg-[#4361EE]/10">
                      Connect on LinkedIn
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="h-40 bg-[#000000]"></div>
              <div className="p-6 relative">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <img
                    src="/mentors/viraj.jpg"
                    alt="Viraj"
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                </div>
                <div className="mt-16 text-center">
                  <h3 className="text-xl font-bold mb-4">Viraj Bhanage (Co-Founder)</h3>
                  <div className="space-y-2 text-left mb-6">
                    <h4 className="font-semibold">ACHIEVEMENTS</h4>
                    <ul className="text-sm space-y-1">
                      <li>• </li>
                      <li>• Member @NlogN-Club-SST</li>
                      <li>• Pupil @CodeForces</li>
                    </ul>
                  </div>
                  <Link href="" className="w-full">
                    <Button variant="outline" className="w-full border-[#4361EE] text-[#4361EE] hover:bg-[#4361EE]/10">
                      Connect on LinkedIn
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="h-40 bg-[#000000]"></div>
              <div className="p-6 relative">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <img
                    src="/mentors/ankit.jpg"
                    alt="Ankit"
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                </div>
                <div className="mt-16 text-center">
                  <h3 className="text-xl font-bold mb-4">Ankit Kumar</h3>
                  <div className="space-y-2 text-left mb-6">
                    <h4 className="font-semibold">ACHIEVEMENTS</h4>
                    <ul className="text-sm space-y-1">
                      <li>• </li>
                      <li>• Member @NlogN-Club-SST</li>
                      <li>• </li>
                    </ul>
                  </div>
                  <Link href="" className="w-full">
                    <Button variant="outline" className="w-full border-[#4361EE] text-[#4361EE] hover:bg-[#4361EE]/10">
                      Connect on LinkedIn
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#000000] text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Start Your NSET Preparation Today
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Join hundreds of students who are preparing for Scaler School of
            Technology's entrance exam with Vector.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-[#000000] hover:bg-white/90"
          >
            Login to Access
          </Button>
          <p className="mt-8 text-sm">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AcademiX</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive preparation resources to help you crack the Scaler School of Technology NSET entrance exam.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-gray-600 hover:text-[#000000]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#000000]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#000000]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#000000]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-gray-500 font-medium mb-4">PREPARATION</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Test Series</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Topic-Wise Practice</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Mock Interviews</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Live Sessions</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Performance Analysis</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-500 font-medium mb-4">RESOURCES</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">About NSET Exam</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Syllabus</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Blog</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Success Stories</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-500 font-medium mb-4">SUPPORT</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Help Center</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-[#000000]">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}