import { Button } from "@/components/ui/button";
import { CallStatus } from "../types";

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
    <div className="flex justify-center gap-4">
      {callStatus === CallStatus.INACTIVE && (
        <Button
          onClick={onStartCall}
          className="bg-green-600 hover:bg-green-700"
        >
          Start Interview
        </Button>
      )}

      {callStatus === CallStatus.ACTIVE && (
        <>
          <Button
            onClick={onToggleMute}
            className={`${
              isMuted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          <Button
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700"
          >
            End Interview
          </Button>
        </>
      )}
    </div>
  );
}; 