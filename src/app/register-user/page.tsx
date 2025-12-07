"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { getEnsembleAuthService } from "@/lib/auth/ensemble-auth";
import { getTokenManager } from "@/lib/auth/token-manager";
import { AppContext } from "@/context/app";
import { SET_USER } from "@/context/app/actions";
import Link from "next/link";
import { logBusinessEvent } from '../../utils/logging';

const Register = () => {
  const [state, dispatch] = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [userNotOnList, setUserNotOnList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { push } = useRouter();
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Get Ensemble auth services
  const ensembleAuth = getEnsembleAuthService();
  const tokenManager = getTokenManager();

  // Redirect logged-in users to home page
  useEffect(() => {
    if (state.user && !state.authLoading) {
      console.log('[Register] User already logged in, redirecting to home...');
      push('/');
    }
  }, [state.user, state.authLoading, push]);

  const handlePasteFromClipboard = async () => {
    setPasteError(null);
    setPasteSuccess(false);

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        setPasteError("Clipboard not supported");
        return;
      }

      // Read from clipboard
      const text = await navigator.clipboard.readText();
      // Remove whitespace and special characters, keep alphanumeric only
      const cleanData = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);

      if (cleanData.length === 6) {
        setOtp(cleanData);
        setPasteSuccess(true);

        // Focus the last input
        const lastInput = otpRefs.current[5];
        if (lastInput) {
          lastInput.focus();
        }

        // Hide success message after 2 seconds
        setTimeout(() => {
          setPasteSuccess(false);
        }, 2000);
      } else {
        setPasteError("Invalid code format. Please paste a 6-character code.");
        setTimeout(() => {
          setPasteError(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      setPasteError("Failed to read clipboard. Please paste manually.");
      setTimeout(() => {
        setPasteError(null);
      }, 3000);
    }
  };

  const handleSendOTP = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    setPasteSuccess(false);
    setPasteError(null);

    try {
      // Use Ensemble backend auth endpoint
      // Backend handles user existence check and sends OTP
      await ensembleAuth.requestAccessCode(email);

      setShowOtpInput(true);
      setShowAccessCodeInput(false);
      setUserNotOnList(false);

      // Start 5-minute countdown for resend
      setResendDisabled(true);
      setResendCountdown(300); // 5 minutes = 300 seconds

      console.log('[Register] Access code sent to:', email);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAccessCode = async () => {
    if (!email || !accessCode) return;
    setIsLoading(true);
    setError(null);

    try {
      // Redeem the access code
      const redeemResponse = await fetch(`/api/access-codes/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: accessCode.toUpperCase(),
          email: email,
        }),
      });

      if (!redeemResponse.ok) {
        const errorData = await redeemResponse.json();
        throw new Error(errorData.error || "Failed to redeem access code");
      }

      const redeemData = await redeemResponse.json();

      if (!redeemData.success) {
        throw new Error("Failed to redeem access code");
      }

      await handleSendOTP();
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify access code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialVerify = () => {
    handleSendOTP();
  };

  const handleResendOTP = () => {
    handleSendOTP();
  };

  const handleRequestAccess = async () => {
    if (!email) return;

    try {
      // Quietly submit access request without showing loading state
      const response = await fetch(`/api/request-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Show brief success message
        setError(null);
        // You could add a temporary success state here if needed
        console.log("Access request submitted successfully");
      }
    } catch (error) {
      // Silently handle errors - don't show to user
      console.error("Failed to submit access request:", error);
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
    setError(null);

    try {
      // Use Ensemble backend auth endpoint (which calls Supabase internally)
      const result = await ensembleAuth.verifyAccessCode(email, otp);

      console.log('[Register] ✅ Backend response received');
      console.log('[Register] - Has session:', !!result.session);
      console.log('[Register] - Has user:', !!result.user);
      console.log('[Register] - Session keys:', result.session ? Object.keys(result.session) : 'none');
      console.log('[Register] - User keys:', result.user ? Object.keys(result.user) : 'none');

      // Validate backend response
      if (!result.session || !result.session.access_token || !result.session.refresh_token) {
        console.error('[Register] ❌ Invalid session data from backend:', result.session);
        throw new Error('Invalid session data received from backend - missing tokens');
      }

      if (!result.user || !result.user.id || !result.user.email) {
        console.error('[Register] ❌ Invalid user data from backend:', result.user);
        throw new Error('Invalid user data received from backend - missing id or email');
      }

      console.log('[Register] ✅ Backend response validated, storing credentials...');

      // Store backend-issued tokens
      tokenManager.storeTokens({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_in: result.session.expires_in,
      });

      // Store user data
      tokenManager.storeUser({
        id: result.user.id,
        email: result.user.email,
        user_metadata: result.user.user_metadata,
      });

      // Update app state
      dispatch({
        type: SET_USER,
        payload: result.user,
      });

      console.log('[Register] Login successful:', result.message);
      logBusinessEvent('user_login', { email, method: 'otp' });
      push("/");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!state.user) return;
    setSigningOut(true);
    setError(null);

    try {
      // Logout via Ensemble backend
      const accessToken = tokenManager.getAccessToken();
      await ensembleAuth.logout(accessToken || undefined);

      // Clear tokens
      tokenManager.clear();

      // Update app state
      dispatch({ type: SET_USER, payload: null });

      console.log('[Register] Sign out successful');
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during sign out.";
      setError(errorMessage);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
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
      ) : (
        <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
          <div className="flex items-stretch h-full">
            <img
              className="w-[35%] h-full object-cover hidden lg:block opacity-75"
              src={"/assets/login-page-portrait.png"}
              alt="portrait"
            />
            <div className="grow flex-1 relative flex flex-col items-center justify-center">
              <img
                src={"/assets/register-user-pattern.svg"}
                alt="register"
                className="scale-x-[-1] hidden lg:block absolute right-0 top-0 z-[0]"
              />
              <div className="flex items-center lg:justify-between justify-center mb-14 z-[1]">
                <div className="max-w-[570px] flex flex-col items-center justify-center">
                  <p className="text-[32px] font-[Montserrat] font-bold leading-[120%] mb-4 bg-gradient-to-r from-[#F94D27] to-[#FF886D] bg-clip-text text-transparent">
                    Welcome to Agent Hub
                  </p>
                  <p className="text-[16px] font-[Montserrat] font-normal leading-[100%] text-[#121212] text-center">
                    We're in Beta and handing out early access to a select users
                  </p>
                </div>
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
                      : showAccessCodeInput
                      ? "Enter access code"
                      : "Enter email"}
                  </p>
                </div>
                <div className="w-[340px] border border-[#AEAEAE] bg-white rounded-b-[16px] pb-4 px-6 pt-8">
                  {!showOtpInput && !showAccessCodeInput ? (
                    <>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && email && !isLoading) {
                            handleInitialVerify();
                          }
                        }}
                        className="px-4 py-2 rounded border mb-3 border-[#121212] outline-none focus:outline-none placeholder:text-[#8F95B2] text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[120%] w-full"
                        placeholder="Enter email"
                      />
                      <hr className="my-4 border-[0.5px] border-[#AEAEAE]" />
                      <button
                        onClick={handleInitialVerify}
                        disabled={isLoading || !email}
                        className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-primary rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img
                          src={"/assets/inverted-check-icon.svg"}
                          alt="check"
                          className="w-6 h-6"
                        />
                        <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                          {isLoading ? "Checking..." : "Login"}
                        </p>
                      </button>
                    </>
                  ) : showAccessCodeInput ? (
                    <>
                      <input
                        type="text"
                        value={accessCode}
                        onChange={(e) =>
                          setAccessCode(e.target.value.toUpperCase())
                        }
                        className="px-4 py-2 rounded border mb-3 border-[#121212] outline-none focus:outline-none placeholder:text-[#8F95B2] text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[120%] w-full text-center tracking-widest"
                        placeholder="Enter access code"
                        maxLength={6}
                      />
                      <p className="text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[auto] text-center">
                        You're not on the list yet. Please enter an access code
                        to continue.
                      </p>
                      <hr className="my-4 border-[0.5px] border-[#AEAEAE]" />
                      <button
                        onClick={handleVerifyAccessCode}
                        disabled={
                          isLoading || !accessCode || accessCode.length !== 6
                        }
                        className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-primary rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                      >
                        <img
                          src={"/assets/stars-icon.svg"}
                          alt="check"
                          className="w-6 h-6"
                        />
                        <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                          {isLoading ? "Verifying..." : "Access Beta"}
                        </p>
                      </button>
                      <Link
                        href="https://form.typeform.com/to/cYWjmOdd?utm_source=Ensemble+Codes&utm_campaign=6ba7fea7af-EMAIL_CAMPAIGN_2025_08_16_08_27&utm_medium=email&utm_term=0_0004be5780-6ba7fea7af-260251#ensemble=xxxxx&email=xxxxx"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleRequestAccess}
                      >
                        <button className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-white text-[#121212] border border-[#121212] rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed mb-3">
                          <img
                            src={"/assets/bolt-dark-icon.svg"}
                            alt="bolt"
                            className="w-6 h-6"
                          />
                          <p className="font-[Montserrat] font-semibold text-[16px] leading-[120%] text-[#121212]">
                            Request Access
                          </p>
                        </button>
                      </Link>
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
                              const value = e.target.value.toUpperCase();
                              // Only allow alphanumeric characters
                              if (value.length <= 1 && /^[A-Z0-9]*$/.test(value)) {
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
                                // Remove non-alphanumeric characters and limit to 6
                                const cleanData = pastedData
                                  .replace(/[^a-zA-Z0-9]/g, "")
                                  .toUpperCase()
                                  .slice(0, 6);

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
                              // Handle Enter key
                              if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                                handleVerifyOTP();
                                return;
                              }

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

                      {/* Paste Button */}
                      <button
                        onClick={handlePasteFromClipboard}
                        type="button"
                        className="w-full py-2 mb-3 flex items-center justify-center gap-2 text-[14px] text-primary font-[Montserrat] font-medium hover:bg-primary/5 rounded-[8px] transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Paste Code from Clipboard
                      </button>

                      {/* Success/Error Feedback */}
                      {pasteSuccess && (
                        <div className="mb-3 flex items-center justify-center gap-2 text-green-600 text-[14px] font-[Montserrat] font-medium animate-fade-in">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Code pasted successfully!
                        </div>
                      )}

                      {pasteError && (
                        <div className="mb-3 flex items-center justify-center gap-2 text-red-600 text-[14px] font-[Montserrat] font-medium animate-fade-in">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {pasteError}
                        </div>
                      )}

                      <p className="text-[16px] text-[#121212] font-[Montserrat] font-normal leading-[auto] text-center mb-3">
                        Please enter the invite code sent to your email.
                      </p>
                      <hr className="my-4 border-[0.5px] border-[#AEAEAE]" />
                      {grantingAccess ? (
                        <>
                          <button className="py-2 px-4 flex items-center justify-center gap-2 w-full bg-[#07AD44] rounded-[20000px] disabled:opacity-50 disabled:cursor-not-allowed mb-3">
                            <img
                              src={"/assets/inverted-check-icon.svg"}
                              alt="check"
                              className="w-6 h-6"
                            />
                            <p className="text-white font-[Montserrat] font-semibold text-[16px] leading-[120%]">
                              Granting access...
                            </p>
                          </button>
                        </>
                      ) : (
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
                      )}
                      <div className="w-full text-center text-[14px] text-[#8F95B2] font-[Montserrat] font-normal">
                        Didn't receive the code?{" "}
                        <button
                          onClick={handleResendOTP}
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
              <div className="absolute bottom-4 left-[50%] translate-x-[-50%] w-full flex flex-col items-center justify-center z-[0]">
                <img
                  src={"/assets/ensemble-black-icon.svg"}
                  alt="ensemble"
                  className="lg:w-8 lg:h-8 w-6 h-6"
                />
                <p className="text-[14px] font-[Montserrat] font-normal leading-[120%] text-[#121212]">
                  Powered by Ensemble
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
