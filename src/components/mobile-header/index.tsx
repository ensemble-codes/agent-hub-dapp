"use client";
import Link from "next/link";
import { useConnectModal, ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="lg:hidden sticky top-0 bg-[#F9F9F9] z-[10] w-full p-4 flex items-center justify-between border-b-[0.5px] border-b-[#8F95B2]">
        <Link href={"/"}>
          <img
            src="/assets/logo-icon.svg"
            alt="logo"
            className="w-[40px] h-[36px]"
          />
        </Link>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-6 h-6 cursor-pointer"
        >
          <img 
            src={"/assets/mobile-menu-icon.svg"} 
            alt="mobile-menu" 
            className="w-full h-full"
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#8F95B2]/20">
            <div className="flex items-center justify-between mb-6">
              <img
                src="/assets/logo-icon.svg"
                alt="logo"
                className="w-[40px] h-[36px]"
              />
            </div>
            {isConnected ? (
              <ConnectButton showBalance={false} />
            ) : (
              <button
                className="w-full space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                onClick={() => {
                  openConnectModal?.();
                  setIsMenuOpen(false);
                }}
              >
                <img src="/assets/connect-wallet-icon.svg" alt="connect-wallet" />
                <span className="text-white text-[16px] font-[700] leading-[24px]">
                  Connect Wallet
                </span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-6">
              <ul className="space-y-6">
                <li>
                  <Link
                    href="/register-agent"
                    className="text-[16px] font-medium text-[#121212] hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register Agent
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ensemble.codes"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[16px] font-medium text-[#121212] hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ensemble
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/ensemble-codes/ensemble-framework"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[16px] font-medium text-[#121212] hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Docs
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
