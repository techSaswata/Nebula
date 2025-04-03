'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

enum SetupStep {
  INSTRUCTIONS = 0,
  CAMERA = 1,
  MICROPHONE = 2,
  SCREEN_SHARE = 3,
  FULL_SCREEN = 4
}

interface SetupStepItem {
  id: SetupStep;
  label: string;
  completed: boolean;
}

interface InterviewSetupProps {
  interviewId: string;
}

export function InterviewSetup({ interviewId }: InterviewSetupProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>(SetupStep.INSTRUCTIONS);
  const [steps, setSteps] = useState<SetupStepItem[]>([
    { id: SetupStep.INSTRUCTIONS, label: 'Interview Instructions', completed: false },
    { id: SetupStep.CAMERA, label: 'Set Camera', completed: false },
    { id: SetupStep.MICROPHONE, label: 'Set Input Device', completed: false },
    { id: SetupStep.SCREEN_SHARE, label: 'Screen Share Permission', completed: false },
    { id: SetupStep.FULL_SCREEN, label: 'Full Screen Mode', completed: false }
  ]);
  
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [spokenText, setSpokenText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const testPhrase = "my microphone is working correctly";

  useEffect(() => {
    // Enumerate devices when component mounts
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        setVideoDevices(devices.filter(device => device.kind === 'videoinput'));
        setAudioDevices(devices.filter(device => device.kind === 'audioinput'));
      })
      .catch(err => console.error('Error enumerating devices:', err));

    // Cleanup function to stop all streams
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async (deviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setStream(newStream);
      setSelectedCamera(deviceId || '');
      // Store the selected camera ID in localStorage
      localStorage.setItem('selectedCameraId', deviceId || '');
      setSteps(prevSteps =>
        prevSteps.map(s =>
          s.id === SetupStep.CAMERA ? { ...s, completed: true } : s
        )
      );
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const startMicrophone = async (deviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      });

      setStream(newStream);
      setSelectedMicrophone(deviceId || '');

      // Start speech recognition
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setSpokenText(text);
        if (text.includes(testPhrase)) {
          setSteps(prevSteps =>
            prevSteps.map(s =>
              s.id === SetupStep.MICROPHONE ? { ...s, completed: true } : s
            )
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setIsListening(true);
      recognition.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const requestScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      // Check if the selected source type is 'screen'
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack.getSettings().displaySurface !== 'monitor') {
        alert('Please share your entire screen, not just a tab or window.');
        screenStream.getTracks().forEach(track => track.stop());
        return;
      }
      
      screenStream.getTracks().forEach(track => track.stop()); // Stop immediately after permission
      setSteps(prevSteps =>
        prevSteps.map(s =>
          s.id === SetupStep.SCREEN_SHARE ? { ...s, completed: true } : s
        )
      );
    } catch (err) {
      console.error('Error requesting screen share:', err);
    }
  };

  const enterFullScreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setSteps(prevSteps =>
        prevSteps.map(s =>
          s.id === SetupStep.FULL_SCREEN ? { ...s, completed: true } : s
        )
      );
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  };

  const markStepComplete = (step: SetupStep) => {
    setSteps(prevSteps =>
      prevSteps.map(s =>
        s.id === step ? { ...s, completed: true } : s
      )
    );
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteps(prevSteps =>
      prevSteps.map(s =>
        s.id === SetupStep.INSTRUCTIONS ? { ...s, completed: e.target.checked } : s
      )
    );
  };

  const goToNextStep = () => {
    if (currentStep < SetupStep.FULL_SCREEN) {
      setCurrentStep(currentStep + 1);
    }
  };

  const startInterview = () => {
    router.push(`/interview/${interviewId}/start`);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case SetupStep.INSTRUCTIONS:
        return (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800 h-[calc(100vh-8rem)] w-full">
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-medium mb-4">Interview Instructions</h2>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <section>
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Time and Proctored Environment</h3>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm">This is a TIMED and PROCTORED mock interview.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm">Please keep track of the time remaining at the top of the page.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm">The interview will automatically end when time runs out.</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Video and Full Screen Requirements</h3>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm"><strong>Video must remain ON</strong> throughout the interview.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm">You will automatically enter <strong>full-screen mode</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm">Exiting full-screen mode without re-entering within <strong>10 seconds</strong> will result in disqualification.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 text-sm">•</span>
                      <span className="text-sm">Ensure your face is clearly visible in the camera frame.</span>
                    </li>
                  </ul>
                </section>

                <section className="col-span-2">
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Prohibited Actions</h3>
                  <div className="bg-neutral-800/30 backdrop-blur-sm rounded-lg p-4 border border-neutral-700/50">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                          <span className="text-red-400 text-sm">1</span>
                        </div>
                        <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Switching Tabs</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                          <span className="text-red-400 text-sm">2</span>
                        </div>
                        <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Closing Session</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                          <span className="text-red-400 text-sm">3</span>
                        </div>
                        <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Opening Inspector</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                          <span className="text-red-400 text-sm">4</span>
                        </div>
                        <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Right Click</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                          <span className="text-red-400 text-sm">5</span>
                        </div>
                        <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Text Selection</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                          <span className="text-red-400 text-sm">6</span>
                        </div>
                        <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Exit Full-Screen</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="col-span-2">
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Disqualification Policy</h3>
                  <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-3 border border-red-500/20">
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">Exiting the session tab or browser during the interview will result in <strong>immediate disqualification</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">Any violation of the prohibited actions will also lead to disqualification.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">Multiple violations will result in permanent disqualification from future interviews.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="col-span-2">
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Technical Requirements</h3>
                  <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-3 border border-neutral-700">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm">•</span>
                        <span className="text-sm">Stable internet connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm">•</span>
                        <span className="text-sm">Working camera and microphone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm">•</span>
                        <span className="text-sm">Modern web browser</span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="col-span-2 pt-2">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className="mt-1 rounded bg-neutral-800 border-neutral-700" 
                        onChange={handleCheckboxChange}
                      />
                      <span className="text-xs text-gray-300">I have read the instructions and agree to follow them. I understand that not following them may result in disqualification.</span>
                    </label>
                    <div className="relative group">
                      <button
                        onClick={goToNextStep}
                        disabled={!steps.find(s => s.id === SetupStep.INSTRUCTIONS)?.completed}
                        className={`${
                          steps.find(s => s.id === SetupStep.INSTRUCTIONS)?.completed
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 cursor-pointer'
                            : 'bg-neutral-800 text-gray-400 cursor-not-allowed'
                        } text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/20`}
                      >
                        Next
                      </button>
                      {!steps.find(s => s.id === SetupStep.INSTRUCTIONS)?.completed && (
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
                          <div className="bg-neutral-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-neutral-700 whitespace-nowrap">
                            Please agree with the instructions
                          </div>
                          <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case SetupStep.CAMERA:
        return (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-neutral-800">
            <h2 className="text-xl font-medium mb-6">Do you see yourself?</h2>
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <select
              value={selectedCamera}
              onChange={(e) => startCamera(e.target.value)}
              className="w-full p-2 mb-4 bg-neutral-800 rounded border border-neutral-700"
            >
              <option value="">Select Camera</option>
              {videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => startCamera()}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Start Camera
              </button>
              {steps.find(s => s.id === SetupStep.CAMERA)?.completed && (
                <button
                  onClick={goToNextStep}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        );

      case SetupStep.MICROPHONE:
        return (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-neutral-800">
            <h2 className="text-xl font-medium mb-6">Microphone Check</h2>
            <select
              value={selectedMicrophone}
              onChange={(e) => startMicrophone(e.target.value)}
              className="w-full p-2 mb-4 bg-neutral-800 rounded border border-neutral-700"
            >
              <option value="">Select Microphone</option>
              {audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId}`}
                </option>
              ))}
            </select>
            <div className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-lg mb-4 border border-neutral-700">
              <p className="text-sm text-gray-300">Please unmute mic and speak this aloud:</p>
              <p className="font-medium mt-2 text-sm">"{testPhrase}"</p>
            </div>
            {spokenText && (
              <div className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-lg mb-4 border border-neutral-700">
                <p className="text-sm text-gray-300">You said:</p>
                <p className="font-medium mt-2 text-sm">"{spokenText}"</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => startMicrophone()}
                className={`${
                  isListening 
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                } text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/20`}
              >
                {isListening ? 'Listening...' : 'Start Speaking'}
              </button>
              {spokenText && spokenText.includes(testPhrase) && (
                <button
                  onClick={goToNextStep}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        );

      case SetupStep.SCREEN_SHARE:
        return (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-neutral-800">
            <h2 className="text-xl font-medium mb-4">Screen Share Permission</h2>
            <div className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-lg mb-6 border border-neutral-700">
              <p className="text-sm text-gray-300 mb-2">Important Instructions:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 text-sm">•</span>
                  <span className="text-sm">Please share your entire screen, not just a tab or window.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 text-sm">•</span>
                  <span className="text-sm">Select "Screen" or "Entire Screen" option when prompted.</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={requestScreenShare}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Share Screen
              </button>
              {steps.find(s => s.id === SetupStep.SCREEN_SHARE)?.completed && (
                <button
                  onClick={goToNextStep}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        );

      case SetupStep.FULL_SCREEN:
        return (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-neutral-800">
            <h2 className="text-xl font-medium mb-6">Enter Full Screen Mode</h2>
            <div className="flex gap-3">
              <button
                onClick={enterFullScreen}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Enter Full Screen
              </button>
              {steps.find(s => s.id === SetupStep.FULL_SCREEN)?.completed && (
                <button
                  onClick={startInterview}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">AcademiX</span>
          {/* <div className="flex items-center gap-2 bg-neutral-900/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-neutral-800"> */}
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/20">Proctored</span>
          
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500" />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Steps */}
        <div className="w-64 shrink-0">
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-neutral-800">
            <h1 className="text-lg font-medium mb-1">Welcome to NSET mock Interview</h1>
            <p className="text-sm text-gray-400">by AcademiX</p>
          </div>
          <h3 className="text-xs text-gray-400 mb-3 font-medium">Finish all the requirements to start</h3>
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                  currentStep === step.id ? 'bg-neutral-800/50 backdrop-blur-sm border border-neutral-700' : ''
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    step.completed 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                      : 'bg-neutral-800 text-gray-400'
                  }`}
                >
                  {step.completed ? '✓' : step.id + 1}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {currentStep === SetupStep.INSTRUCTIONS ? (
            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800 h-[calc(100vh-8rem)] w-full">
              <div className="h-full flex flex-col">
                <h2 className="text-lg font-medium mb-4">Interview Instructions</h2>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <section>
                    <h3 className="text-sm font-medium mb-2 text-gray-300">Time and Proctored Environment</h3>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">This is a TIMED and PROCTORED mock interview.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">Please keep track of the time remaining at the top of the page.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">The interview will automatically end when time runs out.</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium mb-2 text-gray-300">Video and Full Screen Requirements</h3>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm"><strong>Video must remain ON</strong> throughout the interview.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">You will automatically enter <strong>full-screen mode</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">Exiting full-screen mode without re-entering within <strong>10 seconds</strong> will result in disqualification.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 text-sm">•</span>
                        <span className="text-sm">Ensure your face is clearly visible in the camera frame.</span>
                      </li>
                    </ul>
                  </section>

                  <section className="col-span-2">
                    <h3 className="text-sm font-medium mb-2 text-gray-300">Prohibited Actions</h3>
                    <div className="bg-neutral-800/30 backdrop-blur-sm rounded-lg p-4 border border-neutral-700/50">
                      <div className="grid grid-cols-6 gap-4">
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                            <span className="text-red-400 text-sm">1</span>
                          </div>
                          <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Switching Tabs</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                            <span className="text-red-400 text-sm">2</span>
                          </div>
                          <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Closing Session</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                            <span className="text-red-400 text-sm">3</span>
                          </div>
                          <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Opening Inspector</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                            <span className="text-red-400 text-sm">4</span>
                          </div>
                          <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Right Click</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                            <span className="text-red-400 text-sm">5</span>
                          </div>
                          <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Text Selection</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-transparent border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 group">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-200">
                            <span className="text-red-400 text-sm">6</span>
                          </div>
                          <span className="text-xs text-center text-gray-300 group-hover:text-red-400 transition-colors duration-200">Exit Full-Screen</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="col-span-2">
                    <h3 className="text-sm font-medium mb-2 text-gray-300">Disqualification Policy</h3>
                    <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-3 border border-red-500/20">
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5 text-sm">•</span>
                          <span className="text-sm">Exiting the session tab or browser during the interview will result in <strong>immediate disqualification</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5 text-sm">•</span>
                          <span className="text-sm">Any violation of the prohibited actions will also lead to disqualification.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5 text-sm">•</span>
                          <span className="text-sm">Multiple violations will result in permanent disqualification from future interviews.</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section className="col-span-2">
                    <h3 className="text-sm font-medium mb-2 text-gray-300">Technical Requirements</h3>
                    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-3 border border-neutral-700">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-sm">•</span>
                          <span className="text-sm">Stable internet connection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-sm">•</span>
                          <span className="text-sm">Working camera and microphone</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-sm">•</span>
                          <span className="text-sm">Modern web browser</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="col-span-2 pt-2">
                    <div className="flex flex-col gap-3">
                      <label className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          className="mt-1 rounded bg-neutral-800 border-neutral-700" 
                          onChange={handleCheckboxChange}
                        />
                        <span className="text-xs text-gray-300">I have read the instructions and agree to follow them. I understand that not following them may result in disqualification.</span>
                      </label>
                      <div className="relative group">
                        <button
                          onClick={goToNextStep}
                          disabled={!steps.find(s => s.id === SetupStep.INSTRUCTIONS)?.completed}
                          className={`${
                            steps.find(s => s.id === SetupStep.INSTRUCTIONS)?.completed
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 cursor-pointer'
                              : 'bg-neutral-800 text-gray-400 cursor-not-allowed'
                          } text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/20`}
                        >
                          Next
                        </button>
                        {!steps.find(s => s.id === SetupStep.INSTRUCTIONS)?.completed && (
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
                            <div className="bg-neutral-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-neutral-700 whitespace-nowrap">
                              Please agree with the instructions
                            </div>
                            <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderCurrentStep()
          )}
        </div>
      </div>
    </div>
  );
} 