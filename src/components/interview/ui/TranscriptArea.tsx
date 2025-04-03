import { Transcript } from "../types";

interface TranscriptAreaProps {
  transcript: Transcript[];
  className?: string;
}

export const TranscriptArea = ({ transcript, className = "" }: TranscriptAreaProps) => {
  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Interview Transcript</h3>
      <div className="h-[calc(100vh-300px)] overflow-y-auto space-y-3 pr-2">
        {transcript.length > 0 ? (
          transcript.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                message.role === "assistant"
                  ? "bg-indigo-900/30 border border-indigo-800/30 text-gray-200"
                  : "bg-purple-900/30 border border-purple-800/30 text-gray-200 ml-4"
              }`}
            >
              <p className="text-xs text-gray-400 mb-1">
                {message.role === "assistant" ? "Interviewer" : "You"}
              </p>
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Start the interview to begin the conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 