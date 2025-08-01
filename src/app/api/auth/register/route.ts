import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Insert user using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        is_verified: false
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation - user already exists
      if (error.code === '23505') {
        // Fetch the existing user
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (fetchError) {
          return NextResponse.json(
            { error: fetchError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          user: existingUser,
          message: 'User already exists'
        })
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data
    })
  } catch (error) {
    console.error('User registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 