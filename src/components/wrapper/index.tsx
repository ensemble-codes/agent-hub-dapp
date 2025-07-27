"use client";
import { FC, useEffect, useContext, useState, useRef } from "react";
import Modal from "../modal";
import { usePrivy } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { AppContext } from "@/context/app";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { login, authenticated, ready, logout } = usePrivy();
  const { push } = useRouter();
  const pathname = usePathname();
  const [state] = useContext(AppContext);
  const { checkWalletExists } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [walletCheckLoading, setWalletCheckLoading] = useState(false);
  const hasCheckedWallet = useRef(false);

  // Check wallet verification when wallet connects
  useEffect(() => {

    const checkWalletVerification = async () => {
      if (ready && authenticated && state.embeddedWallet && !walletCheckLoading && !hasCheckedWallet.current) {
        console.log('Checking wallet verification for:', state.embeddedWallet.address);
        hasCheckedWallet.current = true;
        setWalletCheckLoading(true);
        
        try {
          const result = await checkWalletExists(state.embeddedWallet.address);
          
          if (result.success && !result.user) {
            console.log('User not verified, showing modal');
            setShowVerificationModal(true);
          } else {
            console.log('User verified or check failed');
          }
        } catch (error) {
          console.error('Wallet verification check failed:', error);
        } finally {
          setWalletCheckLoading(false);
        }
      }
    };

    checkWalletVerification();
  }, [ready, authenticated, state.embeddedWallet, walletCheckLoading]);

  // Auto-switch to Base Sepolia when embedded wallet is available
  useEffect(() => {
    if (ready && authenticated && state.embeddedWallet) {
      state.embeddedWallet.switchChain(baseSepolia.id).catch((error: any) => {
        console.log("Chain switch failed:", error);
      });
    }
  }, [ready, authenticated, state.embeddedWallet]);

  // Don't show modal until Privy is ready
  const shouldShowModal = ready && !authenticated && pathname !== '/register-user';

  const handleDisconnect = () => {
    logout();
    setShowVerificationModal(false);
    hasCheckedWallet.current = false; // Reset for next connection
  };

  return (
    <>
      {children}
      
      {/* Welcome Modal */}
      <Modal isOpen={shouldShowModal} overlayClassName="bg-black/90">
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
              Welcome to the Ensemble Beta
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

      {/* Verification Required Modal */}
      <Modal isOpen={showVerificationModal && authenticated} overlayClassName="bg-black/90">
        <div className="p-12 relative overflow-hidden w-[600px] h-[400px] flex flex-col items-center justify-between">
          <img
            className="absolute top-0 left-0 object-cover w-full h-full z-[-1]"
            alt="modal-bg"
            src="/assets/welcome-modal-background-icon.svg"
          />
          <div className="flex flex-col items-center">
            <img
              src="/assets/not-whitelisted-icon.svg"
              alt="verification-required"
              className="mb-6"
            />
            <p className="font-bold text-red-500 text-[28px] leading-[24px] mb-4">
              Verification Required
            </p>
            <p className="font-medium text-text-color text-[18px] leading-[24px] text-center">
              This wallet is not verified to use the application
            </p>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Please register with your email to get verified access
            </p>
          </div>
          <div className="flex gap-4">
            <button
              className="px-6 py-3 rounded-[50px] bg-gray-500 text-white font-[700]"
              onClick={handleDisconnect}
            >
              Disconnect Wallet
            </button>
            <button
              className="px-6 py-3 rounded-[50px] bg-primary text-white font-[700]"
              onClick={() => {
                setShowVerificationModal(false);
                push("/register-user");
              }}
            >
              Register Now
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Wrapper;
