import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Parse JSON with error handling
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Fetch user data from our users table using admin client (bypasses RLS)
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json({ user: null })
  }
}
