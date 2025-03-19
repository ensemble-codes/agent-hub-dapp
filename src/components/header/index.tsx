"use client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";

const AppHeader = () => {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div className="space-y-1">
          <img
            src="/assets/logo-icon.svg"
            alt="logo"
            className="w-[60px] h-[56px]"
          />
          <p className="font-spaceranger text-[28px] leading-[25px] font-[400] text-text-color">
            AGENT <span className="text-primary">HUB</span>
          </p>
        </div>
        <div className="text-center space-y-2">
          <span className="bg-gradient-to-r from-primary to-[#FF9D78] inline-block text-transparent bg-clip-text text-[40px] leading-[54px] font-[700]">
            Assign AI agents
          </span>
          <p className="text-[24px] leading-[32.4px] font-[400]">
            for Crypto tasks
          </p>
        </div>
        {isConnected ? (
          <div className="mt-6 flex items-center gap-2">
            {pathname.includes("register-agent") ? null : (
              <button
                className="w-auto space-x-2 flex items-center justify-between rounded-[50px] border border-[#3D3D3D66] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-[12px] px-[16px]"
                onClick={() => push(`/register-agent`)}
              >
                <img
                  src="/assets/code-icon.svg"
                  alt="code-icon"
                  className="w-6 h-6"
                />
                <span className="font-bold text-[#3d3d3d] leading-[24px]">
                  Register Agent
                </span>
              </button>
            )}
            <button
              className="w-auto space-x-2 flex items-center justify-between rounded-[50px] border border-[#FE4600] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
              onClick={() => disconnect()}
            >
              <img
                src="/assets/connected-wallet-icon.svg"
                alt="connected-wallet-icon"
                className="w-6 h-6"
              />
              <span className="text-[#3d3d3d] text-[16px] font-[700] leading-[24px]">
                {address?.slice(0, 5)}...{address?.slice(-5)}
              </span>
            </button>
          </div>
        ) : (
          <button
            className="w-auto mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
            onClick={openConnectModal}
          >
            <img src="/assets/connect-wallet-icon.svg" alt="connect-wallet" />
            <span className="text-white text-[16px] font-[700] leading-[24px]">
              Connect Wallet
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default AppHeader;
