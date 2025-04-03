'use client';

import { InterviewPage } from "@/components/interview/InterviewPage";
import { getInterviewById } from "@/lib/actions/interview.action";
import { getUserById } from "@/lib/actions/user.action";
import { getRandomQuestions } from "@/lib/services/question.service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from 'react';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const [pageData, setPageData] = useState<{
    userName: string;
    userId: string;
    questions: any[];
  } | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          redirect('/login');
          return;
        }

        const interview = await getInterviewById(id);
        if (!interview) {
          redirect('/dashboard');
          return;
        }

        const user = await getUserById(session.user.id);
        if (!user) {
          redirect('/login');
          return;
        }

        const questions = await getRandomQuestions(2);
        if (questions.length < 2) {
          console.error("Not enough questions available");
          redirect('/dashboard');
          return;
        }

        setPageData({
          userName: user.name,
          userId: user.id,
          questions
        });
      } catch (error) {
        console.error('Error initializing interview:', error);
        redirect('/dashboard');
      }
    };

    initPage();
  }, [id]);

  if (!pageData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <InterviewPage 
      {...pageData}
      interviewId={id}
      interviewType="technical"
      feedbackId={null}
    />
  );
}