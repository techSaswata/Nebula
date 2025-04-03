import Vapi from "@vapi-ai/web";

const VAPI_WEB_TOKEN = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!VAPI_WEB_TOKEN) {
  console.error("VAPI Web Token is missing. Please check your .env.local file and ensure NEXT_PUBLIC_VAPI_WEB_TOKEN is set.");
  throw new Error("VAPI Web Token is not configured");
}

// Initialize VAPI with token and configuration
export const vapi = new Vapi(VAPI_WEB_TOKEN, undefined, {
  avoidEval: false,
  alwaysIncludeMicInPermissionPrompt: true
});

// Add basic error handler
vapi.on("error", (error) => {
  const errorMessage = error instanceof Error ? error.message : 
    typeof error === 'string' ? error :
    error && typeof error === 'object' ? JSON.stringify(error) :
    'Unknown error';
  
  console.error("VAPI SDK Error:", {
    message: errorMessage,
    originalError: error
  });
});

// Add connection status handlers
vapi.on("call-start", () => {
  console.log("VAPI call started successfully");
});

vapi.on("call-end", () => {
  console.log("VAPI call ended");
});

export default vapi; 