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
  const { user, sessionChecked } = useAuth();

  // Function to silently track wallet connection
  const trackWalletConnection = async (walletAddress: string) => {
    if (!user?.email) return;

    try {
      await fetch('/api/auth/update-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email,
          walletAddress 
        })
      });
    } catch (error) {
      console.error('Failed to track wallet connection:', error);
    }
  };

  // Sync user state to context only after session check is complete
  useEffect(() => {
    if (sessionChecked) {
      dispatch({
        type: SET_USER,
        payload: user
      });
    }
  }, [user, sessionChecked]);

  // Handle wallet connection (separate from Supabase auth)
  useEffect(() => {
    if (authenticated && wallets && wallets.length) {
      // Use the first available wallet (could be embedded or connected)
      const connectedWallet = wallets[0];
      
      dispatch({
        type: SET_EMBEDDED_WALLET,
        payload: connectedWallet,
      });

      // Silently track wallet connection if user is authenticated
      if (user?.email && connectedWallet?.address) {
        trackWalletConnection(connectedWallet.address);
      }
    } else {
      // Clear wallet when disconnected
      dispatch({
        type: SET_EMBEDDED_WALLET,
        payload: undefined,
      });
    }
  }, [authenticated, wallets, user]);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
