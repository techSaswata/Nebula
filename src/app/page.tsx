import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function Page() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    })
    
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      return redirect('/dashboard')
    }

    return redirect('/home')
  } catch (error) {
    console.error('Error in root page:', error)
    return redirect('/home')
  }
} 