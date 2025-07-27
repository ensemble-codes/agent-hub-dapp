import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, otp_verified_at } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // First check if user exists and is already verified
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

    // If user is already verified, return success without updating
    if (existingUser.is_verified) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already verified'
      })
    }

    // Update user verification status using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: true,
        otp_verified_at: otp_verified_at || new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data,
      message: 'User verified successfully'
    })
  } catch (error) {
    console.error('User verification update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 