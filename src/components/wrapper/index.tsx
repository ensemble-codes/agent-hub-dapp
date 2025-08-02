"use client";
import { FC, useEffect, useContext } from "react";
import Modal from "../modal";
import { usePrivy } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { AppContext } from "@/context/app";
import { usePathname } from "next/navigation";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { login, authenticated, ready } = usePrivy();
  const pathname = usePathname();
  const [state] = useContext(AppContext);

  // Auto-switch to Base Sepolia when embedded wallet is available
  useEffect(() => {
    if (ready && authenticated && state.embeddedWallet) {
      state.embeddedWallet.switchChain(baseSepolia.id).catch((error: any) => {
        console.log("Chain switch failed:", error);
      });
    }
  }, [ready, authenticated, state.embeddedWallet]);

  // Show wallet connection modal if user is authenticated but no wallet is connected
  const shouldShowWalletModal =
    ready &&
    state.user !== null &&
    state.embeddedWallet === undefined &&
    pathname !== "/register-user";

  return (
    <>
      {children}

      {/* Wallet Connection Modal */}
      <Modal isOpen={shouldShowWalletModal} overlayClassName="bg-black/90">
        <div className="p-12 relative overflow-hidden lg:w-[600px] lg:h-[400px] w-full h-full flex flex-col items-center justify-between">
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
            <p className="font-medium text-text-color text-[18px] leading-[24px] text-center">
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
