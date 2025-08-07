"use client";
import { FC, useEffect, useContext } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { AppContext } from "@/context/app";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { authenticated, ready } = usePrivy();
  const [state] = useContext(AppContext);

  // Auto-switch to Base Sepolia when embedded wallet is available
  useEffect(() => {
    if (ready && authenticated && state.embeddedWallet) {
      state.embeddedWallet.switchChain(baseSepolia.id).catch((error: any) => {
        console.log("Chain switch failed:", error);
      });
    }
  }, [ready, authenticated, state.embeddedWallet]);

  return (
    <>
      {children}
    </>
  );
};

export default Wrapper;
