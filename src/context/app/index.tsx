"use client";
import { createContext, FC, useEffect, useReducer } from "react";
import { Action } from "./action";
import reducer from "./reducer";
import initialState, { AppState } from "./state";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { SET_EMBEDDED_WALLET, SET_USER } from "./actions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface ContextProps {
  children: React.ReactNode;
}

export const AppContext = createContext<[AppState, React.Dispatch<Action>]>([
  initialState,
  () => {},
]);

export const AppContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { user, updateWalletAddress, checkUser } = useAuth();

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          // User signed in, check user data
          await checkUser();
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear user state
          dispatch({
            type: SET_USER,
            payload: null
          });
        }
      }
    );

    // Initial check for existing session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        await checkUser();
      }
    };
    
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, [checkUser]);

  // Sync user state to context
  useEffect(() => {
    dispatch({
      type: SET_USER,
      payload: user
    });
  }, [user]);

  // Handle wallet connection and updates
  useEffect(() => {
    if (authenticated && wallets && wallets.length) {
      // Use the first available wallet (could be embedded or connected)
      const connectedWallet = wallets[0];
      
      dispatch({
        type: SET_EMBEDDED_WALLET,
        payload: connectedWallet,
      });

      // Update wallet address if user exists and wallet is different
      if (
        user &&
        connectedWallet &&
        connectedWallet.address !== user.wallet_address
      ) {
        updateWalletAddress(connectedWallet.address);
      }
    }
  }, [authenticated, wallets, user, updateWalletAddress]);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
