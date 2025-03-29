"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Info } from "lucide-react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import MalpracticeDetector from "@/components/exam/MalpracticeDetector"

// Define question type
interface Question {
  id: number
  question: string
  correct_answer: number
  difficulty: string
  category: string
}

interface ExamSection {
  id: string
  title: string
  questions: Question[]
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

// Add type definition for MathJax
declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      startup: {
        promise: Promise<void>;
        defaultReady: () => void;
      };
    };
  }
}

// MathJax configuration
const MATHJAX_CONFIG = {
  loader: {
    load: ['input/tex-full', 'output/chtml']
  },
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']],
    processEscapes: true,
    packages: {'[+]': ['ams', 'noerrors', 'html']}
  },
  chtml: {
    scale: 1,
    minScale: 0.5,
    mtextInheritFont: true
  },
  startup: {
    typeset: true
  }
}

// Function to process LaTeX content directly from question text
const processLatexContent = (content: string) => {
  if (!content) return ''

  // Protect newlines
  content = content.replace(/\\n/g, '\n')

  // Process LaTeX directly from the question text
  // Split content into segments (text and math)
  const segments: (string | { type: "math"; display: boolean; content: string })[] = []
  let currentPos = 0

  while (currentPos < content.length) {
    const displayStart = content.indexOf("$$", currentPos)
    const inlineStart = content.indexOf("$", currentPos)

    if (displayStart === -1 && inlineStart === -1) {
      segments.push(content.slice(currentPos))
      break
    }

    if (displayStart !== -1 && (displayStart < inlineStart || inlineStart === -1)) {
      if (displayStart > currentPos) {
        segments.push(content.slice(currentPos, displayStart))
      }
      const endPos = content.indexOf("$$", displayStart + 2)
      if (endPos === -1) break
      segments.push({
        type: "math",
        display: true,
        content: content.slice(displayStart + 2, endPos)
      })
      currentPos = endPos + 2
    } else {
      if (inlineStart > currentPos) {
        segments.push(content.slice(currentPos, inlineStart))
      }
      const endPos = content.indexOf("$", inlineStart + 1)
      if (endPos === -1) break
      segments.push({
        type: "math",
        display: false,
        content: content.slice(inlineStart + 1, endPos)
      })
      currentPos = endPos + 1
    }
  }

  // Convert segments to HTML
  return segments
    .map(segment => {
      if (typeof segment === "string") {
        return segment.split("\n").join("<br/>")
      }
      if (segment.type === "math") {
        return segment.display
          ? `<div class="math-display">\\[${segment.content}\\]</div>`
          : `<span class="math-inline">\\(${segment.content}\\)</span>`
      }
      return ""
    })
    .join("")
}

