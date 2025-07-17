"use client";
import { useFundWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "../modal";
import { ethers } from "ethers";

const AppHeader = () => {
  const { login, authenticated, user, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { fundWallet } = useFundWallet();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const withdrawRef = useRef<HTMLDivElement>(null);
  const [withdrawHeight, setWithdrawHeight] = useState(0);

  const copyAddress = async () => {
    if (wallets && wallets[0]) {
      await navigator.clipboard.writeText(wallets[0].address);
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

  const handleDisconnect = () => {
    logout();
    setShowWalletModal(false);
    resetWithdrawStates();
  };

  const fund = useCallback(async () => {
    if (wallets && wallets.length) {
      try {
        fetchBalance();

        await fundWallet(wallets[0].address, {
          amount: "0.00033",
          card: {
            preferredProvider: "moonpay",
          },
        });
      } catch (error) {
        console.error("Funding error:", error);
      }
    }
  }, [wallets, fundWallet]);

  const validateAddress = (address: string): boolean => {
    // Check if it's a valid Ethereum address format
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

    if (!wallets || !wallets[0]) {
      setWithdrawError("No wallet found.");
      return;
    }
    setWithdrawLoading(true);
    try {
      // Get ethers provider and signer from the embedded wallet
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL!
      );

      // Create a custom signer that uses the Privy wallet with Viem
      const signer = new ethers.JsonRpcSigner(provider, wallets[0].address);
      // Send transaction
      const tx = await signer.sendTransaction({
        to: withdrawAddress,
        value: ethers.parseEther(withdrawAmount),
      });
      await tx.wait();
      setWithdrawSuccess("Transaction sent!");
      setWithdrawAddress("");
      setWithdrawAmount("");
      fetchBalance();
    } catch (err: any) {
      setWithdrawError("Failed to send transaction.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!wallets || !wallets[0]) return;

    setIsLoadingBalance(true);
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL!
      );
      const balanceWei = await provider.getBalance(wallets[0].address);
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
    if (showWalletModal && wallets && wallets[0]) {
      fetchBalance();
    }
  }, [showWalletModal, wallets]);

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
          {ready && authenticated && wallets && wallets.length ? (
            <button
              className="py-1 px-4 text-[16px] text-[#000] border border-[#000] rounded-[20000px] font-normal flex items-center gap-2"
              style={{ boxShadow: "0px 4px 12px 0px rgba(249, 77, 39, 0.24)" }}
              onClick={() => setShowWalletModal(true)}
            >
              {wallets[0].address.slice(0, 4)}...{wallets[0].address.slice(-4)}
            </button>
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

      {/* Wallet Management Modal */}
      <Modal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)}>
        <div className="bg-white rounded-[16px] p-6 w-[400px] max-w-[90vw]">
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

          {wallets && wallets[0] && (
            <div className="space-y-4">
              {/* Wallet Address */}
              <div className="flex flex-col items-center justify-center gap-[2px]">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[18px] leading-[24px] text-[#000] font-extrabold">
                    {wallets[0].address.slice(0, 4)}...
                    {wallets[0].address.slice(-4)}
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
          )}
        </div>
      </Modal>
    </>
  );
};

export default AppHeader;
