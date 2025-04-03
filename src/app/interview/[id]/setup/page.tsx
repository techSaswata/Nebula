'use client';

import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SetupPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <InterviewSetup interviewId={resolvedParams.id} />;
} 