// A separate component to render MathJax content
function MathJaxDisplay({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = content
    if (typeof window !== "undefined" && window.MathJax) {
      window.MathJax.typesetPromise([containerRef.current]).catch((err: any) =>
        console.error("MathJax typeset failed: ", err)
      )
    }
  }, [content])

  return (
    <div
      className="question-content text-gray-800 mb-6 text-lg prose prose-indigo max-w-none"
      ref={containerRef}
    />
  )
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showGuidelines, setShowGuidelines] = useState(true)
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false)
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: { [key: number]: string | number | null } }>({
    math: {}
  })
  const [markedForReview, setMarkedForReview] = useState<{ [key: string]: number[] }>({
    math: []
  })
  const [visitedQuestions, setVisitedQuestions] = useState<{ [key: string]: number[] }>({
    math: []
  })
  const [timeRemaining, setTimeRemaining] = useState(7200)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastActiveTime, setLastActiveTime] = useState(Date.now())
  const [warningTime, setWarningTime] = useState<number | null>(null)
  const [warningCount, setWarningCount] = useState(0)
  const warningCountRef = useRef(0)
  const router = useRouter()
  const [examData, setExamData] = useState<{
    id: string
    title: string
    duration: number
    sections: ExamSection[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullscreenCountdown, setFullscreenCountdown] = useState(10)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const focusLostStartTime = useRef<number | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch math questions
        console.log("Fetching math questions...");
        const mathResponse = await fetch("/api/questions?category=maths&limit=10");
        const mathData = await mathResponse.json();

        if (!mathResponse.ok) {
          throw new Error(mathData.error || "Failed to fetch math questions");
        }

        if (!mathData.questions?.length) {
          throw new Error("No math questions available");
        }

        console.log(`Loaded ${mathData.questions.length} math questions`);

        // Fetch logical reasoning questions
        console.log("Fetching logical reasoning questions...");
        const reasoningResponse = await fetch("/api/questions?category=reasoning&limit=10");
        const reasoningData = await reasoningResponse.json();

        if (!reasoningResponse.ok) {
          throw new Error(reasoningData.error || "Failed to fetch reasoning questions");
        }

        if (!reasoningData.questions?.length) {
          throw new Error("No reasoning questions available");
        }

        console.log(`Loaded ${reasoningData.questions.length} reasoning questions`);

        // Set exam data with both sections
        setExamData({
          id: "1",
          title: "NSET mock",
          duration: 7200,
          sections: [
            {
              id: "math",
              title: "Mathematics",
              questions: mathData.questions,
            },
            {
              id: "reasoning",
              title: "Logical Reasoning",
              questions: reasoningData.questions,
            },
          ],
        });

        // Initialize answers for both sections
        setAnswers({
          math: Object.fromEntries(mathData.questions.map((question: Question, i: number) => [i, null])),
          reasoning: Object.fromEntries(reasoningData.questions.map((question: Question, i: number) => [i + 10, null])),
        });

        // Initialize visited questions with only the first question of each section
        setVisitedQuestions({
          math: [0],
          reasoning: [10],
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch questions");
        setIsLoading(false);
        toast.error("Failed to load questions. Please try again.");
      }
    };

    fetchQuestions();
  }, []);

  const enterFullscreen = () => {
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen()
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
  }

  const handleTermination = useCallback(() => {
    setIsSubmitted(true);
    toast.error('Test terminated due to violation of exam rules.');
    
    // Exit fullscreen before redirecting
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
    } else if ((document as any).webkitFullscreenElement) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozFullScreenElement) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msFullscreenElement) {
      (document as any).msExitFullscreen();
    }

    // Delay navigation to ensure fullscreen exit completes
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  }, [router]);

  const handleWarningCountUpdate = useCallback((count: number) => {
    warningCountRef.current = count
  }, [])

  useEffect(() => {
    setWarningCount(warningCountRef.current)
  }, [warningCountRef.current])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastActiveTime(Date.now());
        setWarningTime(Date.now());
        focusLostStartTime.current = Date.now();
        // Dismiss previous toast and show new one immediately
        toast.dismiss();
        toast.error('Warning: Return to exam window within 10 seconds.', {
          duration: 0 // Set duration to 0 to prevent auto-dismiss
        });
      } else if (focusLostStartTime.current) {
        const lostTime = Math.floor((Date.now() - focusLostStartTime.current) / 1000);
        if (lostTime >= 10) {
          handleTermination();
        } else {
          // Dismiss previous toast and show new one immediately
          toast.dismiss();
          toast.error(`Time away from exam: ${lostTime} seconds. Maximum allowed: 10 seconds`, {
            duration: 0 // Set duration to 0 to prevent auto-dismiss
          });
        }
        focusLostStartTime.current = null;
      }
    };

    const handleFocusChange = () => {
      if (!document.hasFocus()) {
        setLastActiveTime(Date.now());
        setWarningTime(Date.now());
        focusLostStartTime.current = Date.now();
        // Dismiss previous toast and show new one immediately
        toast.dismiss();
        toast.error('Warning: Return to exam window within 10 seconds.', {
          duration: 0 // Set duration to 0 to prevent auto-dismiss
        });
      } else if (focusLostStartTime.current) {
        const lostTime = Math.floor((Date.now() - focusLostStartTime.current) / 1000);
        if (lostTime >= 10) {
          handleTermination();
        } else {
          // Dismiss previous toast and show new one immediately
          toast.dismiss();
          toast.error(`Time away from exam: ${lostTime} seconds. Maximum allowed: 10 seconds`, {
            duration: 0 // Set duration to 0 to prevent auto-dismiss
          });
        }
        focusLostStartTime.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleFocusChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleFocusChange);
      toast.dismiss(); // Clean up any remaining toasts
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement ||
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement

      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen && !showGuidelines && !isSubmitted) {
        setShowFullscreenWarning(true)
        // Reset countdown when fullscreen is exited
        setFullscreenCountdown(10)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [showGuidelines, isSubmitted])

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;
    
    if (showFullscreenWarning) {
      countdownInterval = setInterval(() => {
        setFullscreenCountdown((prev) => {
          if (prev <= 1) {
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
            handleTermination();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      };
    }
  }, [showFullscreenWarning, handleTermination]);

  useEffect(() => {
    if (!showGuidelines && warningTime) {
      const checkWarning = setInterval(() => {
        const currentTime = Date.now()
        if (currentTime - warningTime >= 10000 && !isFullscreen) {
          clearInterval(checkWarning)
          toast.error('Test terminated: You exited fullscreen mode for too long.')
          setTimeout(() => handleTermination(), 1000)
          setWarningTime(null)
        }
      }, 1000)

      return () => clearInterval(checkWarning)
    }
  }, [showGuidelines, warningTime, isFullscreen, handleTermination])

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
    const sectionId = examData?.sections[currentSection]?.id
    if (!sectionId) return

    // Get the actual question index to store in answers
    const answerIndex = sectionId === "reasoning" ? currentQuestion + 10 : currentQuestion

    setAnswers(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [answerIndex]: value === "" ? null : value
      }
    }))
  }

  const handleQuestionClick = (index: number) => {
    const sectionId = examData?.sections[currentSection]?.id
    if (!sectionId) return

    setCurrentQuestion(index)
    
    // Get the actual index for this section and question
    const actualIndex = sectionId === "reasoning" ? index + 10 : index
    
    if (!visitedQuestions[sectionId]?.includes(actualIndex)) {
      setVisitedQuestions(prev => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), actualIndex]
      }))
    }
  }

  const getQuestionStatus = (sectionId: string, index: number) => {
    // Get the actual index for this section and question
    const actualIndex = sectionId === "reasoning" ? index + 10 : index
    
    if (markedForReview[sectionId]?.includes(actualIndex)) return "marked"
    if (answers[sectionId]?.[actualIndex] !== null && answers[sectionId]?.[actualIndex] !== undefined) return "answered"
    if (!visitedQuestions[sectionId]?.includes(actualIndex)) return "not-visited"
    return "not-answered"
  }

  const toggleMarkForReview = () => {
    const sectionId = examData?.sections[currentSection]?.id
    if (!sectionId) return

    // Get the actual question index for the current section
    const questionIndex = sectionId === "reasoning" ? currentQuestion + 10 : currentQuestion

    setMarkedForReview(prev => ({
      ...prev,
      [sectionId]: prev[sectionId]?.includes(questionIndex)
        ? prev[sectionId].filter(q => q !== questionIndex)
        : [...(prev[sectionId] || []), questionIndex]
    }))
  }

  const handleSaveAndNext = () => {
    if (!examData) return

    const currentSectionQuestions = examData.sections[currentSection]?.questions
    if (!currentSectionQuestions) return

    if (currentQuestion < currentSectionQuestions.length - 1) {
      handleQuestionClick(currentQuestion + 1)
    } else if (currentSection < examData.sections.length - 1) {
      // Moving to next section
      const nextSection = currentSection + 1
      setCurrentSection(nextSection)
      setCurrentQuestion(0) // Always start at the first question
      
      // Ensure the first question of the next section is marked as visited
      const nextSectionId = examData.sections[nextSection].id
      const firstQuestionIndex = nextSectionId === "reasoning" ? 10 : 0
      
      if (!visitedQuestions[nextSectionId]?.includes(firstQuestionIndex)) {
        setVisitedQuestions(prev => ({
          ...prev,
          [nextSectionId]: [...(prev[nextSectionId] || []), firstQuestionIndex]
        }))
      }
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleStartTest = () => {
    setShowGuidelines(false)
    enterFullscreen()
  }

  // Add effect to disable right-click and text selection
  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const disableSelection = (e: Event) => {
      // Allow selection within input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Disable right click
    document.addEventListener('contextmenu', disableRightClick);
    
    // Disable text selection except for input fields
    document.addEventListener('selectstart', disableSelection);
    document.addEventListener('mousedown', disableSelection);
    
    // Add CSS to disable text selection except for input fields
    document.body.style.userSelect = 'none';
    (document.body.style as any).webkitUserSelect = 'none';
    (document.body.style as any).MozUserSelect = 'none';
    (document.body.style as any).msUserSelect = 'none';

    // Enable selection for input fields
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.style.userSelect = 'text';
      (input.style as any).webkitUserSelect = 'text';
      (input.style as any).MozUserSelect = 'text';
      (input.style as any).msUserSelect = 'text';
    });

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('selectstart', disableSelection);
      document.removeEventListener('mousedown', disableSelection);
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).MozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    };
  }, []);

  // Add enhanced screenshot prevention
  useEffect(() => {
    const preventScreenshot = (e: KeyboardEvent) => {
      // Block Cmd+Space (Spotlight) more aggressively
      if (e.metaKey && (e.code === 'Space' || e.key === ' ' || e.keyCode === 32)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toast.error('System shortcuts are not allowed during the exam');
        return false;
      }

      // Detect Mac shortcuts
      if (e.metaKey || e.key === 'Meta') {
        e.preventDefault();
        e.stopPropagation();

        // Block all combinations with Meta key
        if (
          e.key === 'c' || e.key === 'C' || // Copy
          e.key === 'v' || e.key === 'V' || // Paste
          e.key === 'x' || e.key === 'X' || // Cut
          e.key === 'a' || e.key === 'A' || // Select all
          e.key === 'p' || e.key === 'P' || // Print
          e.key === 's' || e.key === 'S' || // Save
          ['3', '4', '5', '6'].includes(e.key) || // Screenshots
          e.key === 'Tab' // Tab switching
        ) {
          toast.error('System shortcuts are not allowed during the exam');
          return false;
        }
      }

      // Block common screenshot combinations
      if (
        (e.ctrlKey && e.shiftKey) || // Ctrl+Shift combinations
        (e.altKey && e.shiftKey) ||  // Alt+Shift combinations
        e.key === 'PrintScreen' ||    // PrintScreen key
        e.key === 'F12' ||           // Developer tools
        (e.ctrlKey && (e.key === 'p' || e.key === 'P')) || // Print
        (e.altKey && e.key === 'PrintScreen') // Alt+PrintScreen
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Screenshots are not allowed during the exam');
        return false;
      }
    };

    // Add event listeners with capture phase
    document.addEventListener('keydown', preventScreenshot, true);
    window.addEventListener('keydown', preventScreenshot, true);

    return () => {
      document.removeEventListener('keydown', preventScreenshot, true);
      window.removeEventListener('keydown', preventScreenshot, true);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Questions</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (showGuidelines) {
    return (
      <>
        <MalpracticeDetector examId={id} onTerminate={handleTermination} />
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
                <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg border border-red-100 mt-6">
                  <p className="text-red-700 font-medium">
                    ⚠️ Any attempt at malpractice (tab switching, right-click, keyboard shortcuts, etc.) will be detected and will result in test termination after 5 attempts
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white text-xl py-6 rounded-xl flex items-center justify-center gap-2 group"
              >
                Start Test
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transform group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Button>
            </Card>
          </div>
        </div>
      </>
    )
  }

  if (isSubmitted) {
    return (
      <>
        <MalpracticeDetector examId={id} onTerminate={handleTermination} />
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-12">
            <Card className="max-w-2xl mx-auto p-8">
              <h1 className="text-4xl font-bold text-indigo-900 mb-4">Test Complete</h1>
              <p className="text-gray-700 mb-8">
                Your responses have been submitted successfully.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white text-xl py-6 rounded-xl flex items-center justify-center gap-2 group"
                onClick={() => window.location.href = "/dashboard"}
              >
                Return to Dashboard
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transform group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Button>
            </Card>
          </div>
        </div>
      </>
    )
  }

  // Main exam interface
  return (
    <>
      <Script
        id="mathjax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.MathJax = ${JSON.stringify(MATHJAX_CONFIG)};`
        }}
      />
      <Script
        id="mathjax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("MathJax script loaded")
        }}
      />

      {!showGuidelines && !isSubmitted && (
        <MalpracticeDetector 
          examId={id} 
          onTerminate={handleTermination} 
          onWarningCountUpdate={handleWarningCountUpdate} 
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-3 px-6 flex justify-between items-center shadow-lg">
          <h1 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
            {examData?.title}
          </h1>
          <div className="flex items-center gap-4">
            {warningCount > 0 && (
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${warningCount >= 8 ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}>
                Warnings: {warningCount}/10
              </div>
            )}
            <div className="text-xl font-mono bg-black/20 backdrop-blur-sm px-4 py-1 rounded-lg border border-white/20">
              {formatTime(timeRemaining)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-all duration-300"
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
                {examData?.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(index)
                      setCurrentQuestion(0) // Always start at first question of section
                      
                      // Make sure the first question of the section is marked as visited
                      const firstQuestionIndex = section.id === "reasoning" ? 10 : 0
                      if (!visitedQuestions[section.id]?.includes(firstQuestionIndex)) {
                        setVisitedQuestions(prev => ({
                          ...prev,
                          [section.id]: [...(prev[section.id] || []), firstQuestionIndex]
                        }))
                      }
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
                  Question {currentSection === 1 ? currentQuestion + 11 : currentQuestion + 1}
                </h2>
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-t-4 border-t-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Render MathJax directly from question text */}
                  <MathJaxDisplay 
                    content={processLatexContent(
                      examData?.sections[currentSection]?.questions[currentQuestion]?.question || ""
                    )}
                  />
                  <Input
                    type="text"
                    placeholder="Enter your answer"
                    value={answers[examData?.sections[currentSection]?.id || '']?.[currentSection === 1 ? currentQuestion + 10 : currentQuestion] ?? ""}
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
                        ${markedForReview[examData?.sections[currentSection]?.id || '']?.includes(
                          examData?.sections[currentSection]?.id === "reasoning" ? currentQuestion + 10 : currentQuestion
                        )
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
                    onClick={() => examData && handleQuestionClick(Math.max(0, currentQuestion - 1))}
                    disabled={!examData || currentQuestion === 0}
                    className="border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => examData && handleQuestionClick(
                      Math.min(examData.sections[currentSection].questions.length - 1, currentQuestion + 1)
                    )}
                    disabled={!examData || currentQuestion === examData.sections[currentSection].questions.length - 1}
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
              {examData?.sections[currentSection].questions.map((_, index) => {
                const status = getQuestionStatus(examData.sections[currentSection].id, index)
                const displayNumber = examData.sections[currentSection].id === "reasoning" ? index + 11 : index + 1
                return (
                  <button
                    key={index}
                    onClick={() => examData && handleQuestionClick(index)}
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
                    {displayNumber}
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

        <Dialog 
          open={showFullscreenWarning}
          onOpenChange={() => {}} // This prevents the dialog from closing on outside click
          modal={true}
        >
          <DialogContent className="bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-600">Fullscreen Required</DialogTitle>
              <DialogDescription className="text-gray-600">
                The exam must be taken in fullscreen mode. Please return to fullscreen within {fullscreenCountdown} seconds to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="text-6xl font-bold text-red-600">
                {fullscreenCountdown}
              </div>
              <Button
                onClick={() => {
                  enterFullscreen();
                  setShowFullscreenWarning(false);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Return to Fullscreen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
