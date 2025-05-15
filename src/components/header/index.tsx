"use client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
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
      <div className="w-full flex items-center justify-between py-2 px-4 bg-white rounded-[16px]">
        <Link
          href={"/"}
        >
          <img
            src="/assets/logo-icon.svg"
            alt="logo"
            className="w-[75px] h-[68px]"
          />
        </Link>
        <div className="flex items-center gap-6">
        <Link
            href={"/register-agent"}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[14px] font-normal leading-[100%] text-[#121212]"
          >
            REGISTER AGENT
          </Link>
          <Link
            href={"https://ensemble.codes"}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[14px] font-normal leading-[100%] text-[#121212]"
          >
            ENSEMBLE
          </Link>
          <Link
            href={"https://github.com/ensemble-codes/ensemble-framework"}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[14px] font-normal leading-[100%] text-[#121212]"
          >
            DOCS
          </Link>
          {isConnected ? (
            pathname.includes("register-agent") ? null : (
              <button
                className="w-fit space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                onClick={() => push(`/register-agent`)}
              >
                <span className="text-white text-[16px] font-[700] leading-[24px]">
                  Register Agent
                </span>
                <img
                  src="/assets/pixelated-arrow-icon.svg"
                  alt="pixelated-arrow"
                />
              </button>
            )
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
      </div>
    </>
  );
};

export default AppHeader;
