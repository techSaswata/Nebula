"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback, updateInterview } from "@/lib/actions/interview.action";
import { baseInterviewer } from "@/lib/vapi-config";
import { CallStatus, InterviewStatus, Transcript } from "./types";
import { InterviewControls } from "./ui/InterviewControls";
import { ParticipantProfile } from "./ui/ParticipantProfile";
import { CodingQuestion } from "@/lib/services/question.service";
import { Button } from "@/components/ui/button";
import InterviewInstructions from './InterviewInstructions';

interface InterviewPageProps {
  userName: string;
  userId: string;
  interviewId: string;
  interviewType?: "technical" | "system-design" | "behavioral";
  feedbackId: string | null;
  position?: string;
  questions: CodingQuestion[];
}

interface SolutionData {
  questionId: string;
  solution: string;
  expectedAnswer: string;
  isCorrect: boolean;
  topic: string;
  question: string;
  timeSpent: number;
  solutionScore: number;
  approachScore: number;
}

export const InterviewPage = ({
  userName,
  userId,
  interviewId,
  interviewType,
  feedbackId,
  position = "Software Engineer",
  questions,
}: InterviewPageProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCurrentQuestion, setShowCurrentQuestion] = useState(false);
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<CodingQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Initialize questions only once when component mounts
  useEffect(() => {
    const storedQuestions = sessionStorage.getItem('interview_questions');
    if (storedQuestions) {
      setInterviewQuestions(JSON.parse(storedQuestions));
    } else if (questions.length > 0) {
      sessionStorage.setItem('interview_questions', JSON.stringify(questions));
      setInterviewQuestions(questions);
      
      // Initialize question attempts tracking in localStorage
      const questionAttempts = questions.map(q => ({
        questionid: q.id,
        status: "unattempted"
      }));
      localStorage.setItem('question_attempts', JSON.stringify(questionAttempts));
      console.log("Initialized question attempts tracking:", questionAttempts);
    }
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining]);

  const handleTimeUp = useCallback(() => {
    console.log("Time's up for current question");
    setIsTimerActive(false);
    
    // Save the state with time expired
    localStorage.setItem('interview_state', JSON.stringify({
      currentQuestionIndex,
      isTimerActive: false,
      timeRemaining: 0,
      isMuted: false,
      transcript: JSON.stringify(transcript)
    }));
    
    // Add a system message to notify the AI that 10 minutes have passed
    const timeUpMessage: Transcript = {
      role: "system",
      content: "10 minutes has passed - ask if the user is ready with an approach, if they can't provide an approach then move to the next question",
      type: "notification",
      metadata: {
        topics: ["time_notification"]
      }
    };
    
    setTranscript(prev => [...prev, timeUpMessage]);
    
    // Time expired while AI was active - manually handle it
    toast.info("Time's up for this question!");
    
    // Force AI to ask for approach using say method
    try {
      const extendedVapi = vapi as unknown as { 
        say?: (message: string, endCallAfterSpoken?: boolean) => void 
      };
      
      if (typeof extendedVapi.say === 'function') {
        setTimeout(() => {
          // Force the AI to speak using the say method
          extendedVapi.say?.(`The 10-minute time limit has expired. Are you ready with an approach to solve this problem?`);
          console.log("AI prompted to ask for approach after time expiration");
        }, 100);
      } else {
        // Fallback to send method if say is not available
        setTimeout(() => {
          vapi.send({
            type: 'add-message',
            message: {
              role: 'system',
              content: 'time expired - ask if user has an approach',
            },
          });
          console.log("System message sent to prompt AI about timeout");
        }, 100);
      }
    } catch (error) {
      console.error("Error sending timeup prompt to AI:", error);
    }
    
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      // Wait a bit and then move to the next question
      setTimeout(() => {
        toast.info("Moving to the next question.");
        moveToNextQuestion();
      }, 30000);
    } else {
      // End the interview if this was the last question
      toast.info("This was the last question. Ending the interview.");
      handleEndCall();
    }
  }, [currentQuestionIndex, interviewQuestions.length, transcript]);

  const moveToNextQuestion = useCallback(() => {
    console.log(`Moving from question ${currentQuestionIndex} to ${currentQuestionIndex + 1}`);
    // Make sure we don't exceed question count
    if (currentQuestionIndex + 1 >= interviewQuestions.length) {
      console.log("Cannot move past last question");
      return;
    }
    
    setCurrentQuestionIndex((prev) => prev + 1);
    setShowCurrentQuestion(true); // Always show the next question
    setTimeRemaining(600);
    setIsTimerActive(true);
    setSolution("");
    setIsSubmitting(false);
    
    // Ensure microphone is unmuted for next question
    if (isMuted) {
      try {
        // Use type casting to safely access optional methods
        const extendedVapi = vapi as unknown as { unmute?: () => void };
        if (typeof extendedVapi.unmute === 'function') {
          extendedVapi.unmute();
          setIsMuted(false);
        }
      } catch (error) {
        console.error("Error unmuting:", error);
      }
    }
    
    // Save the updated state
    localStorage.setItem('interview_state', JSON.stringify({
      currentQuestionIndex: currentQuestionIndex + 1,
      isTimerActive: true,
      timeRemaining: 600,
      isMuted: false,
      transcript: JSON.stringify(transcript)
    }));
  }, [currentQuestionIndex, transcript, isMuted, interviewQuestions.length]);

  const handleSubmitSolution = () => {
    if (!solution.trim()) {
      toast.error("Please provide a solution before submitting");
      return;
    }
    
    try {
      // Get current question details
      const currentQuestion = interviewQuestions[currentQuestionIndex];
      const questionId = currentQuestion.id;
      const questionTopic = currentQuestion.topic || "General";
      
      // Update question attempts tracking
      const questionAttempts = JSON.parse(localStorage.getItem('question_attempts') || '[]');
      const updatedAttempts = questionAttempts.map((attempt: {questionid: string, status: string}) => {
        if (attempt.questionid === questionId) {
          return { ...attempt, status: "attempted" };
        }
        return attempt;
      });
      localStorage.setItem('question_attempts', JSON.stringify(updatedAttempts));
      console.log("Updated question attempts:", updatedAttempts);
      
      // Add a notification message about the submit button being clicked
      const submitButtonMessage: Transcript = {
        role: "system",
        content: "submit button clicked",
        type: "notification",
        metadata: {
          topics: [questionTopic]
        }
      };
      
      // Add the solution to the transcript with metadata for feedback generation
      const solutionMessage: Transcript = {
        role: "user",
        content: `[SOLUTION for Question ${currentQuestionIndex + 1}]:\n${solution}`,
        type: "solution",
        metadata: {
          topics: [questionTopic],
          questionResult: {
            questionId: questionId,
            isCorrect: false,  // Initially set to false, will be evaluated later
            topic: questionTopic
          }
        }
      };
      
      // Send the messages to the transcript
      setTranscript(prev => [...prev, submitButtonMessage, solutionMessage]);
      
      // Force the AI to respond using Vapi's sendTextMessage
      try {
        // First, add the solution message for the AI to process
        vapi.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: solution,
          },
        });
        
        // Then use vapi.say to immediately trigger speech
        // Using the correct vapi.say method according to the documentation
        const extendedVapi = vapi as unknown as { 
          say?: (message: string, endCallAfterSpoken?: boolean) => void 
        };
        
        if (typeof extendedVapi.say === 'function') {
          setTimeout(() => {
            // Force the AI to speak using the say method
            extendedVapi.say?.(`Thank you for your solution. Could you please explain your approach to solving this problem?`);
            console.log("AI prompted to speak immediately");
          }, 100);
        } else {
          // Fallback to send method if say is not available
          setTimeout(() => {
            vapi.send({
              type: 'add-message',
              message: {
                role: 'system',
                content: 'submit button clicked - ask for approach explanation immediately',
              },
            });
            console.log("System message sent to prompt AI response");
          }, 100);
        }
      } catch (error) {
        console.error("Error sending solution to AI:", error);
      }
      
      // Calculate solution score
      const timeSpent = 600 - timeRemaining;
      
      // Score based on multiple factors
      let solutionScore = 0;
      let approachScore = 0;
      
      // Get the expected answer from the question data
      // This will come from the solution field in the database
      const expectedAnswer = currentQuestion.solution || "";
      
      // Normalize strings for better comparison
      const normalizedExpectedAnswer = expectedAnswer.toLowerCase().trim();
      const normalizedSolution = solution.toLowerCase().trim();
      
      // Advanced matching logic
      // 1. Direct string comparison (exact match for short answers)
      let isExactMatch = false;
      let keywordMatchScore = 0;
      
      // For short answers, check for exact match
      if (normalizedExpectedAnswer.length < 50 && normalizedSolution === normalizedExpectedAnswer) {
        isExactMatch = true;
        solutionScore = 100; // Perfect match gets 100%
      } else {
        // 2. Keyword matching (for longer answers)
        // First, remove common stop words and punctuation
        const stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of"];
        
        // Function to clean text and extract meaningful keywords
        const extractKeywords = (text: string) => {
          // Remove punctuation
          const noPunctuation = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
          // Split into words and filter out stop words and empty strings
          return noPunctuation.split(/\s+/)
            .filter(word => word.length > 1 && !stopWords.includes(word))
            .map(word => word.trim());
        };
        
        const expectedKeywords = extractKeywords(normalizedExpectedAnswer);
        const solutionKeywords = extractKeywords(normalizedSolution);
        
        console.log("Expected keywords:", expectedKeywords);
        console.log("Solution keywords:", solutionKeywords);
        
        // 3. Advanced scoring methods
        
        // Count matching keywords (including partial matches)
        const exactMatches = expectedKeywords.filter(keyword => 
          solutionKeywords.includes(keyword)
        );
        
        // Count partial matches (solution word contains expected keyword)
        const partialMatches = expectedKeywords.filter(keyword => 
          !exactMatches.includes(keyword) && // Don't double count exact matches
          solutionKeywords.some(word => word.includes(keyword) || keyword.includes(word))
        );
        
        console.log(`Exact keyword matches: ${exactMatches.length}/${expectedKeywords.length}`);
        console.log(`Partial keyword matches: ${partialMatches.length}/${expectedKeywords.length}`);
        
        // Calculate keyword match score (70% of total score)
        // Exact matches are worth more than partial matches
        if (expectedKeywords.length > 0) {
          keywordMatchScore = Math.round(
            ((exactMatches.length * 1.0) + (partialMatches.length * 0.5)) / 
            expectedKeywords.length * 70
          );
        }
        
        // 4. Check for critical concepts (must-have keywords)
        // Identify critical keywords (e.g., technical terms, specific concepts)
        const criticalKeywords = expectedKeywords
          .filter(word => word.length > 5) // Longer words likely to be important
          .slice(0, Math.max(2, Math.round(expectedKeywords.length * 0.3))); // Top ~30% of keywords
        
        // Check if critical keywords are present
        const criticalMatches = criticalKeywords.filter(keyword => 
          solutionKeywords.some(word => word.includes(keyword) || keyword.includes(word))
        );
        
        console.log("Critical keywords:", criticalKeywords);
        console.log(`Critical matches: ${criticalMatches.length}/${criticalKeywords.length}`);
        
        // Add critical keyword bonus (up to 30% of total score)
        const criticalScore = criticalKeywords.length > 0 
          ? Math.round((criticalMatches.length / criticalKeywords.length) * 30) 
          : 15; // Default middle score if no critical keywords
        
        // Combine scores
        solutionScore = keywordMatchScore + criticalScore;
      }
      
      // Score approach based on time management and completeness
      approachScore = Math.round(
        ((600 - timeSpent) / 600) * 30 + // Time efficiency (up to 30 points)
        (solution.length > 100 ? 40 : solution.length / 2.5) + // Solution completeness (up to 40 points)
        (solutionScore > 50 ? 30 : solutionScore / 2) // Quality bonus (up to 30 points)
      );
      
      // Cap scores at 100
      solutionScore = Math.min(100, Math.max(0, solutionScore));
      approachScore = Math.min(100, Math.max(0, approachScore));
      
      // Determine if solution is correct (using a threshold)
      // For exact matches, it's automatically correct
      // Otherwise, use a score threshold
      const isCorrect = isExactMatch || solutionScore >= 70;
      
      console.log(`Solution score: ${solutionScore}/100 (${isCorrect ? 'Correct' : 'Incorrect'})`);
      console.log(`Approach score: ${approachScore}/100`);
      
      // Also add a system message with question result for backward compatibility
      const resultMessage: Transcript = {
        role: "system",
        content: `Question ${currentQuestionIndex + 1} result: ${isCorrect ? "Correct" : "Incorrect"}. {"question_result": {"question_id": "${questionId}", "is_correct": ${isCorrect}, "topic": "${questionTopic}"}}`,
        type: "result",
        metadata: {
          topics: [questionTopic]
        }
      };
      
      setTranscript(prev => [...prev, resultMessage]);
      
      // Save to localStorage
      const solutions = JSON.parse(localStorage.getItem('interview_solutions') || '{}') as Record<string, SolutionData>;
      solutions[`${questionId}`] = {
        question: currentQuestion.question,
        solution: solution,
        timeSpent,
        solutionScore,
        approachScore,
        expectedAnswer: expectedAnswer,
        questionId: questionId,
        topic: questionTopic,
        isCorrect: isCorrect
      };
      localStorage.setItem('interview_solutions', JSON.stringify(solutions));
      
      setIsSubmitting(true);
      toast.success("Solution submitted successfully!");
      
    } catch (error) {
      console.error("Error saving solution:", error);
      toast.error("Failed to save solution. Please try again.");
    }
  };

  const handleEndCall = () => {
    try {
      toast.info("Ending interview...");
      vapi.stop();
      setCallStatus(CallStatus.FINISHED);
      
      // Exit fullscreen before ending
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error('Error exiting fullscreen:', err);
        });
      }
      
      updateInterview({
        id: interviewId,
        status: "attempted" as InterviewStatus,
      });
      
      // Clear stored questions when interview ends
      sessionStorage.removeItem('interview_questions');
      localStorage.removeItem('interview_transcript');
      localStorage.removeItem('interview_state');
    } catch (error) {
      console.error("Failed to end interview:", error);
      toast.error("Failed to end interview. Please try again.");
    }
  };

  const handleGenerateFeedback = async () => {
    if (transcript.length === 0) return;

    try {
      toast.info("Generating interview feedback...");
      console.log("=== Starting Feedback Generation ===");

      // Exit fullscreen before generating feedback
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch((err) => {
          console.error('Error exiting fullscreen:', err);
        });
      }

      // Get saved solutions and scores
      const solutions = JSON.parse(localStorage.getItem('interview_solutions') || '{}') as Record<string, SolutionData>;
      console.log("Retrieved solutions:", Object.keys(solutions).length);
      
      // Get question attempts tracking
      const questionAttempts = JSON.parse(localStorage.getItem('question_attempts') || '[]');
      console.log("Retrieved question attempts:", questionAttempts);
      
      // Extract topics from questions and collect question IDs
      const questionTopics = extractTopicsFromQuestions();
      console.log("Topics from questions:", questionTopics);
      
      // Collect correct and wrong question IDs
      const correctQuestionIds: string[] = [];
      const wrongQuestionIds: string[] = [];
      
      // New format for correct and wrong answers
      const correctAnswers: Record<string, string> = {};
      const wrongAnswers: Record<string, string> = {};
      
      // Determine unattempted questions from question_attempts tracking
      const unattemptedAnswers: Record<string, string> = {};
      questionAttempts.forEach((attempt: {questionid: string, status: string}) => {
        if (attempt.status === "unattempted") {
          unattemptedAnswers[attempt.questionid] = "not attempted";
        }
      });
      
      Object.entries(solutions).forEach(([, data]: [string, SolutionData]) => {
        if (data.questionId) {
          if (data.isCorrect) {
            correctQuestionIds.push(data.questionId);
            correctAnswers[data.questionId] = data.solution;
          } else {
            wrongQuestionIds.push(data.questionId);
            wrongAnswers[data.questionId] = data.solution;
          }
        }
      });
      
      console.log("Correct question IDs:", correctQuestionIds);
      console.log("Wrong question IDs:", wrongQuestionIds);
      console.log("Correct answers:", correctAnswers);
      console.log("Wrong answers:", wrongAnswers);
      console.log("Unattempted answers:", unattemptedAnswers);
      
      // Format transcript to include solutions with scores
      const formattedTranscript = transcript.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(),
        metadata: {
          ...msg.metadata,
          topics: questionTopics
        }
      }));

      // Add solutions to transcript with detailed scoring
      if (Object.keys(solutions).length > 0) {
        console.log("Adding solution data to transcript");
        Object.entries(solutions).forEach(([questionKey, solutionData]: [string, SolutionData]) => {
          formattedTranscript.push({
            role: 'user',
            content: `
Question ${questionKey}:
${solutionData.question || ''}

Candidate's Solution:
${solutionData.solution || ''}

Performance Metrics:
- Solution Score: ${solutionData.solutionScore || 0}/100
- Approach Score: ${solutionData.approachScore || 0}/100
- Time Spent: ${solutionData.timeSpent || 0} seconds
`,
            timestamp: new Date().toISOString(),
            metadata: {
              topics: questionTopics,
              questionResult: {
                questionId: solutionData.questionId,
                isCorrect: solutionData.isCorrect,
                topic: solutionData.topic
              }
            }
          });
        });
      }

      // Add interview metadata
      formattedTranscript.unshift({
        role: 'system',
        content: `
Interview Type: ${interviewType}
Position: ${position}
Total Questions: ${interviewQuestions.length}
Questions Attempted: ${Object.keys(solutions).length}
Correct Answers: ${correctQuestionIds.length}
Wrong Answers: ${wrongQuestionIds.length}
`,
        timestamp: new Date().toISOString(),
        metadata: {
          topics: questionTopics
        }
      });

      // Prepare feedback data for the server action
      const feedbackData = {
        interviewId,
        userId,
        transcript: formattedTranscript,
        feedbackId: feedbackId || undefined,
        correctAnswers,
        wrongAnswers,
        unattemptedAnswers
      };
      console.log("Sending feedback request with transcript length:", formattedTranscript.length);
      
      const feedbackResult = await createFeedback(feedbackData);
      console.log("Feedback generation result:", feedbackResult);

      if (feedbackResult.success) {
        console.log("Feedback generated successfully with ID:", feedbackResult.feedbackId);
        
        // Clear stored data after successful feedback generation
        localStorage.removeItem('interview_solutions');
        localStorage.removeItem('interview_transcript');
        localStorage.removeItem('interview_state');
        sessionStorage.removeItem('interview_questions');
        
        toast.success("Feedback generated successfully");
        router.push(`/dashboard?feedback=${feedbackResult.feedbackId}`);
      } else {
        console.error("Failed to generate feedback:", feedbackResult.error);
        toast.error(feedbackResult.error || "Failed to generate feedback");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error in handleGenerateFeedback:", error);
      toast.error("Failed to generate feedback");
      router.push("/dashboard");
    }
  };

  const extractTopicsFromQuestions = (): string[] => {
    try {
      // First try to get topics from interviewQuestions prop
      if (interviewQuestions && interviewQuestions.length > 0) {
        const allTopics = new Set<string>();
        
        interviewQuestions.forEach(question => {
          if (question.topic) {
            allTopics.add(question.topic);
          }
        });
        
        if (allTopics.size > 0) {
          return Array.from(allTopics);
        }
      }
      
      // Fall back to sessionStorage if needed
      const questionsStr = sessionStorage.getItem('interview_questions');
      if (questionsStr) {
        const questions = JSON.parse(questionsStr);
        const allTopics = new Set<string>();
        
        if (Array.isArray(questions)) {
          questions.forEach((question: {topic?: string}) => {
            if (question.topic) {
              allTopics.add(question.topic);
            }
          });
        }
        
        return Array.from(allTopics);
      }
    } catch (error) {
      console.error("Error extracting topics from questions:", error);
    }
    
    return [];
  };

  const getInterviewer = useCallback(() => {
    // Use the baseInterviewer for all interview types to ensure consistent behavior
    const interviewer = baseInterviewer;
    
    // Add the user's first name to the metadata
    const customInterviewer = {
      ...interviewer,
      metadata: {
        userName,
        userId,
        interviewId,
        position,
        questions: interviewQuestions.map(q => q.question),
        userFirstName: userName.split(' ')[0] // Extract first name for the AI to use
      }
    };
    
    return customInterviewer;
  }, [userName, userId, interviewId, position, interviewQuestions]);

  const handleStartCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      toast.info("Connecting to interviewer...");

      // Use the getInterviewer function to get a properly configured interviewer
      const customInterviewer = getInterviewer();
      
      // Safely cast the model to any type to avoid TypeScript errors
      customInterviewer.model = {
        provider: "anthropic" as const,
        model: "claude-3-opus-20240229",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Your name is Vedant. You are a professional mathematical interviewer conducting a real-time voice interview. Your role is to assess the candidate's mathematical abilities, problem-solving skills, and fit for our institution.

            The candidate's first name is ${userName.split(' ')[0]}. Always address them by this first name throughout the interview.

            You have exactly two questions for this interview. Present them in order and DO NOT create any additional questions.

            Question 1:
            ${interviewQuestions[0]?.question || "Mathematical problem solving question 1"}
            
            Question 2:
            ${interviewQuestions[1]?.question || "Mathematical problem solving question 2"}

            Interview Structure:
            1. Introduction Phase:
            - Start with a warm welcome using the candidate's first name
            - Explain the interview format
            - Say "Now, let's begin with the first question, ${userName.split(' ')[0]}" to transition

            2. First Question Phase:
            - Present Question 1 exactly as written above
            - When they submit a solution (indicated by "submit button clicked"), immediately ask "Could you explain your approach to solving this problem, ${userName.split(' ')[0]}?"
            - NEVER provide any hints or guidance on how to solve the problem
            - If they say "I don't know" or similar, respond with "That's perfectly fine, ${userName.split(' ')[0]}. Let's move to the next question." - be supportive and encouraging
            - When they finish or time runs out (indicated by "10 minutes has passed"), say exactly: "Let's move to the next question, ${userName.split(' ')[0]}."

            3. Second Question Phase:
            - When transitioning to the second question, say exactly: "Let's move to the second question, ${userName.split(' ')[0]}."
            - Present Question 2 exactly as written above
            - When they submit a solution (indicated by "submit button clicked"), immediately ask "Could you explain your approach to solving this problem, ${userName.split(' ')[0]}?"
            - NEVER provide any hints or guidance on how to solve the problem
            - If they say "I don't know" or similar, respond with "That's perfectly fine, ${userName.split(' ')[0]}. Let's wrap up our interview." - be supportive and encouraging
            - When they finish or time runs out (indicated by "10 minutes has passed"), conclude the interview

            4. Closing Phase:
            - What are your dreams and aspirations?
            - What is your journey and how did you end up here?
            - What are your strengths and weaknesses?
            - Why do you want to join Scaler School of Technology?
            - How will Scaler help you achieve your goals?
            - What are your career goals and how do you see yourself in 5 years?
            - Listen to their response and provide encouraging feedback
            - Thank the candidate by their first name
            - Do NOT provide feedback on their performance
            - End the interview professionally by saying exactly: "Goodbye and thank you for participating in this interview, ${userName.split(' ')[0]}."

            Time Management:
            - When you receive the message "10 minutes has passed", immediately say "We've reached the 10-minute mark for this question, ${userName.split(' ')[0]}. Are you ready with an approach to solving this problem?"
            - If they can't provide an approach or say they don't know, respond supportively with "That's perfectly fine, ${userName.split(' ')[0]}. Let's move to the next question."
            - Only move to the next question after the user provides an approach OR states they cannot solve it

            CRITICAL RULES:
            - NEVER provide any solutions, approaches, or hints at any point
            - ALWAYS ask for approach explanation after solution submission
            - ONLY address the candidate by their first name
            - Maintain a strictly professional assessment environment
            - This is a formal mathematical assessment
            - Be supportive when candidates don't know answers
            - When transitioning to the next question, ALWAYS use the EXACT phrase "Let's move to the next question" or "Let's move to the second question"`
          }
        ]
      };

      await vapi.start(customInterviewer, {
        metadata: {
          userName,
          userId,
          interviewId,
          position
        },
        silenceTimeoutSeconds: 900,  // 15 minutes silence timeout
        voice: {
          provider: "11labs",
          voiceId: "3gsg3cxXyFLcGIfNbM6C",
          stability: 0.4,
          similarityBoost: 0.8,
          speed: 0.9,
          style: 0.5,
          useSpeakerBoost: true
        }
      });
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error("Failed to start interview. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const toggleMute = () => {
    try {
      const extendedVapi = vapi as unknown as { mute?: () => void, unmute?: () => void };
      
      if (isMuted) {
        // Check if unmute exists on vapi object
        if (typeof extendedVapi.unmute === 'function') {
          extendedVapi.unmute();
        } else {
          console.log('Unmute not available, using alternative method');
          // Maybe use a different approach or fallback
        }
        setIsMuted(false);
        toast.info("Microphone unmuted");
      } else {
        // Check if mute exists on vapi object
        if (typeof extendedVapi.mute === 'function') {
          extendedVapi.mute();
        } else {
          console.log('Mute not available, using alternative method');
          // Maybe use a different approach or fallback
        }
        setIsMuted(true);
        toast.info("Microphone muted");
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentContent = () => {
    if (currentQuestionIndex === -1) {
      return (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Interview Introduction</h2>
            <p className="text-gray-300">
              Welcome to your technical interview. The AI interviewer will guide you through the questions.
            </p>
          </div>
        </div>
      );
    } else if (currentQuestionIndex < interviewQuestions.length && showCurrentQuestion) {
      const currentQuestion = interviewQuestions[currentQuestionIndex];
      return (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              Question {currentQuestionIndex + 1} of {interviewQuestions.length}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">{currentQuestion.question}</p>
            </div>

            {isTimerActive && (
              <div className="mt-4 text-center">
                <p className={`text-xl font-bold ${timeRemaining < 60 ? 'text-red-500' : 'text-yellow-500'}`}>
                  Time Remaining: {formatTime(timeRemaining)}
                </p>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Type your solution here..."
                className="w-full h-40 bg-gray-800 text-gray-200 p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              
              {!isSubmitting && (
                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmitSolution}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!solution.trim()}
                  >
                    Submit Solution
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (currentQuestionIndex >= interviewQuestions.length) {
      return (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Interview Complete</h2>
            <p className="text-gray-400">
              Great job on completing all the questions! Your solutions demonstrate your problem-solving abilities.
              We&apos;ll analyze your responses and provide detailed feedback shortly.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-center">
            <p className="text-gray-400">
              Listen to the interviewer&apos;s instructions...
            </p>
          </div>
        </div>
      );
    }
  };

  // Store conversation history in localStorage
  useEffect(() => {
    if (transcript.length > 0) {
      localStorage.setItem('interview_transcript', JSON.stringify(transcript));
      
      // Add debugging for the latest transcript message
      const latestMessage = transcript[transcript.length - 1];
      if (latestMessage.role === 'assistant') {
        console.log('DEBUG - Latest AI message:', {
          content: latestMessage.content,
          contentLower: latestMessage.content.toLowerCase(),
          includesTransition: [
            "move onto the next question",
            "move onto the second question",
            "move to the next question",
            "go to the second question",
            "let's move onto the second question"
          ].some(phrase => latestMessage.content.toLowerCase().includes(phrase))
        });
      }
    }
  }, [transcript]);

  // Load saved state on mount
  useEffect(() => {
    const savedStateString = localStorage.getItem('interview_state');
    if (savedStateString) {
      try {
        console.log("Loading saved state from localStorage");
        const state = JSON.parse(savedStateString);
        console.log("Saved state:", state);
        
        // Restore state carefully
        setCurrentQuestionIndex(state.currentQuestionIndex ?? -1);
        setIsMuted(state.isMuted ?? false);
        
        // Restore transcript
        if (state.transcript) {
          const savedTranscript = JSON.parse(state.transcript);
          if (Array.isArray(savedTranscript)) {
            setTranscript(savedTranscript);
          }
        } else {
          // Also try loading from the old key if state.transcript doesn't exist
          const oldSavedTranscript = localStorage.getItem('interview_transcript');
          if (oldSavedTranscript) {
            setTranscript(JSON.parse(oldSavedTranscript));
          }
        }
        
        console.log("State loaded successfully");

      } catch (error) {
        console.error("Error loading saved state:", error);
        localStorage.removeItem('interview_state'); // Clear corrupted state
      }
    }
  }, []);

  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started");
      setCallStatus(CallStatus.ACTIVE);
      updateInterview({
        id: interviewId,
        status: "in-progress" as InterviewStatus,
      });
      setCurrentQuestionIndex(-1);
      setShowCurrentQuestion(false);
      setIsMuted(false);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
      updateInterview({
        id: interviewId,
        status: "attempted" as InterviewStatus,
      });
      // Clear stored questions when interview ends
      sessionStorage.removeItem('interview_questions');
      localStorage.removeItem('interview_transcript');
      localStorage.removeItem('interview_state');
    };

    const onMessage = (message: {
      role: string;
      content?: string;
      transcript?: string;
    }) => {
      console.log("Message received:", message);
      if (message.role === "assistant" || message.role === "user") {
        const content = message.content || message.transcript || "";
        if (content.trim()) {
          const newMessage = {
            role: message.role as "assistant" | "user",
            content,
          };
          setTranscript((prev) => [...prev, newMessage]);

          // Only process assistant messages for transitions
          if (message.role === "assistant") {
            // Log raw message for debugging
            console.log("AI SPEECH:", content);
            
            // Force cleanup of the content for consistent matching
            const normalizedContent = content
              .toLowerCase()
              .replace(/[^\w\s]/g, '') // Remove punctuation
              .replace(/\s+/g, ' ')    // Normalize whitespace
              .trim();                 // Remove leading/trailing spaces
            
            console.log("Normalized content:", normalizedContent);
            
            // Simple check for first question
            if (normalizedContent.includes("first question") && currentQuestionIndex === -1) {
              console.log("⭐ First question detected, showing question 1");
              setCurrentQuestionIndex(0);
              setShowCurrentQuestion(true);
              setIsTimerActive(true);
              return;
            }
            
            // If we're on first question, check for second question transition
            if (currentQuestionIndex === 0) {
              const nextQuestionIndicators = [
                "move onto the next question",
                "move to the next question", 
                "move onto the second question",
                "move to the second question",
                "lets move onto the next question",
                "lets move to the next question",
                "lets move onto the second question",
                "lets move to the second question",
              ];
              
              // Check each transition phrase with direct contains
              for (const phrase of nextQuestionIndicators) {
                if (normalizedContent.includes(phrase)) {
                  console.log(`⭐ TRANSITION DETECTED: "${phrase}" found in AI message`);
                  console.log("Moving to second question");
                  
                  // Move to next question with a slight delay to ensure state updates properly
                  setTimeout(() => {
                    moveToNextQuestion();
                    setShowCurrentQuestion(true);
                    setIsTimerActive(true);
                  }, 100);
                  return;
                }
              }
            }
            
            // Check for interview conclusion if on last question
            if (currentQuestionIndex >= interviewQuestions.length - 1) {
              const conclusionIndicators = [
                "goodbye",
                "thank you for completing",
                "this concludes our interview",
                "thank you for participating"
              ];
              
              for (const phrase of conclusionIndicators) {
                if (normalizedContent.includes(phrase)) {
                  console.log("⭐ Interview conclusion detected");
                  // End call with a slight delay
                  setTimeout(() => {
                    handleEndCall();
                  }, 2000);
                  return;
                }
              }
            }
          } 
          // For user messages, check for "I don't know" to notify AI
          else if (message.role === "user") {
            const lowerContent = content.toLowerCase();
            const dontKnowIndicators = [
              "i don't know",
              "i do not know",
              "don't understand",
              "no idea",
              "not familiar with",
              "no approach",
              "cannot solve",
              "can't solve",
              "unable to solve"
            ];
            
            // Check if user indicated they don't know
            const userDoesntKnow = dontKnowIndicators.some(phrase => 
              lowerContent.includes(phrase)
            );
            
            if (userDoesntKnow) {
              console.log("User indicated they don't know the answer");
              
              // Add a system message to notify the AI
              const dontKnowMessage: Transcript = {
                role: "system",
                content: "user indicated they don't know the answer - move to next question",
                type: "notification"
              };
              
              setTranscript(prev => [...prev, dontKnowMessage]);
              
              // Check if timer has already expired (timeRemaining is 0)
              // If so, we should move to the next question
              if (timeRemaining === 0 && currentQuestionIndex < interviewQuestions.length - 1) {
                console.log("Timer already expired and user doesn't know - moving to next question");
                
                // Force AI to acknowledge and move on
                try {
                  const extendedVapi = vapi as unknown as { 
                    say?: (message: string, endCallAfterSpoken?: boolean) => void 
                  };
                  
                  if (typeof extendedVapi.say === 'function') {
                    setTimeout(() => {
                      // Force the AI to speak using the say method
                      extendedVapi.say?.(`That's perfectly fine. Let's move to the next question.`);
                      console.log("AI prompted to move to next question after user indicated no approach");
                      
                      // Move to next question with a slight delay
                      setTimeout(() => {
                        moveToNextQuestion();
                      }, 2000);
                    }, 100);
                  } else {
                    // Fallback to system message
                    vapi.send({
                      type: 'add-message',
                      message: {
                        role: 'system',
                        content: 'user has no approach - acknowledge and move to next question immediately',
                      },
                    });
                    
                    // Move to next question with a slight delay
                    setTimeout(() => {
                      moveToNextQuestion();
                    }, 2000);
                  }
                } catch (error) {
                  console.error("Error handling user's don't know response:", error);
                  // Still try to move to next question
                  setTimeout(() => {
                    moveToNextQuestion();
                  }, 2000);
                }
              }
            }
          }
        }
      }
    };

    const onSpeechStart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("VAPI error:", error);
      toast.error(`Error: ${error.message || "Unknown error occurred"}`);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [interviewId, currentQuestionIndex, moveToNextQuestion]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && transcript.length > 0) {
      handleGenerateFeedback();
    }
  }, [callStatus, transcript.length, feedbackId, interviewId, userId]);

  useEffect(() => {
    if (!vapi) {
      console.error("VAPI SDK not initialized");
      return;
    }

    const onError = (error: Error) => {
      const errorMessage = error instanceof Error ? error.message :
        typeof error === 'string' ? error :
        error && typeof error === 'object' ? JSON.stringify(error) :
        'Unknown error';

      console.error("VAPI error:", {
        message: errorMessage,
        originalError: error
      });
      
      setIsLoading(false);
      toast.error(`Interview Error: ${errorMessage}`);
    };

    const onDisconnect = () => {
      console.log("VAPI disconnected");
      setIsLoading(false);
    };

    const onConnect = () => {
      console.log("VAPI connected");
      setIsLoading(false);
      setCallStatus(CallStatus.ACTIVE);
      setIsTimerActive(true);
      setCurrentQuestionIndex(0);
      setShowCurrentQuestion(true);
    };

    // Add event listeners
    vapi.on("error", onError);
    vapi.on("call-end", onDisconnect);
    vapi.on("call-start", onConnect);

    // Cleanup
    return () => {
      vapi.off("error", onError);
      vapi.off("call-end", onDisconnect);
      vapi.off("call-start", onConnect);
    };
  }, [vapi]);

  const handleStartInterview = () => {
    setShowInstructions(false);
    // Add your existing interview start logic here
  };

  if (showInstructions) {
    return <InterviewInstructions onNext={handleStartInterview} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white p-6">
      <div className="flex-1 flex gap-6">
        {/* Left side - Question and Answer Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Question Display */}
          <div className="flex-1">
            {getCurrentContent()}
          </div>

          {/* Latest Transcript (Subtitle Style) */}
          <div className="bg-black/50 p-4 rounded-lg text-center min-h-[60px]">
            {transcript.length > 0 ? (
              <p className="text-lg text-white">
                {transcript[transcript.length - 1].content}
              </p>
            ) : (
              <p className="text-lg text-gray-400">
                Waiting for interview to start...
              </p>
            )}
            
            {/* Status prompts */}
            {callStatus === CallStatus.ACTIVE && (
              <div className="mt-2">
                {isSpeaking ? (
                  <p className="text-sm text-indigo-400">AI is speaking...</p>
                ) : showCurrentQuestion ? (
                  <p className="text-sm text-green-400">Click submit button to answer the question</p>
                ) : (
                  <p className="text-sm text-yellow-400">Speak now...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Profiles */}
        <div className="w-80 space-y-6">
          <div className="bg-indigo-950 rounded-lg p-4 border border-indigo-800/30">
            <ParticipantProfile
              role="interviewer"
              name="AI Interviewer"
              type={interviewType}
              isSpeaking={isSpeaking}
              transcript={transcript}
              avatarLetter="AI"
              bgColorClass="bg-indigo-600"
              status="active"
            />
          </div>

          <div className="bg-purple-950 rounded-lg p-4 border border-purple-800/30">
            <ParticipantProfile
              role="candidate"
              name={userName}
              transcript={transcript}
              avatarLetter={userName[0]?.toUpperCase() || "U"}
              bgColorClass="bg-purple-600"
              status="active"
            />
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="mt-6">
        <InterviewControls
          callStatus={callStatus}
          isMuted={isMuted}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          onToggleMute={toggleMute}
          isSpeaking={isSpeaking}
        />
      </div>
    </div>
  );
}; 