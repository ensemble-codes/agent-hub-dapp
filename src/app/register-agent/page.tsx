"use client";
import { AppHeader, SideMenu } from "@/components";
import axios from "axios";
import { useCallback, useMemo, useState, useEffect, useContext } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { sendGAEvent } from "@next/third-parties/google";
import { useSdk } from "@/sdk-config";

import Loader from "@/components/loader";
import { getAddress, parseEther } from "ethers";
import { useRouter } from "next/navigation";
import { logAgentRegistration, logError } from "@/utils/sentry-logging";
import { AgentCommunicationType } from "@ensemble-ai/sdk/dist/src/types";
import Link from "next/link";
import { AppContext } from "@/context/app";

const services = [
  {
    title: "DeFi",
    icon: "/assets/active-service-icon.svg",
    selected_icon: "/assets/active-service-white-icon.svg",
  },
  {
    title: "Social",
    icon: "/assets/social-service-icon.svg",
    selected_icon: "/assets/social-service-selected-icon.svg",
  },
  {
    title: "Security",
    icon: "/assets/security-service-icon.svg",
    selected_icon: "/assets/security-service-selected-icon.svg",
  },
  {
    title: "Research",
    icon: "/assets/research-service-icon.svg",
    selected_icon: "/assets/research-service-selected-icon.svg",
  },
];

const SUB_SERVICES_LIST = {
  DeFi: [
    {
      name: "Swap",
      icon: "/assets/swap-icon.svg",
    },
    {
      name: "Bridge",
      icon: "/assets/bridge-icon.svg",
    },
    {
      name: "Provide LP",
      icon: "/assets/provide-lp-icon.svg",
    },
  ],
  Social: [
    {
      name: "Bull-Post",
      icon: "/assets/bull-post-icon.svg",
    },
    {
      name: "Reply",
      icon: "/assets/reply-icon.svg",
    },
    {
      name: "Campaign",
      icon: "/assets/campaign-icon.svg",
    },
    {
      name: "Bless Me",
      icon: "/assets/vibes-icon.svg",
    },
  ],
  Security: [
    {
      name: "Smart Contract Audit",
      icon: "/assets/smart-contract-audit-icon.svg",
    },
  ],
  Research: [
    {
      name: "Markets",
      icon: "/assets/markets-icon.svg",
    },
    {
      name: "Trends",
      icon: "/assets/trends-icon.svg",
    },
    {
      name: "AI Agents LP",
      icon: "/assets/ai-agents-icon.svg",
    },
    {
      name: "Pet Symptom Analyzer",
      icon: "/assets/pet-gray-icon.svg",
    },
  ],
};

