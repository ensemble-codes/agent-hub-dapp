import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json()

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Email and wallet address are required' },
        { status: 400 }
      )
    }

    // Validate wallet address format (basic Ethereum address validation)
    const walletRegex = /^0x[a-fA-F0-9]{40}$/
    if (!walletRegex.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Update wallet address using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ wallet_address: walletAddress })
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
      user: data
    })
  } catch (error) {
    console.error('Update wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
