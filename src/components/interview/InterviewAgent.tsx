"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mic, MicOff } from "lucide-react";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback, updateInterview } from "@/lib/actions/interview.action";
import { Button } from "@/components/ui/button";
import { Transcript } from "@/lib/types";
import { nsetInterviewer, techInterviewer, behavioralInterviewer } from "@/lib/vapi-config";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

// Define interview status types locally to avoid import issues
type InterviewStatus = 'scheduled' | 'active' | 'in-progress' | 'attempted' | 'completed' | 'cancelled';

interface InterviewAgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  interviewType: "technical" | "system-design" | "behavioral";
  feedbackId?: string;
  position?: string;
}

// StartEndButton Component
const StartEndButton = ({ callStatus, handleStartCall, handleEndCall }: {
  callStatus: CallStatus;
  handleStartCall: () => void;
  handleEndCall: () => void;
}) => {
  return (
    <Button
      onClick={callStatus === CallStatus.ACTIVE ? handleEndCall : handleStartCall}
      className={`px-4 py-2 ${callStatus === CallStatus.ACTIVE ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium rounded-md`}
    >
      {callStatus === CallStatus.CONNECTING ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <span>{callStatus === CallStatus.ACTIVE ? 'End Interview' : 'Start Interview'}</span>
      )}
    </Button>
  );
};

// InterviewStatus Component
const InterviewStatus = ({ callStatus }: { callStatus: CallStatus }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${
        callStatus === CallStatus.INACTIVE ? 'bg-gray-500' :
        callStatus === CallStatus.CONNECTING ? 'bg-yellow-500' :
        callStatus === CallStatus.ACTIVE ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-sm font-medium text-gray-600 capitalize">
        {callStatus.toLowerCase().replace('-', ' ')}
      </span>
    </div>
  );
};

