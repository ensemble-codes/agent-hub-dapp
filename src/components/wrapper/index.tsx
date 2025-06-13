"use client";
import { FC } from "react";
import { useAccount } from "wagmi";
import Modal from "../modal";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  return (
    <>
      {children}
      <Modal isOpen={!isConnected} overlayClassName="bg-black/90">
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
        </div>
      </Modal>
    </>
  );
};

export default Wrapper;