const Page = () => {
  const [state] = useContext(AppContext);
  const { user, login } = usePrivy();
  const address = user?.wallet?.address;

  const sdk = useSdk();
  const { push } = useRouter();

  const [detailsStep, setDetailsStep] = useState<
    "identity" | "attributes" | "communication" | "links"
  >("identity");
  const [agentName, setAgentName] = useState("");
  const [agentPfp, setAgentPfp] = useState<File | null>(null);
  const [agentDescription, setAgentDescription] = useState("");
  const [agentXProfile, setAgentXProfile] = useState("");
  const [agentWebsite, setAgentWebsite] = useState("");
  const [agentAddress, setAgentAddress] = useState("");
  const [agentGitHub, setAgentGitHub] = useState("");
  const [selectedAgentService, setSelectedAgentService] = useState<
    "DeFi" | "Social" | "Security" | "Research"
  >("DeFi");
  const [selectedAgentSubServices, setSelectedAgentSubServices] = useState<
    string[]
  >([
    SUB_SERVICES_LIST["DeFi"][0].name, // Initialize with "Swap"
  ]);
  const [selectedCommunicationProtocol, setSelectedCommunicationProtocol] =
    useState<string>("xmtp");
  const [websocketUrl, setWebsocketUrl] = useState<string>("");
  const [communicationParams, setCommunicationParams] = useState<string>("");
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerFailure, setRegisterFailure] = useState(false);

  // Add validation states
  const [isValidXProfile, setIsValidXProfile] = useState(false);
  const [isValidGitHub, setIsValidGitHub] = useState(false);
  const [isValidWebsite, setIsValidWebsite] = useState(false);

  // Add custom capabilities
  const [customCapabilities, setCustomCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState<string>("");
  const [showAddCapability, setShowAddCapability] = useState<boolean>(false);

  // Add instructions
  const [agentGreeting, setAgentGreeting] = useState("");
  const [howToUseDefault, setHowToUseDefault] = useState("");
  const [howToUseInstructions, setHowToUseInstructions] = useState<string[]>(
    []
  );
  const [showHowToUseInput, setShowHowToUseInput] = useState(false);
  const [howToUseInput, setHowToUseInput] = useState("");
  const [starterPromptDefault, setStarterPromptDefault] = useState("");
  const [starterPromptsInstructions, setStarterPromptsInstructions] = useState<
    string[]
  >([]);
  const [showStarterPromptInput, setShowStarterPromptInput] = useState(false);
  const [starterPromptInput, setStarterPromptInput] = useState("");

  // Add new states for agentTelegram and isValidTelegram
  const [agentTelegram, setAgentTelegram] = useState("");
  const [isValidTelegram, setIsValidTelegram] = useState(false);
  const [agentDexTools, setAgentDexTools] = useState("");
  const [isValidDexTools, setIsValidDexTools] = useState(false);

  // Validation functions
  const validateXProfile = (url: string) => {
    // Check if the URL contains twitter.com or x.com
    return url.includes("twitter.com") || url.includes("x.com");
  };

  const validateGitHub = (url: string) => {
    // Check if the URL contains github.com
    return url.includes("github.com");
  };

  const validateWebsite = (url: string) => {
    // If URL doesn't start with a protocol, prepend https://
    let urlToTest = url;
    if (
      url &&
      url.match(/^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+[a-z]{2,6}$/)
    ) {
      urlToTest = "https://" + url;
    }

    // Basic URL validation
    try {
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
  };

  const validateTelegram = (input: string) => {
    // Accepts https://t.me
    return /^https?:\/\/(t\.me|telegram\.me)/i.test(input);
  };

  const validateDexTools = (url: string) => {
    // Accepts https://www.dextools.io...
    return /^https?:\/\/?dextools\.io/i.test(url);
  };

  const handleUploadToPinata = useCallback(async (file: File) => {
    try {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pinataOptions", '{"cidVersion": 1}');
      formData.append("pinataMetadata", `{"name": "${file.name}"}`);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT_KEY}`,
        },
      });

      return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.log("Error uploading to pinata", error);
      return "";
    }
  }, []);

  const registerAgent = useCallback(async () => {
    setLoadingRegister(true);
    const allAttributes = [...selectedAgentSubServices, ...customCapabilities];

    try {
      let imgUri: string =
        "https://www.ensemble.codes/assets/ensemble-icon.svg";
      if (agentPfp) imgUri = await handleUploadToPinata(agentPfp);

      const finalInstructions = howToUseDefault.trim()
        ? [howToUseDefault.trim(), ...howToUseInstructions]
        : howToUseInstructions;

      const finalPrompts = starterPromptDefault.trim()
        ? [starterPromptDefault.trim(), ...starterPromptsInstructions]
        : starterPromptsInstructions;

      const boolean = await sdk?.registerAgent(agentAddress, {
        name: agentName,
        description: agentDescription,
        imageURI: imgUri,
        socials: {
          github: agentGitHub,
          twitter: agentXProfile,
          telegram: agentTelegram,
          website: agentWebsite,
          dexscreener: agentDexTools,
        },
        openingGreeting: agentGreeting,
        communicationType:
          selectedCommunicationProtocol as AgentCommunicationType,
        instructions: finalInstructions,
        prompts: finalPrompts,
        attributes: allAttributes,
        agentCategory: selectedAgentService,
        communicationParams: communicationParams,
        ...(selectedCommunicationProtocol === "websocket"
          ? { communicationURL: websocketUrl }
          : {}),
      });

      sendGAEvent("register_agent", {
        agentName,
        agentAddress,
        service: allAttributes.join(", "),
      });

      // Log successful registration to Sentry
      logAgentRegistration({
        name: agentName,
        service: allAttributes.join(", "),
        address: agentAddress,
      });

      if (boolean) {
        setRegisterSuccess(true);
      } else {
        setRegisterFailure(true);
      }
    } catch (error) {
      console.log(error);
      // Log error to Sentry
      logError(error as Error, {
        component: "RegisterAgent",
        action: "register_agent",
        agent_name: agentName,
        service: allAttributes.join(", "),
      });
      setRegisterFailure(true);
    } finally {
      setLoadingRegister(false);
    }
  }, [
    agentName,
    agentPfp,
    agentDescription,
    agentXProfile,
    agentWebsite,
    agentGitHub,
    agentTelegram,
    agentDexTools,
    howToUseDefault,
    starterPromptDefault,
    howToUseInstructions,
    starterPromptsInstructions,
    selectedAgentService,
    selectedAgentSubServices,
    customCapabilities,
    agentAddress,
    address,
    websocketUrl,
    selectedCommunicationProtocol,
    communicationParams,
  ]);

  const getProgressWidth = useCallback(() => {
    switch (detailsStep) {
      case "identity":
        return "25%";
      case "attributes":
        return "50%";
      case "communication":
        return "75%";
      case "links":
        return "100%";
      default:
        return "25%";
    }
  }, [detailsStep]);

  const canProceedServicesStep =
    selectedAgentSubServices.length + customCapabilities.length > 0;

  const canProceedToNextStep = useMemo(() => {
    if (detailsStep === "identity") {
      return (
        agentName.trim() &&
        agentDescription.trim() &&
        agentAddress.trim() &&
        address?.trim()
      );
    }
    if (detailsStep === "attributes") {
      return canProceedServicesStep;
    }
    if (detailsStep === "communication") {
      return (
        selectedCommunicationProtocol &&
        (selectedCommunicationProtocol !== "websocket" ||
          websocketUrl.trim().length > 0)
      );
    }
    if (detailsStep === "links") {
      return (
        (!agentWebsite || isValidWebsite) &&
        (!agentGitHub || isValidGitHub) &&
        (!agentXProfile || isValidXProfile) &&
        (!agentTelegram || isValidTelegram) &&
        (!agentDexTools || isValidDexTools)
      );
    }
    return true;
  }, [
    detailsStep,
    agentName,
    agentDescription,
    agentXProfile,
    isValidXProfile,
    agentWebsite,
    isValidWebsite,
    agentAddress,
    canProceedServicesStep,
    selectedCommunicationProtocol,
    websocketUrl,
    agentGitHub,
    isValidGitHub,
    agentTelegram,
    isValidTelegram,
    agentDexTools,
    isValidDexTools,
    address,
  ]);

  const canRegisterAgent = useMemo(() => {
    // Check all required fields are filled
    const hasRequiredFields =
      agentName.trim() &&
      agentDescription.trim() &&
      agentAddress.trim() &&
      selectedAgentSubServices.length + customCapabilities.length > 0 &&
      selectedCommunicationProtocol &&
      (selectedCommunicationProtocol !== "websocket" ||
        websocketUrl.trim().length > 0);

    // Check all filled links are valid
    const hasValidLinks =
      (!agentWebsite || isValidWebsite) &&
      (!agentGitHub || isValidGitHub) &&
      (!agentXProfile || isValidXProfile) &&
      (!agentTelegram || isValidTelegram) &&
      (!agentDexTools || isValidDexTools);

    return hasRequiredFields && hasValidLinks;
  }, [
    agentName,
    agentDescription,
    agentAddress,
    selectedAgentSubServices,
    customCapabilities,
    howToUseDefault,
    starterPromptDefault,
    selectedCommunicationProtocol,
    websocketUrl,
    agentWebsite,
    isValidWebsite,
    agentGitHub,
    isValidGitHub,
    agentXProfile,
    isValidXProfile,
    agentTelegram,
    isValidTelegram,
    agentDexTools,
    isValidDexTools,
  ]);

  useEffect(() => {
    if (registerFailure) {
      const timer = setTimeout(() => {
        setRegisterFailure(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [registerFailure]);

  useEffect(() => {
    // Initialize with default values when component mounts
    if (selectedAgentService && selectedAgentSubServices.length === 0) {
      setSelectedAgentSubServices([
        SUB_SERVICES_LIST[selectedAgentService][0].name,
      ]);
    }
  }, [selectedAgentService, selectedAgentSubServices]);

  return (
    <div>
      <div className="hidden lg:flex items-start gap-4">
        <SideMenu />
        <div className="grow w-full">
          <AppHeader />
          <div className="flex items-start gap-10 w-full bg-white py-6 px-4 rounded-[16px]">
            <div className="grow py-4 w-full">
              <div className="flex w-full justify-between items-center">
                <p className="text-primary font-semibold text-[20px] leading-[auto] font-[Montserrat]">
                  REGISTER AGENT
                </p>
                <div className="flex items-center gap-4">
                  {detailsStep !== "identity" ? (
                    <button
                      className="rounded-[20000px] border border-primary w-[120px] py-1 flex items-center justify-center gap-2"
                      onClick={() =>
                        setDetailsStep(
                          detailsStep === "links"
                            ? "communication"
                            : detailsStep === "communication"
                            ? "attributes"
                            : "identity"
                        )
                      }
                    >
                      <img
                        src="/assets/pixelated-arrow-primary-icon.svg"
                        alt="pixelated-arrow"
                        className="w-4 h-4 rotate-180"
                      />
                      <p className="font-medium text-primary">Back</p>
                    </button>
                  ) : null}
                  {detailsStep === "links" ? null : (
                    <button
                      className={`rounded-[20000px] border border-primary w-[120px] py-1 flex items-center justify-center gap-2${
                        !canProceedToNextStep
                          ? " opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() =>
                        setDetailsStep(
                          detailsStep === "identity"
                            ? "attributes"
                            : detailsStep === "attributes"
                            ? "communication"
                            : "links"
                        )
                      }
                      disabled={!canProceedToNextStep}
                    >
                      <p className="font-medium text-primary">Next</p>
                      <img
                        src="/assets/pixelated-arrow-primary-icon.svg"
                        alt="pixelated-arrow"
                        className="w-4 h-4"
                      />
                    </button>
                  )}
                </div>
              </div>
              <hr
                className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[90%]"
                style={{
                  borderImageSource:
                    "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                  borderImageSlice: "1",
                }}
              />
              <div className="flex flex-col gap-2 w-full">
                <div className="w-[95%] flex items-center justify-between">
                  <img
                    src={
                      detailsStep === "identity"
                        ? "/assets/identity-highlighted-icon.svg"
                        : "/assets/identity-icon.svg"
                    }
                    alt="identity"
                    className="w-10 h-10"
                  />
                  <img
                    src={
                      detailsStep === "attributes"
                        ? "/assets/services-highlighted-icon.svg"
                        : "/assets/services-icon.svg"
                    }
                    alt="attributes"
                    className="w-10 h-10"
                  />
                  <img
                    src={
                      detailsStep === "communication"
                        ? "/assets/links-highlighted-icon.svg"
                        : "/assets/links-icon.svg"
                    }
                    alt="communication"
                    className="w-10 h-10"
                  />
                  <img
                    src={
                      detailsStep === "links"
                        ? "/assets/links-highlighted-icon.svg"
                        : "/assets/links-icon.svg"
                    }
                    alt="links"
                    className="w-10 h-10"
                  />
                </div>
                <div className="w-full rounded-[2000px] h-2 bg-primary/[0.12]">
                  <div
                    className="rounded-[2000px] h-2 bg-primary transition-[width] ease-in-out duration-300"
                    style={{ width: getProgressWidth() }}
                  ></div>
                </div>
                <div className="w-[95%] flex items-center justify-between">
                  <p
                    className={`text-[14px] font-[Montserrat] ${
                      detailsStep === "identity"
                        ? "font-semibold text-primary"
                        : "font-medium text-[#8F95B2]"
                    }`}
                  >
                    Identity
                  </p>
                  <p
                    className={`text-[14px] font-[Montserrat] ${
                      detailsStep === "attributes"
                        ? "font-semibold text-primary"
                        : "font-medium text-[#8F95B2]"
                    }`}
                  >
                    Attributes
                  </p>
                  <p
                    className={`text-[14px] font-[Montserrat] ${
                      detailsStep === "communication"
                        ? "font-semibold text-primary"
                        : "font-medium text-[#8F95B2]"
                    }`}
                  >
                    Communication
                  </p>
                  <p
                    className={`text-[14px] font-[Montserrat] ${
                      detailsStep === "links"
                        ? "font-semibold text-primary"
                        : "font-medium text-[#8F95B2]"
                    }`}
                  >
                    Links
                  </p>
                </div>
              </div>
              <hr
                className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                style={{
                  borderImageSource:
                    "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                  borderImageSlice: "1",
                }}
              />
              {detailsStep === "identity" ? (
                <div className="w-full">
                  <div className="space-y-2">
                    <p className="font-medium leading-[20px] text-[#121212] font-[Montserrat]">
                      Name*
                    </p>
                    <input
                      className="w-full border-none outline-none focus:outline-none placeholder:text-primary/70 text-primary"
                      placeholder="Agent's name"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                    />
                  </div>
                  <hr
                    className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[50%]"
                    style={{
                      borderImageSource:
                        "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                      borderImageSlice: "1",
                    }}
                  />

                  {/* <div className="flex-1 max-w-[300px]">
                      <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                        PFP
                        {agentPfp ? (
                          <img
                            src="/assets/check-fill-icon.svg"
                            alt="fill"
                            className="w-5 h-5"
                          />
                        ) : null}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="agentPfp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("File size must be less than 5MB");
                              return;
                            }
                            setAgentPfp(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="agentPfp"
                        className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color cursor-pointer block"
                      >
                        {agentPfp ? agentPfp.name : "Choose pfp"}
                      </label>
                    </div> */}
                  <div className="max-w-[616px] space-y-2">
                    <p className="font-medium leading-[20px] text-[#121212] font-[Montserrat]">
                      Description*
                    </p>
                    <textarea
                      className="w-full border-none outline-none focus:outline-none placeholder:text-primary/70 text-primary resize-none"
                      placeholder="A brief overview of your agent"
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <hr
                    className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                    style={{
                      borderImageSource:
                        "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                      borderImageSlice: "1",
                    }}
                  />
                  <div className="flex items-start gap-4">
                    <div className="flex-1 w-[176px]">
                      <div className="space-y-2">
                        <p className="font-medium leading-[20px] text-[#121212 font-[Montserrat]">
                          Agent Address*
                        </p>
                        <input
                          className="w-full outline-none focus:outline-none placeholder:text-primary/70 text-primary"
                          placeholder="Receives Payments"
                          value={agentAddress}
                          onChange={(e) => {
                            setAgentAddress(e.target.value);
                          }}
                        />
                      </div>
                      <hr
                        className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                          borderImageSlice: "1",
                        }}
                      />
                    </div>
                    <div className="flex-1 w-[176px]">
                      <div className="space-y-2">
                        <p className="font-medium leading-[20px] text-[#121212] font-[Montserrat]">
                          Owner Address*
                        </p>
                        {address ? (
                          <input
                            className="w-full outline-none focus:outline-none placeholder:text-primary/70 text-primary"
                            placeholder="Receives Payments"
                            value={address ? getAddress(address) : ""}
                            disabled
                          />
                        ) : (
                          <button
                            className="w-fit space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                            onClick={() => {
                              login();
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
                        )}
                      </div>
                      {address && <hr
                        className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                          borderImageSlice: "1",
                        }}
                      />}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="font-medium leading-[20px] text-[#121212] font-[Montserrat]">
                      Photo
                    </p>
                    <div className="flex items-start gap-4">
                      <div>
                        <label htmlFor="agentPfp" className="cursor-pointer">
                          <img
                            src={
                              agentPfp
                                ? URL.createObjectURL(agentPfp)
                                : "/assets/upload-agent-image-icon.svg"
                            }
                            alt="upload-agent-image"
                            className="w-[84px] h-[84px] hover:opacity-80 transition-opacity"
                          />
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="agentPfp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("File size must be less than 5MB");
                                return;
                              }
                              setAgentPfp(file);
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="w-[84px] rounded-full h-[84px] border border-[#121212] border-dashed flex items-center justify-center">
                          <img
                            src="/assets/ensemble-icon.svg"
                            alt="ensemble"
                            className="w-[56px] h-[56px]"
                          />
                        </div>
                        <p className="text-[#8F95B2] text-[12px] font-medium text-center font-[Montserrat]">
                          Default
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : detailsStep === "attributes" ? (
                <div className="w-full">
                  <div className="flex-1">
                    <p className="font-medium leading-[21.6px] mb-2 text-[#121212] font-[Montserrat]">
                      Agent type*
                    </p>
                    <div className="flex items-center gap-2">
                      {services.map((service) => (
                        <button
                          key={service.title}
                          onClick={() => {
                            const newService = service.title as
                              | "DeFi"
                              | "Social"
                              | "Security"
                              | "Research";
                            setSelectedAgentService(newService);
                            // Set first subservice as default
                            const firstSubService =
                              SUB_SERVICES_LIST[newService][0].name;
                            setSelectedAgentSubServices([firstSubService]);
                          }}
                          className={`w-auto space-x-2 flex items-center justify-between rounded-[50px] py-1 px-[16px] ${
                            selectedAgentService === service.title
                              ? "bg-primary"
                              : "border border-[#3D3D3D66]"
                          }`}
                        >
                          <img
                            src={
                              selectedAgentService === service.title
                                ? service.selected_icon
                                : service.icon
                            }
                            alt={service.title}
                            className={`${
                              service.title === "DeFi" ? "w-3 h-3" : "w-4 h-4"
                            }`}
                          />
                          <span
                            className={`font-bold leading-[24px] ${
                              selectedAgentService === service.title
                                ? "text-white"
                                : "text-[#3d3d3d]"
                            }`}
                          >
                            {service.title}
                          </span>
                        </button>
                      ))}
                    </div>
                    <hr
                      className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="space-y-2">
                      <p className="font-medium leading-[21.6px] mb-2 text-[#121212] font-[Montserrat]">
                        Attributes*
                      </p>
                      {selectedAgentService && (
                        <div className="flex items-center gap-4 flex-wrap mb-2">
                          {SUB_SERVICES_LIST[selectedAgentService].map(
                            (service) => (
                              <div
                                key={service.name}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  id={`checkbox-${service.name}`}
                                  checked={selectedAgentSubServices.includes(
                                    service.name
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAgentSubServices((prev) =>
                                        prev.includes(service.name)
                                          ? prev
                                          : [...prev, service.name]
                                      );
                                    } else {
                                      setSelectedAgentSubServices((prev) =>
                                        prev.filter(
                                          (name) => name !== service.name
                                        )
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 text-primary bg-white rounded-[8px] outline-none border-none cursor-pointer"
                                  style={{ accentColor: "#f94d27" }}
                                />
                                <label
                                  htmlFor={`checkbox-${service.name}`}
                                  className="font-bold text-text-color text-[14px] cursor-pointer"
                                >
                                  {service.name}
                                </label>
                              </div>
                            )
                          )}
                          {customCapabilities.map((cap, idx) => (
                            <div
                              key={cap + idx}
                              className="flex items-center gap-2 border border-[#f94d27] rounded px-2 py-1"
                            >
                              <span className="text-[14px] text-[#f94d27]">
                                {cap}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCustomCapabilities(
                                    customCapabilities.filter(
                                      (_, i) => i !== idx
                                    )
                                  )
                                }
                                className="focus:outline-none"
                              >
                                <img
                                  src="/assets/cross-gray-icon.svg"
                                  alt="remove"
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          ))}
                          {!showAddCapability && (
                            <div className="w-full">
                              <button
                                type="button"
                                className="flex items-center gap-1 text-[#f94d27] font-bold text-[12px]"
                                onClick={() => setShowAddCapability(true)}
                              >
                                <span className="text-[18px] font-bold text-primary">
                                  +
                                </span>
                                Add capability
                              </button>
                            </div>
                          )}
                          {showAddCapability && (
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                className="border border-[#8F95B2] rounded-[4px] px-2 py-1 outline-none text-primary placeholder:text-[#8F95B2]"
                                placeholder="enter skill"
                                value={newCapability}
                                onChange={(e) =>
                                  setNewCapability(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    newCapability.trim()
                                  ) {
                                    setCustomCapabilities([
                                      ...customCapabilities,
                                      newCapability.trim(),
                                    ]);
                                    setNewCapability("");
                                    setShowAddCapability(false);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="bg-[#f94d27] text-white px-4 py-1 rounded font-bold hover:bg-[#d43c1a]"
                                onClick={() => {
                                  if (newCapability.trim()) {
                                    setCustomCapabilities([
                                      ...customCapabilities,
                                      newCapability.trim(),
                                    ]);
                                    setNewCapability("");
                                    setShowAddCapability(false);
                                  }
                                }}
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                className="ml-1"
                                onClick={() => {
                                  setShowAddCapability(false);
                                  setNewCapability("");
                                }}
                              >
                                <img
                                  src="/assets/cross-gray-icon.svg"
                                  alt="remove"
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <hr
                      className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    {/* <div className="space-y-2">
                      <p className="font-medium leading-[21.6px] text-[#121212]">
                        Opening greeting
                      </p>
                      <input
                        className="w-full border-none outline-none focus:outline-none placeholder:text-primary/70 text-primary"
                        placeholder='Ex: "Hello there, I am your DeFi agent, how can I help you today?"'
                        value={agentGreeting}
                        onChange={(e) => setAgentGreeting(e.target.value)}
                      />
                    </div>
                    <hr
                      className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    /> */}
                    <div className="space-y-2">
                      <p className="font-medium leading-[21.6px] text-[#121212] font-[Montserrat]">
                        Agent Use Case
                      </p>
                      <input
                        className="w-full border-none outline-none focus:outline-none placeholder:text-primary/70 text-primary"
                        placeholder='Ex: "The agent can only operate on X, and not perform actions outside of it"'
                        value={howToUseDefault}
                        onChange={(e) => setHowToUseDefault(e.target.value)}
                      />
                      {/* Instructions List */}
                      {howToUseInstructions.map((inst, idx) => (
                        <div key={idx} className="flex items-center mt-2">
                          <input
                            className="flex-1 border-none border-b border-[#8F95B2] outline-none text-primary placeholder:text-primary/70 bg-transparent text-[16px]"
                            value={inst}
                            onChange={(e) => {
                              const arr = [...howToUseInstructions];
                              arr[idx] = e.target.value;
                              setHowToUseInstructions(arr);
                            }}
                          />
                          <button
                            type="button"
                            className="ml-2"
                            onClick={() =>
                              setHowToUseInstructions(
                                howToUseInstructions.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <img
                              src="/assets/cross-gray-icon.svg"
                              alt="remove"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      ))}
                      {/* Add instruction input */}
                      {showHowToUseInput && howToUseInstructions.length < 3 && (
                        <div className="flex items-center mt-2">
                          <input
                            className="flex-1 border-none border-b border-[#8F95B2] outline-none text-primary placeholder:text-primary/70 bg-transparent text-[16px]"
                            placeholder="Add another instruction"
                            value={howToUseInput}
                            onChange={(e) => setHowToUseInput(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="ml-2 bg-[#f94d27] text-white px-2 py-1 rounded text-xs font-bold"
                            onClick={() => {
                              if (howToUseInput.trim()) {
                                setHowToUseInstructions([
                                  ...howToUseInstructions,
                                  howToUseInput.trim(),
                                ]);
                                setHowToUseInput("");
                                setShowHowToUseInput(false);
                              }
                            }}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="ml-1"
                            onClick={() => {
                              setShowHowToUseInput(false);
                              setHowToUseInput("");
                            }}
                          >
                            <img
                              src="/assets/cross-gray-icon.svg"
                              alt="remove"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      )}
                      {/* Add instructions button */}
                      {!showHowToUseInput &&
                        howToUseInstructions.length < 3 && (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[#f94d27] font-bold text-[12px] mt-2"
                            onClick={() => setShowHowToUseInput(true)}
                          >
                            <span className="text-[18px] font-bold text-primary">
                              +
                            </span>
                            Add instructions
                          </button>
                        )}
                    </div>
                    <hr
                      className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="space-y-2">
                      <p className="font-medium leading-[21.6px] text-[#121212] font-[Montserrat]">
                        Starter prompts
                      </p>
                      <input
                        className="w-full border-none outline-none focus:outline-none placeholder:text-primary/70 text-primary"
                        placeholder='Ex: "Reply to an account on Twitter"'
                        value={starterPromptDefault}
                        onChange={(e) =>
                          setStarterPromptDefault(e.target.value)
                        }
                      />
                      {/* Instructions List */}
                      {starterPromptsInstructions.map((inst, idx) => (
                        <div key={idx} className="flex items-center mt-2">
                          <input
                            className="flex-1 border-none border-b border-[#8F95B2] outline-none text-primary placeholder:text-primary/70 bg-transparent text-[16px]"
                            value={inst}
                            onChange={(e) => {
                              const arr = [...starterPromptsInstructions];
                              arr[idx] = e.target.value;
                              setStarterPromptsInstructions(arr);
                            }}
                          />
                          <button
                            type="button"
                            className="ml-2"
                            onClick={() =>
                              setStarterPromptsInstructions(
                                starterPromptsInstructions.filter(
                                  (_, i) => i !== idx
                                )
                              )
                            }
                          >
                            <img
                              src="/assets/cross-gray-icon.svg"
                              alt="remove"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      ))}
                      {/* Add instruction input */}
                      {showStarterPromptInput &&
                        starterPromptsInstructions.length < 3 && (
                          <div className="flex items-center mt-2">
                            <input
                              className="flex-1 border-none border-b border-[#8F95B2] outline-none text-primary placeholder:text-primary/70 bg-transparent text-[16px]"
                              placeholder="Add another instruction"
                              value={starterPromptInput}
                              onChange={(e) =>
                                setStarterPromptInput(e.target.value)
                              }
                              autoFocus
                            />
                            <button
                              type="button"
                              className="ml-2 bg-[#f94d27] text-white px-2 py-1 rounded text-xs font-bold"
                              onClick={() => {
                                if (starterPromptInput.trim()) {
                                  setStarterPromptsInstructions([
                                    ...starterPromptsInstructions,
                                    starterPromptInput.trim(),
                                  ]);
                                  setStarterPromptInput("");
                                  setShowStarterPromptInput(false);
                                }
                              }}
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              className="ml-1"
                              onClick={() => {
                                setShowStarterPromptInput(false);
                                setStarterPromptInput("");
                              }}
                            >
                              <img
                                src="/assets/cross-gray-icon.svg"
                                alt="remove"
                                className="w-4 h-4"
                              />
                            </button>
                          </div>
                        )}
                      {/* Add instructions button */}
                      {!showStarterPromptInput &&
                        starterPromptsInstructions.length < 3 && (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[#f94d27] font-bold text-[12px] mt-2"
                            onClick={() => setShowStarterPromptInput(true)}
                          >
                            <span className="text-[18px] font-bold text-primary">
                              +
                            </span>
                            Add instructions
                          </button>
                        )}
                    </div>
                    <hr
                      className="mt-4 mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                  </div>
                </div>
              ) : detailsStep === "communication" ? (
                <div className="w-full">
                  <div className="flex-1">
                    <p className="font-[Montserrat] text-[16px] font-medium leading-[20px]">
                      Choose the communication system you prefer for your agent.
                    </p>
                    <p className="font-[Montserrat] text-[16px] font-medium leading-[20px]">
                      Check out the{" "}
                      <Link
                        href={`https://docs.ensemble.codes/ensemble-stack/communication`}
                        className="text-primary font-bold"
                        target="_blank"
                        rel="noreferrer noopener nofollower"
                      >
                        Docs
                      </Link>{" "}
                      here to know more.
                    </p>
                    <hr
                      className="border-[0.5px] my-6 border-[#8F95B2] w-[50%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div>
                      <p className="font-medium leading-[21.6px] text-[#121212] mb-2 font-[Montserrat]">
                        Communication Protocol
                      </p>
                      <div className="flex items-center gap-10 mb-6">
                        {["XMTP", "Websocket"].map((p) => (
                          <div key={p} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`checkbox-protocol-${p.toLowerCase()}`}
                              checked={
                                selectedCommunicationProtocol ===
                                p.toLowerCase()
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCommunicationProtocol(
                                    p.toLowerCase()
                                  );
                                } else if (
                                  selectedCommunicationProtocol ===
                                  p.toLowerCase()
                                ) {
                                  setSelectedCommunicationProtocol("");
                                }
                              }}
                              className="w-4 h-4 text-primary bg-white rounded-[8px] outline-none border-none cursor-pointer"
                              style={{
                                accentColor: "#f94d27",
                              }}
                            />
                            <label
                              htmlFor={`checkbox-protocol-${p}`}
                              className="font-bold text-text-color text-[14px] cursor-pointer"
                            >
                              {p}
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedCommunicationProtocol === "websocket" && (
                        <input
                          type="url"
                          className="mb-2 w-full outline-none placeholder:text-primary/70 text-primary"
                          placeholder="Enter Websocket Url"
                          value={websocketUrl}
                          onChange={(e) => setWebsocketUrl(e.target.value)}
                        />
                      )}
                    </div>
                    <hr
                      className="mb-6 border-[0.5px] border-[#8F95B2] w-[70%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="font-medium leading-[21.6px] text-[#121212] mb-2 font-[Montserrat]">
                      Communication params (optional)
                    </p>
                    <input
                      type="url"
                      className="mb-2 w-full outline-none placeholder:text-primary/70 text-primary"
                      placeholder={'Example: {"agentId": "xyz"}'}
                      value={communicationParams}
                      onChange={(e) => setCommunicationParams(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="space-y-4">
                    <p className="font-medium leading-[21.6px] text-[#121212] font-[Montserrat]">
                      Links
                    </p>
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/register-website-icon.svg"
                        alt="website"
                        className="w-6 h-6"
                      />
                      <input
                        className={`p-0 border-none outline-none text-primary placeholder:text-primary/70 bg-[inherit] ${
                          agentWebsite && !isValidWebsite ? "text-red-500" : ""
                        }`}
                        placeholder="Website"
                        value={agentWebsite}
                        onChange={(e) => {
                          setAgentWebsite(e.target.value);
                          setIsValidWebsite(validateWebsite(e.target.value));
                        }}
                      />
                    </div>
                    {agentWebsite && !isValidWebsite && (
                      <div className="text-xs text-red-500 ml-8">
                        Invalid website URL
                      </div>
                    )}
                    <hr
                      className="border-[0.5px] border-[#8F95B2] w-[50%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/register-github-icon.svg"
                        alt="github"
                        className="w-6 h-6"
                      />
                      <input
                        className={`p-0 border-none outline-none text-primary placeholder:text-primary/70 bg-[inherit] ${
                          agentGitHub && !isValidGitHub ? "text-red-500" : ""
                        }`}
                        placeholder="GitHub"
                        value={agentGitHub}
                        onChange={(e) => {
                          setAgentGitHub(e.target.value);
                          setIsValidGitHub(validateGitHub(e.target.value));
                        }}
                      />
                    </div>
                    {agentGitHub && !isValidGitHub && (
                      <div className="text-xs text-red-500 ml-8">
                        Invalid GitHub URL
                      </div>
                    )}
                    <hr
                      className="border-[0.5px] border-[#8F95B2] w-[50%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/register-twitter-icon.svg"
                        alt="twitter"
                        className="w-6 h-6"
                      />
                      <input
                        className={`p-0 border-none outline-none text-primary placeholder:text-primary/70 bg-[inherit] ${
                          agentXProfile && !isValidXProfile
                            ? "text-red-500"
                            : ""
                        }`}
                        placeholder="Twitter"
                        value={agentXProfile}
                        onChange={(e) => {
                          setAgentXProfile(e.target.value);
                          setIsValidXProfile(validateXProfile(e.target.value));
                        }}
                      />
                    </div>
                    {agentXProfile && !isValidXProfile && (
                      <div className="text-xs text-red-500 ml-8">
                        Invalid Twitter URL
                      </div>
                    )}
                    <hr
                      className="border-[0.5px] border-[#8F95B2] w-[50%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/register-telegram-icon.svg"
                        alt="telegram"
                        className="w-6 h-6"
                      />
                      <input
                        className={`p-0 border-none outline-none text-primary placeholder:text-primary/70 bg-[inherit] ${
                          agentTelegram && !isValidTelegram
                            ? "text-red-500"
                            : ""
                        }`}
                        placeholder="Telegram"
                        value={agentTelegram}
                        onChange={(e) => {
                          setAgentTelegram(e.target.value);
                          setIsValidTelegram(validateTelegram(e.target.value));
                        }}
                      />
                    </div>
                    <hr
                      className="border-[0.5px] border-[#8F95B2] w-[50%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/register-dex-icon.svg"
                        alt="dex"
                        className="w-6 h-6"
                      />
                      <input
                        className={`p-0 border-none outline-none text-primary placeholder:text-primary/70 bg-[inherit] ${
                          agentDexTools && !isValidDexTools
                            ? "text-red-500"
                            : ""
                        }`}
                        placeholder="Dextools"
                        value={agentDexTools}
                        onChange={(e) => {
                          setAgentDexTools(e.target.value);
                          setIsValidDexTools(validateDexTools(e.target.value));
                        }}
                      />
                    </div>
                    <hr
                      className="border-[0.5px] border-[#8F95B2] w-[50%]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />

                    {registerSuccess ? (
                      <Link
                        href={`/agents/${getAddress(agentAddress)}`}
                        className="w-fit space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] cursor-pointer"
                      >
                        <span className="text-white text-[16px] font-[700] leading-[24px]">
                          Go to Profile
                        </span>
                        <img
                          src="/assets/pixelated-arrow-icon.svg"
                          alt="bolt"
                        />
                      </Link>
                    ) : (
                      <button
                        className={`w-auto space-x-2 flex items-center justify-between rounded-[50px] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] ${
                          canRegisterAgent && !loadingRegister
                            ? "bg-primary cursor-pointer"
                            : "bg-primary/70 cursor-not-allowed"
                        }`}
                        onClick={
                          !state.embeddedWallet
                            ? () => login()
                            : () => registerAgent()
                        }
                        disabled={!canRegisterAgent || loadingRegister}
                      >
                        <img src="/assets/bolt-icon.svg" alt="bolt" />
                        <span className="text-white text-[16px] font-[700] leading-[24px]">
                          Complete Registration
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-[256px] h-[auto] flex-shrink-0">
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <img
                    src="/assets/agent-preview-icon.svg"
                    alt="agent-preview"
                    className="w-full relative bottom-[-1px]"
                  />
                  <div className="border border-[#a0a0a0]">
                    {loadingRegister ? (
                      <div className="mt-2 w-[243px] h-[192px] mx-auto flex flex-col gap-4 items-center justify-center">
                        <Loader size="xl" />
                        <p className="text-text-color text-[14px] font-bold leading-[19px]">
                          Confirming tx to deploy agent...
                        </p>
                      </div>
                    ) : registerSuccess ? (
                      <div className="mt-2 relative w-[243px] h-[192px] mx-auto flex flex-col gap-4 items-center justify-center">
                        <img
                          src="/assets/register-success-confetti.gif"
                          alt="confetti"
                          className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
                        />
                        <img
                          src="/assets/register-success-check.gif"
                          alt="success"
                          className="w-12 h-12 rounded-full"
                        />
                        <p className="text-text-color text-[14px] font-bold leading-[19px] text-center">
                          Agent deployed!
                          <br />
                          welcome to the future...
                        </p>
                      </div>
                    ) : registerFailure ? (
                      <>
                        <div
                          className="mt-2 w-[243px] rounded-[8px] h-[192px] mx-auto flex flex-col gap-4 items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(239, 68, 68, 0.28) -38.54%, #FAFAFA 80.21%, #ffffff)",
                          }}
                        >
                          <img
                            src="/assets/register-failure.gif"
                            alt="failure"
                            className="w-[90px] h-[90px]"
                          />
                          <p className="text-text-color text-[14px] font-bold leading-[19px] text-center">
                            Error deploying!
                            <br />
                            please try again...
                          </p>
                        </div>
                      </>
                    ) : agentPfp ? (
                      <img
                        src={URL.createObjectURL(agentPfp)}
                        alt="Agent preview"
                        className="mt-2 rounded-[8px] w-[243px] h-[192px] object-cover mx-auto"
                      />
                    ) : (
                      <div className="mt-2 w-[243px] h-[192px] rounded-[8px] mx-auto border border-light-text-color flex items-center justify-center">
                        <img
                          src="/assets/ensemble-icon.svg"
                          alt="ensemble"
                          className="w-[120px] h-[120px]"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex w-full items-center justify-between">
                        <p className="text-light-text-color text-[14px] font-medium leading-[18px]">
                          NAME
                        </p>
                        <p className="text-end w-1/2 ellipsis whitespace-nowrap overflow-hidden text-[14px] font-bold leading-[18px] text-text-color">
                          {agentName}
                        </p>
                      </div>
                      <hr
                        className="my-3 border-[0.5px] border-[#8F95B2] w-[80%]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                          borderImageSlice: "1",
                        }}
                      />
                      <div className="flex w-full items-center justify-between">
                        <p className="text-light-text-color text-[16px] font-medium leading-[20px]">
                          ADDRESS
                        </p>
                        <p className="text-end w-1/2 ellipsis whitespace-nowrap overflow-hidden text-[16px] font-bold leading-[20px] text-text-color">
                          {agentAddress.slice(0, 4)}...
                          {agentAddress.slice(-4)}
                        </p>
                      </div>
                      <hr
                        className="my-3 border-[0.5px] border-[#8F95B2] w-[80%]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                          borderImageSlice: "1",
                        }}
                      />
                      <div className="flex w-full items-center justify-between">
                        <p className="text-light-text-color text-[16px] font-medium leading-[18px]">
                          LINKS
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          {agentXProfile && isValidXProfile ? (
                            <Link
                              href={agentXProfile}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/register-twitter-icon.svg"
                                alt="X"
                                className="w-6 h-6"
                              />
                            </Link>
                          ) : null}
                          {agentWebsite && isValidWebsite ? (
                            <Link
                              href={agentWebsite}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/register-website-icon.svg"
                                alt="website"
                                className="w-6 h-6"
                              />
                            </Link>
                          ) : null}
                          {agentGitHub && isValidGitHub ? (
                            <Link
                              href={agentGitHub}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/register-github-icon.svg"
                                alt="GitHub"
                                className="w-6 h-6"
                              />
                            </Link>
                          ) : null}
                          {agentTelegram && isValidTelegram ? (
                            <Link
                              href={agentTelegram}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/register-telegram-icon.svg"
                                alt="GitHub"
                                className="w-6 h-6"
                              />
                            </Link>
                          ) : null}
                          {agentDexTools && isValidDexTools ? (
                            <Link
                              href={agentDexTools}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/register-dex-icon.svg"
                                alt="GitHub"
                                className="w-6 h-6"
                              />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <hr
                        className="my-3 border-[0.5px] border-[#8F95B2] w-[80%]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                          borderImageSlice: "1",
                        }}
                      />{" "}
                      <div className="flex w-full items-center justify-between">
                        <p className="text-light-text-color text-[16px] font-medium leading-[20px]">
                          CATEGORY
                        </p>
                        <p className="text-end w-1/2 ellipsis whitespace-nowrap overflow-hidden text-[16px] font-bold leading-[20px] text-text-color">
                          {selectedAgentService}&nbsp;
                          <span className="text-[16px] font-bold leading-[20px] text-light-text-color">
                            (
                            {[
                              ...selectedAgentSubServices,
                              ...customCapabilities,
                            ].join(", ")}
                            )
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  src="/assets/register-preview-pattern.svg"
                  alt="pattern"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden max-lg:flex flex-col items-center justify-center h-[72dvh] w-full">
        <p
          className="text-[20px] font-semibold text-primary"
          style={{ textShadow: "0px 4px 12px rgba(249, 77, 39, 0.2)" }}
        >
          Register Agent
        </p>
        <img
          src="/assets/register-agent-mobile.svg"
          alt="register-agent-mobile"
        />
        <p className="w-[330px] text-[14px] text-center font-normal text-primary">
          Oh hey agent builder: registration lives on desktop only, our mobile
          portal's still getting its superpowers!
        </p>
      </div>
    </div>
  );
};

export default Page;
