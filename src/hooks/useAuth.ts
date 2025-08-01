import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/interface/user'

interface AuthState {
  user: User | null
  loading: boolean
  authLoading: boolean
  sessionChecked: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    authLoading: true,
    sessionChecked: false,
    error: null
  })

  const sendOTP = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // First register the user via API (bypasses RLS)
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const registerData = await registerResponse.json()
      
      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Failed to register user')
      }

      // Send OTP via Supabase
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/register-user`
        }
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP'
      setAuthState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const verifyOTP = useCallback(async (email: string, token: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.log('Supabase error:', error);
        throw error
      }

      // If verification successful, update user verification status via API
      if (data.user) {
        
        const updateResponse = await fetch('/api/auth/verify-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: data.user.email,
            otp_verified_at: new Date().toISOString()
          })
        })

        if (!updateResponse.ok) {
          const updateData = await updateResponse.json()
          console.log('verify-user API error:', updateData);
          throw new Error(updateData.error || 'Failed to update user verification')
        }

        const userData = await updateResponse.json()
        setAuthState(prev => ({ 
          ...prev, 
          user: userData.user, 
          sessionChecked: true 
        }))
      } else {
        console.log('No user data in Supabase response');
      }

      // Check if session was set
      const { data: { session } } = await supabase.auth.getSession();

      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      setAuthState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      setAuthState({ user: null, loading: false, authLoading: false, sessionChecked: true, error: null })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out'
      setAuthState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setAuthState(prev => ({ ...prev, authLoading: false, loading: false }))
    }
  }, [])

  const checkUser = useCallback(async () => {
    setAuthState(prev => ({ ...prev, authLoading: true, error: null }))
    
    try {
      // First check if there's an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session check error:', sessionError)
        throw sessionError
      }
      
      if (!session?.user?.email) {
        // No session found - user is not authenticated
        setAuthState(prev => ({ 
          ...prev, 
          user: null, 
          authLoading: false, 
          sessionChecked: true 
        }))
        return
      }

      // Session exists - load user data via API
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load user data')
      }
      
      const data = await response.json()
      setAuthState(prev => ({ 
        ...prev, 
        user: data.user, 
        authLoading: false, 
        sessionChecked: true 
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check user'
      console.error('Auth check error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        authLoading: false, 
        sessionChecked: true 
      }))
    }
  }, [])

  const checkWalletExists = useCallback(async (walletAddress: string) => {
    try {
      const response = await fetch('/api/auth/check-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check wallet')
      }

      return { success: true, user: data.user }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check wallet'
      return { success: false, error: errorMessage }
    }
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    checkUser()
  }, []);

  return {
    ...authState,
    sendOTP,
    verifyOTP,
    signOut,
    checkUser,
    checkWalletExists
  }
} 