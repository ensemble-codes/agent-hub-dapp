"use client";

import { AppHeader } from "@/components";
import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AppContext } from "@/context/app";
import { SET_USER } from "@/context/app/actions";

const Register = () => {
  const [state, dispatch] = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { push } = useRouter();

  const handleSendOTP = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const result = await supabase.auth.signInWithOtp({
        email,
      });
      if (result.error) {
        throw result.error;
      }
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });
      if (!response.ok) {
        throw "Failed to register user";
      }
      const data = await response.json();
      if (!data.success) throw "Failed to register user";
      setShowOtpInput(true);
      // Start 5-minute countdown for resend
      setResendDisabled(true);
      setResendCountdown(300); // 5 minutes = 300 seconds
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown effect for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleVerifyOTP = async () => {
    if (!email || !otp) return;
    setIsLoading(true);
    try {
      const result = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (result.error) {
        throw error;
      }
      const response = await fetch(`/api/auth/verify-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });
      if (!response.ok) {
        throw "Failed to register user";
      }
      const data = await response.json();
      if (!data.success) throw "Failed to register user";
      dispatch({
        type: SET_USER,
        payload: data.user
      });
      push("/");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!state.user) return;
    setIsLoading(true);
    try {
      const result = await supabase.auth.signOut();
      if (result.error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during sign out.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grow w-full ">
        <AppHeader />
        {state.authLoading ? (
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
        ) : state.user ? (
          <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
            <div className="max-w-[570px] mx-auto flex flex-col items-center justify-center h-full">
              <div className="text-center mb-8">
                <h1 className="text-[32px] font-[Montserrat] font-bold leading-[120%] mb-4 bg-gradient-to-r from-[#F94D27] to-[#FF886D] bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-[18px] font-[Montserrat] font-medium text-[#121212] mb-4">
                  You are logged in as:{" "}
                  <span className="text-primary">{state.user.email}</span>
                </p>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="py-2 px-6 bg-red-500 text-white rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed font-[Montserrat] font-semibold"
                >
                  {isLoading ? "Signing out..." : "Sign Out"}
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
                      disabled={isLoading || !email}
                      className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-primary rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img
                        src={"/assets/inverted-check-icon.svg"}
                        alt="check"
                        className="w-6 h-6"
                      />
                      <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                        {isLoading ? "Sending OTP..." : "Verify"}
                      </p>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-3 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
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
                                const nextInput = otpRefs.current[index + 1];
                                if (nextInput) {
                                  nextInput.focus();
                                }
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
                                const lastInput = otpRefs.current[5];
                                if (lastInput) {
                                  lastInput.focus();
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
                                const prevInput = otpRefs.current[index - 1];
                                if (prevInput) {
                                  prevInput.focus();
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
                      disabled={isLoading || otp.length !== 6}
                      className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-primary rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    >
                      <img
                        src={"/assets/inverted-check-icon.svg"}
                        alt="check"
                        className="w-6 h-6"
                      />
                      <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </p>
                    </button>
                    <div className="w-full text-center text-[14px] text-[#8F95B2] font-[Montserrat] font-normal">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleSendOTP}
                        disabled={isLoading || resendDisabled}
                        className="text-primary hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {resendDisabled
                          ? `Resend in ${Math.floor(resendCountdown / 60)}:${(
                              resendCountdown % 60
                            )
                              .toString()
                              .padStart(2, "0")}`
                          : "Resend"}
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
