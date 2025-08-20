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
  const [redirecting, setRedirecting] = useState(true);

  // Expose refreshUser function
  const refreshUser = async (email: string) => {
    if (email) {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const email = session?.user?.email;
      if (event === "SIGNED_OUT") {
        dispatch({ type: SET_USER, payload: null });
      }
      if (session?.user && typeof email === "string") {
        await refreshUser(email);
      } else {
        dispatch({ type: SET_USER, payload: null });
      }
      dispatch({
        type: SET_AUTH_LOADING,
        payload: false,
      });
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
    if (!state.authLoading) {
      if (!state.user) {
        push("/register-user");
      }
      const timeout = setTimeout(() => {
        setRedirecting(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.authLoading, state.user]);

  if (redirecting)
    return (
      <div className="fixed inset-0 bg-white z-[999] flex items-center justify-center">
        {/* Static overlay content - counter-rotates to stay upright */}
        <div className="absolute flex flex-col items-center justify-center gap-5" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <img
            src={"/assets/logo-icon.svg"}
            alt="agent hub"
            className="w-[75px] h-[68px]"
          />
          <div className="space-y-1 animate-pulse">
            <p className="text-[28px] text-center font-[Montserrat] font-bold leading-[120%] bg-gradient-to-r from-[#F94D27] to-[#FF886D] bg-clip-text text-transparent animate-fade-in">
              Agent Hub
            </p>
            <p className="text-primary text-lg font-medium leading-[120%] animate-fade-in">
              Powered by Ensemble
            </p>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
        `}</style>
      </div>
    );

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
