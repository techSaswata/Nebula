import { Button } from "@/components/ui/button";
import { CallStatus } from "../types";
import { Mic, MicOff, PhoneOff, Phone } from "lucide-react";

interface InterviewControlsProps {
  callStatus: CallStatus;
  isMuted: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  isSpeaking: boolean;
}

export const InterviewControls = ({
  callStatus,
  isMuted,
  onStartCall,
  onEndCall,
  onToggleMute,
  isSpeaking,
}: InterviewControlsProps) => {
  return (
    <div className="flex justify-center items-center gap-6">
      {callStatus === CallStatus.INACTIVE && (
        <Button
          onClick={onStartCall}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-6 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-500/20"
        >
          <Phone className="w-5 h-5" />
          <span>Start Interview</span>
        </Button>
      )}

      {callStatus === CallStatus.ACTIVE && (
        <>
          <Button
            onClick={onToggleMute}
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg border
              ${isMuted 
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20 border-red-500/20" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 border-blue-500/20"
              }
            `}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </Button>

          <Button
            onClick={onEndCall}
            className="w-14 h-14 rounded-xl bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-500/20 border border-red-500/20"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>
        </>
      )}
    </div>
  );
}; 