import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getInterviewById } from '@/lib/services/interview.service';
import { getUserById } from '@/lib/actions/user.action';
import { getRandomQuestions } from '@/lib/services/question.service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const [interview, user, questions] = await Promise.all([
      getInterviewById(params.id),
      getUserById(session.user.id),
      getRandomQuestions(2)
    ]);

    if (!interview || !user || questions.length < 2) {
      return new NextResponse(JSON.stringify({ error: 'Not found' }), {
        status: 404,
      });
    }

    return NextResponse.json({
      interview,
      user,
      questions
    });
  } catch (error) {
    console.error('Error in interview route:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
} 