'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StartInterviewPage({ params }: PageProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const resolvedParams = use(params);

  const startInterview = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(`/interview/${resolvedParams.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8">
        <h1 className="text-2xl font-medium text-gray-300">
          Best of Luck with your NSET mock interview
        </h1>
        
        <button
          onClick={startInterview}
          disabled={isNavigating}
          className={`${
            isNavigating 
              ? 'bg-neutral-800 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600'
          } text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg shadow-green-500/20`}
        >
          {isNavigating ? 'Starting...' : 'Start Interview'}
        </button>

        <div className="text-xl font-bold tracking-tight text-gray-400">
          ACADEMIX
        </div>
      </div>
    </div>
  );
} 