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

    // First, get the current user to check existing wallet addresses
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('wallet_addresses')
      .eq('email', email)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // Check if wallet already exists in the array
    const existingWallets = currentUser.wallet_addresses || []
    const walletExists = existingWallets.includes(walletAddress)

    if (walletExists) {
      // Wallet already exists, return success without updating
      return NextResponse.json({
        success: true,
        user: currentUser
      })
    }

    // Add new wallet to the array
    const updatedWallets = [...existingWallets, walletAddress]

    // Update wallet addresses array using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ wallet_addresses: updatedWallets })
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
