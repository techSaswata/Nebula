interface ParticipantProfileProps {
  name: string;
  role: string;
  isActive?: boolean;
  isSpeaking?: boolean;
  avatarLetter?: string;
  className?: string;
  bgColorClass?: string;
  type?: string;
  transcript?: any[];
  status?: "active" | "waiting" | "inactive";
}

export const ParticipantProfile = ({
  name,
  role,
  isActive = false,
  isSpeaking = false,
  avatarLetter,
  className = "",
  bgColorClass = "bg-purple-600",
  status = "active",
}: ParticipantProfileProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-full ${bgColorClass} flex items-center justify-center text-white text-xl font-bold`}
          >
            {avatarLetter || name[0]?.toUpperCase() || "U"}
          </div>
          {isSpeaking && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse" />
          )}
          {status === "active" && !isSpeaking && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" />
          )}
          {status === "waiting" && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{name}</p>
            {status === "waiting" && (
              <span className="text-xs text-yellow-400">(Waiting)</span>
            )}
          </div>
          <p className="text-gray-300 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}; 