// Transcription Component
const Transcription = ({ transcript }: { transcript: Transcript[] }) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-2">Interview Transcript</h3>
      <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
        {transcript.length > 0 ? (
          transcript.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                message.role === 'assistant'
                  ? 'bg-indigo-900/30 border border-indigo-800/30 text-gray-200'
                  : 'bg-purple-900/30 border border-purple-800/30 text-gray-200 ml-2'
              }`}
            >
              <p className="text-xs text-gray-400 mb-1">
                {message.role === 'assistant' ? 'Interviewer' : 'You'}
              </p>
              <p className="text-sm">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-2">
            <p className="text-gray-500 text-sm">Start the interview to begin the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InterviewAgent = ({
  userName,
  userId,
  interviewId,
  interviewType,
  feedbackId,
  position = "Software Engineer"
}: InterviewAgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started");
      setCallStatus(CallStatus.ACTIVE);
      updateInterview({
        id: interviewId,
        status: 'in-progress' as InterviewStatus
      });
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
      updateInterview({
        id: interviewId,
        status: 'attempted' as InterviewStatus
      });
    };

    const onMessage = (message: { role: string; content?: string; transcript?: string }) => {
      console.log("Message received:", message);
      if (message.role === "assistant" || message.role === "user") {
        const content = message.content || message.transcript || "";
        if (content.trim()) {
          const newMessage = { 
            role: message.role as "assistant" | "user", 
            content 
          };
          setTranscript((prev) => [...prev, newMessage]);
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
  }, [interviewId]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && transcript.length > 0) {
      handleGenerateFeedback();
    }
  }, [callStatus, transcript.length, feedbackId, interviewId, userId]);

  const handleGenerateFeedback = async () => {
    if (transcript.length === 0) return;
    
    try {
      toast.info("Generating interview feedback...");
      console.log("Starting feedback generation with transcript data:", 
        JSON.stringify(transcript.slice(0, 3)) + "... (first 3 items)");
      
      // Format transcript to include any additional metadata that might help with analysis
      const formattedTranscript = transcript.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(), // Adding timestamp for chronological analysis
        metadata: {
          // Extract topics from questions if available in sessionStorage
          topics: extractTopicsFromQuestions()
        }
      }));
      
      // Add interview context
      formattedTranscript.unshift({
        role: 'system',
        content: `Interview Type: ${interviewType}, Position: ${position || "Software Engineer"}`,
        metadata: {
          topics: extractTopicsFromQuestions()
        }
      });
      
      const result = await createFeedback({
        interviewId,
        userId,
        transcript: formattedTranscript,
        feedbackId
      });
      
      if (result.success) {
        toast.success("Feedback generated successfully");
        router.push(`/dashboard?feedback=${result.feedbackId}`);
      } else {
        console.error("Failed to generate feedback:", result.error);
        toast.error(result.error || "Failed to generate feedback");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback");
      router.push("/dashboard");
    }
  };

  // Helper function to extract topics from questions in sessionStorage
  const extractTopicsFromQuestions = (): string[] => {
    try {
      const questionsStr = sessionStorage.getItem('interview_questions');
      if (questionsStr) {
        const questions = JSON.parse(questionsStr);
        // Collect all unique topics from questions
        const allTopics = new Set<string>();
        if (Array.isArray(questions)) {
          questions.forEach(question => {
            if (question.topics && Array.isArray(question.topics)) {
              question.topics.forEach((topic: string) => allTopics.add(topic));
            } else if (typeof question.topics === 'string') {
              // Handle case where topics might be a comma-separated string
              question.topics.split(',')
                .map((t: string) => t.trim())
                .filter((t: string) => t)
                .forEach((topic: string) => allTopics.add(topic));
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

  const getInterviewer = () => {
    switch (interviewType) {
      case "technical":
        return techInterviewer;
      case "system-design":
        return techInterviewer;
      case "behavioral":
        return behavioralInterviewer;
      default:
        return nsetInterviewer;
    }
  };

  const handleStartCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      toast.info("Connecting to interviewer...");
      
      const interviewer = getInterviewer();
      
      await vapi.start(interviewer, {
        metadata: {
          userName,
          userId,
          interviewId,
          position
        }
      });
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error("Failed to start interview. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleEndCall = () => {
    try {
      toast.info("Ending interview...");
      vapi.stop();
      setCallStatus(CallStatus.FINISHED);
    } catch (error) {
      console.error("Failed to end interview:", error);
      toast.error("Failed to end interview. Please try again.");
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      vapi.unmute?.();
      setIsMuted(false);
      toast.info("Microphone unmuted");
    } else {
      vapi.mute?.();
      setIsMuted(true);
      toast.info("Microphone muted");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-950 rounded-lg p-4 border border-indigo-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                AI
              </div>
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">AI Interviewer</p>
              <p className="text-indigo-300 text-xs">
                {interviewType === "technical" ? "Technical Interview" : 
                 interviewType === "system-design" ? "System Design Interview" : 
                 interviewType === "behavioral" ? "Behavioral Interview" : 
                 "NSET Admission Interview"}
              </p>
            </div>
          </div>
          <div className="bg-indigo-900/50 rounded border border-indigo-800/30 p-2 text-indigo-100 text-sm h-16 overflow-y-auto">
            {transcript.length > 0 && transcript[transcript.length - 1].role === 'assistant' ? (
              <p>{transcript[transcript.length - 1].content}</p>
            ) : (
              <p className="text-indigo-300 italic text-sm">The interviewer will appear here...</p>
            )}
          </div>
        </div>

        <div className="bg-purple-950 rounded-lg p-4 border border-purple-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {userName[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-white font-medium">{userName}</p>
              <p className="text-purple-300 text-xs">{position}</p>
            </div>
          </div>
          <div className="bg-purple-900/50 rounded border border-purple-800/30 p-2 text-purple-100 text-sm h-16 overflow-y-auto">
            {transcript.length > 0 && transcript[transcript.length - 1].role === 'user' ? (
              <p>{transcript[transcript.length - 1].content}</p>
            ) : (
              <p className="text-purple-300 italic text-sm">Your responses will appear here...</p>
            )}
          </div>
        </div>
      </div>

      <Transcription transcript={transcript} />

      <div className="flex justify-center gap-3">
        {callStatus === CallStatus.ACTIVE && (
          <Button
            onClick={toggleMute}
            variant="outline"
            className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 rounded-full h-10 w-10 p-0 flex items-center justify-center"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}

        <StartEndButton
          callStatus={callStatus}
          handleStartCall={handleStartCall}
          handleEndCall={handleEndCall}
        />
      </div>

      <InterviewStatus callStatus={callStatus} />
    </div>
  );
};

export default InterviewAgent;