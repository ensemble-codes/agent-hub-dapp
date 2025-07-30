"use client";

import { AppHeader } from "@/components";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const Register = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { sendOTP, verifyOTP, signOut, loading, authLoading, error, user } =
    useAuth();
  const { push } = useRouter();

  const handleSendOTP = async () => {
    if (!email) return;

    const result = await sendOTP(email);
    if (result.success) {
      setShowOtpInput(true);
      // Start 5-minute countdown for resend
      setResendDisabled(true);
      setResendCountdown(300); // 5 minutes = 300 seconds
    }
  };

  // Countdown effect for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleVerifyOTP = async () => {
    if (!email || !otp) return;

    const result = await verifyOTP(email, otp);
    if (result.success) {
      push("/");
    }
  };

  return (
    <>
      <div className="grow w-full ">
        <AppHeader />
        {authLoading ? (
          <div className="flex items-center justify-center h-[calc(100dvh-200px)]">
            <div className="text-center flex items-center gap-3">
              <img
                src="/assets/ensemble-highlighted-icon.svg"
                alt="loading"
                className="w-5 h-5 animate-spin-slow ease-in-out"
              />
              <p className="text-lg font-[Montserrat] text-primary">
                Loading authentication status...
              </p>
            </div>
          </div>
        ) : user ? (
          <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
            <div className="max-w-[570px] mx-auto flex flex-col items-center justify-center h-full">
              <div className="text-center mb-8">
                <h1 className="text-[32px] font-[Montserrat] font-bold leading-[120%] mb-4 bg-gradient-to-r from-[#F94D27] to-[#FF886D] bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-[18px] font-[Montserrat] font-medium text-[#121212] mb-4">
                  You are logged in as:{" "}
                  <span className="text-primary">{user.email}</span>
                </p>
                <button
                  onClick={signOut}
                  disabled={loading}
                  className="py-2 px-6 bg-red-500 text-white rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed font-[Montserrat] font-semibold"
                >
                  {loading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
            <img
              src={"/assets/orchestrator-pattern-bg.svg"}
              alt="pattern"
              className="absolute bottom-0 left-0 w-full opacity-60 lg:block hidden z-0"
            />
            <div className="flex items-center lg:justify-between justify-center mb-14">
              <img
                src={"/assets/register-user-pattern.svg"}
                alt="register"
                className="hidden lg:block"
              />
              <div className="max-w-[570px] flex flex-col items-center justify-center">
                <p className="text-[32px] font-[Montserrat] font-bold leading-[120%] mb-4 bg-gradient-to-r from-[#F94D27] to-[#FF886D] bg-clip-text text-transparent">
                  Welcome to Agent Hub
                </p>
                <p className="text-[16px] font-[Montserrat] font-normal leading-[100%] text-[#121212] text-center">
                  We're in Beta and handing out early access to a select few
                  users
                  <br />
                  If you're an{" "}
                  <span className="text-primary">
                    agent builder or an aspiring user
                  </span>
                  , feel free to request access
                </p>
              </div>
              <img
                src={"/assets/register-user-pattern.svg"}
                alt="register"
                className="scale-x-[-1] hidden lg:block"
              />
            </div>
            <div className="max-w-[340px] mx-auto z-[1] relative">
              <div className="relative w-full h-[63px]">
                <img
                  src={"/assets/register-user-widget.svg"}
                  alt="user"
                  className="w-full absolute"
                />
                <p className="font-[Montserrat] font-bold text-[20px] text-[#121212] absolute left-4 bottom-2">
                  {showOtpInput
                    ? "Enter OTP to verify"
                    : "Enter email to verify"}
                </p>
              </div>
              <div className="w-[340px] border border-[#AEAEAE] bg-white rounded-b-[16px] pb-4 px-6 pt-8">
                {!showOtpInput ? (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-2 rounded border mb-3 border-[#121212] outline-none focus:outline-none placeholder:text-[#8F95B2] text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[120%] w-full"
                      placeholder="Enter email"
                    />
                    <p className="text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[auto]">
                      Please provide your email to verify if you're on the list!
                    </p>
                    <hr className="my-4 border-[0.5px] border-[#AEAEAE]" />
                    <button
                      onClick={handleSendOTP}
                      disabled={loading || !email}
                      className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-primary rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img
                        src={"/assets/inverted-check-icon.svg"}
                        alt="check"
                        className="w-6 h-6"
                      />
                      <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                        {loading ? "Sending OTP..." : "Verify"}
                      </p>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-3 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          className="w-12 h-12 text-center rounded border border-[#121212] outline-none focus:outline-none text-[20px] font-[Montserrat] font-medium text-[#121212] focus:border-primary"
                          value={otp[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 1) {
                              const newOtp = otp.split("");
                              newOtp[index] = value;
                              setOtp(newOtp.join(""));

                              // Auto-focus next input
                              if (value && index < 5) {
                                const nextInput = (
                                  e.target as HTMLInputElement
                                ).parentElement?.nextElementSibling?.querySelector(
                                  "input"
                                ) as HTMLInputElement;
                                if (nextInput) nextInput.focus();
                              }
                            }
                          }}
                          onPaste={(e) => {
                            // Only handle paste on the first input
                            if (index === 0) {
                              e.preventDefault();
                              const pastedData =
                                e.clipboardData.getData("text");
                              const cleanData = pastedData
                                .replace(/\D/g, "")
                                .slice(0, 6); // Remove non-digits and limit to 6

                              if (cleanData.length === 6) {
                                setOtp(cleanData);
                                // Focus the last input
                                const inputs =
                                  document.querySelectorAll(
                                    'input[type="text"]'
                                  );
                                if (inputs[5]) {
                                  (inputs[5] as HTMLInputElement).focus();
                                }
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace
                            if (e.key === "Backspace") {
                              if (!otp[index] && index > 0) {
                                // If current box is empty and we're not on the first box, go to previous
                                const newOtp = otp.split("");
                                newOtp[index - 1] = "";
                                setOtp(newOtp.join(""));
                                // Focus previous input
                                const inputs =
                                  document.querySelectorAll(
                                    'input[type="text"]'
                                  );
                                if (inputs[index - 1]) {
                                  (
                                    inputs[index - 1] as HTMLInputElement
                                  ).focus();
                                }
                              } else if (otp[index]) {
                                // If current box has value, clear it
                                const newOtp = otp.split("");
                                newOtp[index] = "";
                                setOtp(newOtp.join(""));
                              }
                            }
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[auto] text-center">
                      Please enter the invite code sent to your email.
                    </p>
                    <hr className="my-4 border-[0.5px] border-[#AEAEAE]" />
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-primary rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    >
                      <img
                        src={"/assets/inverted-check-icon.svg"}
                        alt="check"
                        className="w-6 h-6"
                      />
                      <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                        {loading ? "Verifying..." : "Verify OTP"}
                      </p>
                    </button>
                                      <div className="w-full text-center text-[14px] text-[#8F95B2] font-[Montserrat] font-normal">
                    Didn't receive the code?{" "}
                    <button
                      onClick={handleSendOTP}
                      disabled={loading || resendDisabled}
                      className="text-primary hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {resendDisabled 
                        ? `Resend in ${Math.floor(resendCountdown / 60)}:${(resendCountdown % 60).toString().padStart(2, '0')}`
                        : "Resend"
                      }
                    </button>
                  </div>
                  </>
                )}
                {error && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Register;
