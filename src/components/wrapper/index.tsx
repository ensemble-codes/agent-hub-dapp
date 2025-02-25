"use client";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import Modal from "../modal";
import { metaMask } from "wagmi/connectors";
import { baseSepolia } from "viem/chains";
import Loader from "../loader";
import { useRouter } from "next/navigation";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { push } = useRouter();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibility, setEligibility] = useState(false);

  const onModalClose = () => {
    localStorage.setItem("show-agenthub-register-modal", "true");
    setShowRegisterModal(false);
  };

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
      setEligibility(data.length > 0);
    } catch (error) {
      console.log(error);
      setEligibility(false);
    } finally {
      setCheckingEligibility(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) checkWallet();
  }, [address]);

  useEffect(() => {
    const showModal = localStorage.getItem("show-agenthub-register-modal");
    if (showModal) setShowRegisterModal(false);
    else setShowRegisterModal(true);
  }, []);

  useEffect(() => {
    if (eligibility) onModalClose();
  }, [eligibility]);

  return (
    <>
      {children}
      <Modal isOpen={showRegisterModal} onClose={onModalClose}>
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
                onClick={() =>
                  connect({ connector: metaMask(), chainId: baseSepolia.id })
                }
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
              <button
                className="w-auto space-x-2 flex items-center justify-between rounded-[50px] border border-[#3D3D3D66] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-[12px] px-[16px]"
                onClick={onModalClose}
              >
                <span className="font-medium text-[#3d3d3d] leading-[24px]">
                  Cancel
                </span>
              </button>
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
              <div 
                className="p-[3.47px] bg-gradient-to-br from-[#FE4600] to-[#E2ECF5] rounded-[50px] shadow-[8.11px_8.11px_18.53px_0px_rgba(202,221,237,1),-8.11px_-8.11px_18.53px_0px_rgba(202,221,237,0.6)]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-2 justify-between rounded-[50px] py-[12px] px-[16px] bg-gradient-to-br from-[#FE4600] to-[#FF7541] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    push("/register-agent");
                    onModalClose();
                  }}
                >
                  <img
                    src="/assets/register-icon.svg"
                    alt="register"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Register Agent
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Wrapper;
