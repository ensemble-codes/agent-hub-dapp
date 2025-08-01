"use client";
import { FC, useEffect, useContext, useState } from "react";
import Modal from "../modal";
import { usePrivy } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { AppContext } from "@/context/app";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "../loader";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { login, authenticated, ready } = usePrivy();
  const pathname = usePathname();
  const router = useRouter();
  const [state] = useContext(AppContext);
  const { user, sessionChecked } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Auto-switch to Base Sepolia when embedded wallet is available
  useEffect(() => {
    if (ready && authenticated && state.embeddedWallet) {
      state.embeddedWallet.switchChain(baseSepolia.id).catch((error: any) => {
        console.log("Chain switch failed:", error);
      });
    }
  }, [ready, authenticated, state.embeddedWallet]);

  // Track loading state and handle redirects
  useEffect(() => {
    // Only proceed if session check is complete
    if (sessionChecked) {
      // Redirect to register-user if user is not authenticated and not already there
      if (user === null && !pathname.includes("/register-user")) {
        router.push("/register-user");
        // Don't set isLoading to false yet - wait for pathname to change
        return;
      }
      
      // Set loading to false for all other cases
      setIsLoading(false);
    }
  }, [sessionChecked, user, pathname, router]);

  // Show splash screen while loading
  const shouldShowSplash = isLoading && pathname !== "/register-user";

  // Show wallet connection modal if user is authenticated but no wallet is connected
  const shouldShowWalletModal =
    !isLoading &&
    ready &&
    user !== null &&
    state.embeddedWallet === undefined &&
    pathname !== "/register-user";

  // Show splash screen
  if (shouldShowSplash) {
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
        <img className="absolute bottom-0 w-full" alt="pattern" src={"/assets/orchestrator-pattern-bg.svg"} />
      </div>
    );
  }

  return (
    <>
      {children}

      {/* Wallet Connection Modal */}
      <Modal isOpen={shouldShowWalletModal} overlayClassName="bg-black/90">
        <div className="p-12 relative overflow-hidden w-[600px] h-[400px] flex flex-col items-center justify-between">
          <img
            className="absolute top-0 left-0 object-cover w-full h-full z-[-1]"
            alt="modal-bg"
            src="/assets/welcome-modal-background-icon.svg"
          />
          <div className="flex flex-col items-center">
            <img
              src="/assets/welcome-vector-icon.svg"
              alt="welcome"
              className="mb-6"
            />
            <p className="font-bold text-primary text-[28px] leading-[24px] mb-4">
              Connect Your Wallet
            </p>
            <p className="font-medium text-text-color text-[18px] leading-[24px]">
              Please connect your wallet to continue
            </p>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Your wallet will be automatically switched to Base Sepolia testnet
            </p>
          </div>
          <button
            className="w-auto mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
            onClick={login}
          >
            <img src="/assets/connect-wallet-icon.svg" alt="connect-wallet" />
            <span className="text-white text-[16px] font-[700] leading-[24px]">
              Connect Wallet
            </span>
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Wrapper;
