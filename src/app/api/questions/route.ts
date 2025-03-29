import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface Question {
  id: number
  question: string
  equation_text: string | null
  correct_answer: number
  difficulty: string
  category: string
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get query parameters
    const url = new URL(request.url)
    const difficulty = url.searchParams.get('difficulty')
    const limit = url.searchParams.get('limit') || '10'
    const category = url.searchParams.get('category') || 'maths' // Get category from query params

    console.log('Fetching questions with params:', { category, difficulty, limit })

    // Build and execute query
    let query = supabase
      .from('questions_test')
      .select('*')
    
    // Filter by category
    if (category === 'reasoning') {
      query = query.eq('category', 'logical')
    } else {
      query = query.eq('category', 'maths')
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    // Execute query with proper ordering and limit
    const { data: questions, error } = await query
      .limit(parseInt(limit))
      .order('id', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error.message 
      }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      console.log(`No ${category} questions found`)
      return NextResponse.json({ 
        error: `No ${category} questions found` 
      }, { status: 404 })
    }

    // Shuffle and process questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5)
    console.log(`Found ${shuffledQuestions.length} ${category} questions`)

    const processedQuestions = shuffledQuestions.map((q: Question) => ({
      ...q,
      question: q.equation_text 
        ? `${q.question}`  // Preserve LaTeX formatting
        : q.question
    }))

    // Return success response
    return NextResponse.json({
      success: true,
      questions: processedQuestions
    })

  } catch (error) {
    console.error('Unexpected error in questions API:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 