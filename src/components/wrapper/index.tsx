"use client";
import { FC, useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import Modal from "../modal";
import Loader from "../loader";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const checkWallet = useCallback(async () => {
    try {
      setCheckingEligibility(true);
      const response = await fetch(
        "https://pgwulhyapaeyxymkdabn.supabase.co/rest/v1/Whitelist?wallet_address=eq." +
          address,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_KEY!,
            Authorization: process.env.NEXT_PUBLIC_SUPABASE_KEY!,
          },
        }
      );
      const data = await response.json();
      setShowRegisterModal(!(data.length > 0));
    } catch (error) {
      console.log(error);
    } finally {
      setCheckingEligibility(false);
    }
  }, [address]);

  // useEffect(() => {
  //   if (address) checkWallet();
  // }, [address]);

  // Disable body scrolling when modal is open
  useEffect(() => {
    if (showRegisterModal) {
      // Save the current overflow value to restore it later
      const originalOverflow = document.body.style.overflow;
      // Disable scrolling
      document.body.style.overflow = "hidden";

      // Cleanup function to re-enable scrolling when component unmounts or modal closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showRegisterModal]);

  return (
    <>
      {children}
      <Modal isOpen={showRegisterModal} overlayClassName="bg-black/90">
        <div className="p-12 relative overflow-hidden w-[600px] h-[400px] flex flex-col items-center justify-between">
          <img
            className="absolute top-0 left-0 object-cover w-full h-full z-[-1]"
            alt="modal-bg"
            src="/assets/welcome-modal-background-icon.svg"
          />
          {!isConnected ? (
            <>
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
                  Please connect to verify if you're Whitelisted!
                </p>
              </div>
              <button
                className="w-auto mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                onClick={openConnectModal}
              >
                <img
                  src="/assets/connect-wallet-icon.svg"
                  alt="connect-wallet"
                />
                <span className="text-white text-[16px] font-[700] leading-[24px]">
                  Connect Wallet
                </span>
              </button>
            </>
          ) : checkingEligibility ? (
            <>
              <div className="flex flex-col items-center">
                <Loader size="2xl" />
                <p className="font-bold text-primary text-[28px] leading-[24px] mt-6 mb-4">
                  Checking Eligibility...
                </p>
                <p className="font-medium text-text-color text-[18px] leading-[24px]">
                  This won't be long!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <img
                  src="/assets/not-whitelisted-icon.svg"
                  alt="not-whitelisted"
                  className="mb-6"
                />
                <p className="font-bold text-primary text-[28px] leading-[24px] mb-4">
                  Wallet not whitelisted!
                </p>
                <p className="font-medium text-text-color text-[18px] leading-[24px]">
                  Please register your agent to be part of the Beta
                </p>
              </div>
              <div className="w-full flex items-center justify-center gap-4">
                <Link
                  href="https://88phxim41aw.typeform.com/to/MBZRyY88"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <div className="p-[3.47px] bg-gradient-to-br from-[#FE4600] to-[#E2ECF5] rounded-[50px] shadow-[8.11px_8.11px_18.53px_0px_rgba(202,221,237,1),-8.11px_-8.11px_18.53px_0px_rgba(202,221,237,0.6)]">
                    <button className="w-[256px] space-x-2 flex items-center justify-center rounded-[50px] bg-primary py-[12px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]">
                      <img src="/assets/stars-icon.svg" alt="pixelated-arrow" />
                      <span className="text-white text-[16px] font-[700] leading-[24px]">
                        Join the Ensemble
                      </span>
                    </button>
                  </div>
                </Link>
                <img
                  src="/assets/power-icon.svg"
                  alt="power"
                  className="cursor-pointer"
                  onClick={() => disconnect()}
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Wrapper;
