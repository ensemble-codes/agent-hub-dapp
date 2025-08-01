"use client";
import { createContext, FC, useEffect, useReducer, useState } from "react";
import { Action } from "./action";
import reducer from "./reducer";
import initialState, { AppState } from "./state";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { SET_AUTH_LOADING, SET_EMBEDDED_WALLET, SET_USER } from "./actions";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  const { push } = useRouter();

  // Expose refreshUser function
  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const email = session?.user?.email;
    if (session?.user && typeof email === "string") {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load user data");
      }

      const data = await response.json();
      dispatch({ type: SET_USER, payload: data.user });
    } else {
      dispatch({ type: SET_USER, payload: null });
    }
  };

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const email = session?.user?.email;
      if (event === "SIGNED_OUT") {
        dispatch({ type: SET_USER, payload: null });
        return;
      }
      if (session?.user && typeof email === "string") {
        await refreshUser();
      } else {
        dispatch({ type: SET_USER, payload: null });
      }
      dispatch({
        type: SET_AUTH_LOADING,
        payload: false
      })
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to silently track wallet connection
  const trackWalletConnection = async (walletAddress: string) => {
    if (!state.user?.email) return;

    try {
      await fetch("/api/auth/update-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.user.email,
          walletAddress,
        }),
      });
    } catch (error) {
      console.error("Failed to track wallet connection:", error);
    }
  };

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
      if (state.user?.email && connectedWallet?.address) {
        trackWalletConnection(connectedWallet.address);
      }
    } else {
      // Clear wallet when disconnected
      dispatch({
        type: SET_EMBEDDED_WALLET,
        payload: undefined,
      });
    }
  }, [authenticated, wallets, state.user]);

  useEffect(() => {
    if (!state.authLoading && !state.user) push('/register-user')
  }, [state.authLoading, state.user])

  if (state.authLoading)
    return (
      <div className="fixed inset-0 bg-white z-[999] flex items-center justify-center">
        <div className="relative max-w-[420px] max-h-[420px] w-[90%] h-[90%]">
          {/* Background image that spins */}
          <div
            className="absolute inset-0 animate-spin"
            style={{
              animation: "spin 15s linear infinite",
              transformOrigin: "center center",
            }}
          >
            <img
              src={"/assets/splash-screen-vector-icon.svg"}
              alt="splash vector"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        {/* Static overlay content - counter-rotates to stay upright */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-5">
          <img
            src={"/assets/logo-icon.svg"}
            alt="agent hub"
            className="w-[75px] h-[68px]"
          />
          <p className="text-[28px] text-center font-[Montserrat] font-bold leading-[120%] bg-gradient-to-r from-[#F94D27] to-[#FF886D] bg-clip-text text-transparent">
            entering portal
          </p>
        </div>
        <img
          className="absolute bottom-0 w-full"
          alt="pattern"
          src={"/assets/orchestrator-pattern-bg.svg"}
        />
      </div>
    );

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
