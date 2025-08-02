"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo, useContext } from "react";
import { usePrivy, useFundWallet, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import Modal from "../modal";
import { baseSepolia } from "viem/chains";
import { createWalletClient, custom, parseEther } from "viem";
import { AppContext } from "@/context/app";

const MobileHeader = () => {
  const [state] = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { login, authenticated, user: privyUser, logout, ready, exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();

  // Wallet modal states
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const withdrawRef = useRef<HTMLDivElement>(null);
  const [withdrawHeight, setWithdrawHeight] = useState(0);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const copyAddress = async () => {
    if (state.embeddedWallet) {
      await navigator.clipboard.writeText(state.embeddedWallet.address || "");
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const resetWithdrawStates = () => {
    setShowWithdraw(false);
    setWithdrawAddress("");
    setWithdrawAmount("");
    setWithdrawError("");
    setWithdrawSuccess("");
  };

  const handleDisconnect = async () => {
    try {
      logout();
      setShowWalletModal(false);
      resetWithdrawStates();
    } catch (error) {
      console.error("Error during disconnect:", error);
      // Still logout from Privy even if Supabase logout fails
      logout();
      setShowWalletModal(false);
      resetWithdrawStates();
    }
  };

  const fund = useCallback(async () => {
    if (state.embeddedWallet) {
      try {
        fetchBalance();
        await fundWallet(state.embeddedWallet.address, {
          amount: "0.00033",
          chain: baseSepolia,
          card: {
            preferredProvider: "moonpay",
          },
        });
      } catch (error) {
        console.error("Funding error:", error);
      }
    }
  }, [state.embeddedWallet, fundWallet]);

  const handleExportWallet = useCallback(async () => {
    if (!ready || !state.embeddedWallet) {
      console.warn("Cannot export wallet: not ready or no embedded wallet");
      return;
    }
    
    try {
      await exportWallet();
    } catch (error) {
      console.error("Export wallet error:", error);
    }
  }, [ready, state.embeddedWallet, exportWallet]);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!state.embeddedWallet) return;

    setIsLoadingBalance(true);
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL!
      );
      const balanceWei = await provider.getBalance(state.embeddedWallet.address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch balance when modal opens
  useEffect(() => {
    if (showWalletModal && state.embeddedWallet) {
      fetchBalance();
    }
  }, [showWalletModal, state.embeddedWallet]);

  const validateAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleWithdraw = async () => {
    setWithdrawError("");
    setWithdrawSuccess("");

    if (!withdrawAddress || !withdrawAmount) {
      setWithdrawError("Please enter both address and amount.");
      return;
    }

    if (!validateAddress(withdrawAddress)) {
      setWithdrawError("Please enter a valid Ethereum address.");
      return;
    }

    if (!wallets || !wallets.length) {
      setWithdrawError("No wallet found.");
      return;
    }
    setWithdrawLoading(true);
    try {
      // Get the Privy wallet
      const wallet = wallets.find(w => w.walletClientType === 'privy');
      if (!wallet) {
        throw new Error('Privy wallet not found');
      }
      
      // Switch to Base Sepolia chain first
      await wallet.switchChain(baseSepolia.id);
      
      // Get the Ethereum provider from the wallet
      const ethereumProvider = await wallet.getEthereumProvider();
      
      // Create Viem wallet client
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(ethereumProvider),
      });
      
      // Convert to Viem transaction format
      const transactionRequest = {
        to: withdrawAddress as `0x${string}`,
        value: parseEther(withdrawAmount),
      };
      
      // Send transaction using Viem
      const hash = await walletClient.sendTransaction(transactionRequest);
      
      // Wait for transaction to be mined
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);
      await provider.waitForTransaction(hash);
      
      setWithdrawSuccess("Transaction sent!");
      setWithdrawAddress("");
      setWithdrawAmount("");
      fetchBalance();
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setWithdrawError("Failed to send transaction.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (showWithdraw && withdrawRef.current) {
      setWithdrawHeight(withdrawRef.current.scrollHeight);
    } else {
      setWithdrawHeight(0);
    }
  }, [
    showWithdraw,
    withdrawAddress,
    withdrawAmount,
    withdrawError,
    withdrawSuccess,
    withdrawLoading,
  ]);

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
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
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
            {ready && authenticated && state.embeddedWallet ? (
              <button
                className="py-1 px-4 text-[16px] text-[#000] border border-[#000] rounded-[20000px] font-normal flex items-center gap-2"
                style={{
                  boxShadow: "0px 4px 12px 0px rgba(249, 77, 39, 0.24)",
                }}
                onClick={() => {
                  setShowWalletModal(true);
                  setIsMenuOpen(false);
                }}
              >
                {state.embeddedWallet.address.slice(0, 4)}...
                {state.embeddedWallet.address.slice(-4)}
              </button>
            ) : ready && state.user ? (
              <button
                className="w-fit space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                onClick={() => {
                  login();
                  setIsMenuOpen(false);
                }}
              >
                <img
                  src="/assets/connect-wallet-icon.svg"
                  alt="connect-wallet"
                />
                <span className="text-white text-[16px] font-[700] leading-[24px]">
                  Connect Wallet
                </span>
              </button>
            ) : null}
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
                    href="https://docs.ensemble.codes/"
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

      {/* Mobile Wallet Management Modal */}
      <Modal
        isOpen={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          resetWithdrawStates();
        }}
      >
        <div className="bg-white rounded-[16px] p-6 w-[90vw] max-w-[400px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-bold text-[#121212]">Wallet</h3>
            <button
              onClick={() => {
                setShowWalletModal(false);
                resetWithdrawStates();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <img
                src="/assets/cross-gray-icon.svg"
                alt="close"
                className="w-5 h-5"
              />
            </button>
          </div>

          {state.embeddedWallet ? (
            <div className="space-y-4">
              {/* Wallet Address */}
              <div className="flex flex-col items-center justify-center gap-[2px]">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[18px] leading-[24px] text-[#000] font-extrabold">
                    {state.embeddedWallet.address.slice(0, 4)}...
                    {state.embeddedWallet.address.slice(-4)}
                  </p>
                  <button
                    onClick={copyAddress}
                    className="rounded-[8px] transition-colors"
                  >
                    <img
                      src={
                        copiedAddress
                          ? "/assets/check-icon.svg"
                          : "/assets/copy-icon.svg"
                      }
                      alt={copiedAddress ? "copied" : "copy"}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
                {isLoadingBalance || !balance ? null : (
                  <p className="text-light-text-color text-[14px] leading-[18px] font-semibold">
                    {balance} ETH
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2">
                <div
                  className="flex-1 py-3 text-center bg-light-text-color/20 cursor-pointer rounded-[12px] hover:scale-[1.05] font-semibold transition-all duration-300 ease-in-out ledaing-[18px] text-[13px] text-[#000]"
                  onClick={fund}
                >
                  Deposit
                </div>
                <div
                  className="flex-1 py-3 text-center bg-light-text-color/20 cursor-pointer rounded-[12px] hover:scale-[1.05] font-semibold transition-all duration-300 ease-in-out ledaing-[18px] text-[13px] text-[#000]"
                  onClick={() => setShowWithdraw((v) => !v)}
                >
                  Withdraw
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className="w-full py-3 text-center bg-light-text-color/20 cursor-pointer rounded-[12px] hover:scale-[1.05] font-semibold transition-all duration-300 ease-in-out ledaing-[18px] text-[13px] text-[#000]"
                  onClick={handleExportWallet}
                >
                  Export Wallet
                </div>
              </div>

              {/* Collapsible Withdraw Section with Animation */}
              <div
                style={{
                  maxHeight: showWithdraw ? withdrawHeight : 0,
                  opacity: showWithdraw ? 1 : 0,
                  transform: showWithdraw
                    ? "translateY(0px)"
                    : "translateY(-8px)",
                  transition:
                    "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s, transform 0.3s",
                  overflow: "hidden",
                }}
                aria-hidden={!showWithdraw}
              >
                <div
                  ref={withdrawRef}
                  className="bg-light-text-color/10 rounded-[12px] p-4 flex flex-col gap-3"
                >
                  <input
                    className="w-full p-2 outline-none rounded border border-light-text-color placeholder:text-placeholder-text text-[14px]"
                    placeholder="Recipient EVM address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    disabled={withdrawLoading}
                  />
                  <div className="flex items-stretch gap-3">
                    <div className="flex-1 flex p-2 bg-white items-center gap-2 rounded border border-light-text-color">
                      <input
                        className="remove-arroww-full flex-1 outline-none placeholder:text-placeholder-text p-0 text-[14px] bg-transparent"
                        placeholder="0.01"
                        value={withdrawAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || Number(value) >= 0) {
                            setWithdrawAmount(value);
                          }
                        }}
                        disabled={withdrawLoading}
                        type="text"
                      />
                      <span className="text-light-text-color font-semibold text-[14px]">
                        ETH
                      </span>
                    </div>
                    <button
                      className="w-fit py-2 px-6 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                      onClick={handleWithdraw}
                      disabled={withdrawLoading}
                    >
                      {"Send"}
                    </button>
                  </div>
                  {withdrawError && (
                    <p className="text-red-500 text-[13px]">{withdrawError}</p>
                  )}
                  {withdrawSuccess && (
                    <p className="text-green-600 text-[13px]">
                      {withdrawSuccess}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 text-[16px] text-[#000] font-semibold"
              >
                <img
                  src="/assets/disconnect-icon.svg"
                  alt="disconnect"
                  className="w-4 h-4"
                />
                Disconnect
              </button>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export default MobileHeader;
