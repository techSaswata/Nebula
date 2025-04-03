"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { Transcript } from '@/lib/types';

interface VAPIContextType {
  isConnected: boolean;
  isInterviewing: boolean;
  isLoading: boolean;
  transcript: Transcript[];
  startInterview: (interviewId: string, position: string) => Promise<void>;
  stopInterview: () => void;
  error: string | null;
}

const VAPIContext = createContext<VAPIContextType | undefined>(undefined);

export function VAPIProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const callRef = useRef<any>(null);

  useEffect(() => {
    // Initialize VAPI
    try {
      vapi.on('ready', () => {
        setIsConnected(true);
      });

      vapi.on('error', (error) => {
        console.error('VAPI error:', error);
        setError(`VAPI error: ${error.message || 'Unknown error'}`);
      });
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
      setError('Failed to initialize VAPI');
    }

    return () => {
      // Cleanup
      if (callRef.current) {
        try {
          callRef.current.destroy();
        } catch (error) {
          console.error('Error destroying call:', error);
        }
      }
    };
  }, []);

  const startInterview = async (interviewId: string, position: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setTranscript([]);
      
      // Create a new call
      const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
      
      if (!workflowId) {
        throw new Error('VAPI workflow ID is not defined');
      }

      const call = await vapi.start({
        workflowId,
        metadata: {
          interviewId,
          position,
        },
      });

      callRef.current = call;
      
      // Add event listeners
      call.on('started', () => {
        setIsInterviewing(true);
        setIsLoading(false);
      });

      call.on('stopped', () => {
        setIsInterviewing(false);
        setIsLoading(false);
      });

      call.on('message', (message) => {
        if (message.role === 'assistant' || message.role === 'user') {
          setTranscript((prev) => [
            ...prev,
            { role: message.role, content: message.content || '' }
          ]);
        }
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        setError(`Call error: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
        setIsInterviewing(false);
      });

    } catch (error) {
      console.error('Failed to start interview:', error);
      setError(`Failed to start interview: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const stopInterview = () => {
    try {
      if (callRef.current) {
        callRef.current.stop();
        setIsInterviewing(false);
      }
    } catch (error) {
      console.error('Failed to stop interview:', error);
      setError(`Failed to stop interview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <VAPIContext.Provider
      value={{
        isConnected,
        isInterviewing,
        isLoading,
        transcript,
        startInterview,
        stopInterview,
        error,
      }}
    >
      {children}
    </VAPIContext.Provider>
  );
}

export function useVAPI() {
  const context = useContext(VAPIContext);
  if (context === undefined) {
    throw new Error('useVAPI must be used within a VAPIProvider');
  }
  return context;
} 