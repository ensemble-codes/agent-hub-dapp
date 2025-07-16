"use client";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

const AppHeader = () => {
  const { login, authenticated, user, logout, ready } = usePrivy();

  return (
    <>
      <div className="hidden w-full lg:flex items-center justify-end py-2 px-4 bg-white rounded-[16px] lg:mb-8">
        <div className="flex items-center justify-end gap-6">
          <Link
            href={"/register-agent"}
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
            href={"https://docs.ensemble.codes/"}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[14px] font-normal leading-[100%] text-[#121212]"
          >
            DOCS
          </Link>
          {ready && authenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-[14px] text-[#121212]">
                {user?.email?.address || user?.wallet?.address?.slice(0, 6) + '...'}
              </span>
              <button
                onClick={logout}
                className="text-[14px] text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="w-auto space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
              onClick={login}
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
