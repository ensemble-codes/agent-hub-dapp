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
  const { loading: authLoading } = useAuth();
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
    if (!authLoading) {
      setIsLoading(false);
      
      // Redirect to register-user page if not authenticated and not already there
      if (state.user === null && pathname !== '/register-user') {
        router.push('/register-user');
      }
    }
  }, [authLoading, state.user, pathname, router]);

  // Show loading modal while checking authentication
  const shouldShowLoadingModal = isLoading && pathname !== '/register-user';

  // Show wallet connection modal if user is authenticated but no wallet is connected
  const shouldShowWalletModal = !isLoading && ready && state.user !== null && state.embeddedWallet === undefined && pathname !== '/register-user';

  return (
    <>
      {children}
      
      {/* Loading Modal */}
      <Modal isOpen={shouldShowLoadingModal} overlayClassName="bg-black/90">
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
              Loading...
            </p>
            <p className="font-medium text-text-color text-[18px] leading-[24px]">
              Checking authentication status
            </p>
            <div className="mt-6">
              <Loader size="lg" />
            </div>
          </div>
        </div>
      </Modal>



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
