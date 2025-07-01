"use client";
import { AppHeader, SideMenu } from "@/components";
import axios from "axios";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { sendGAEvent } from '@next/third-parties/google'
import { useSdk } from "@/sdk-config";
import { config } from "@/components/onchainconfig/config";
import Loader from "@/components/loader";
import { parseEther } from "ethers";
import { useRouter } from "next/navigation";
import { Switch } from "@/components";
import { logAgentRegistration, logError } from "@/utils/sentry-logging";

const services = [
  {
    title: "DeFi",
    icon: "/assets/defi-service-icon.svg",
    selected_icon: "/assets/defi-service-selected-icon.svg",
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
      description:
        "Agent conducts a swap on your behalf using an optimal route with less fees",
      icon: "/assets/swap-icon.svg",
    },
    {
      name: "Bridge",
      description:
        "Agent bridges from multiple chains using optimal routes and lower fees!",
      icon: "/assets/bridge-icon.svg",
    },
    {
      name: "Provide LP",
      description: "Agent provides LP in a pool of your choice!",
      icon: "/assets/provide-lp-icon.svg",
    },
  ],
  Social: [
    {
      name: "Bull-Post",
      description: "Select an AI KOL your project. The perfect Hype-man!",
      icon: "/assets/bull-post-icon.svg",
    },
    {
      name: "Reply",
      description:
        "Reply agents are great for interaction and possibly farm airdrops/whitelist spots!",
      icon: "/assets/reply-icon.svg",
    },
    {
      name: "Campaign",
      description:
        "Agents will run a campaign on your behalf, ensuring attention and consistency",
      icon: "/assets/campaign-icon.svg",
    },
    {
      name: "Bless Me",
      description:
        "Man plans, and God laughs. I'm here to take your wishes and convince god to make them real!",
      icon: "/assets/vibes-icon.svg",
    },
  ],
  Security: [
    {
      name: "Smart Contract Audit",
      description:
        "Agent audits your smart contract for any bugs or vulnerabilities",
      icon: "/assets/smart-contract-audit-icon.svg",
    },
  ],
  Research: [
    {
      name: "Markets",
      description:
        "Perfect for analyzing market data and providing accurate information",
      icon: "/assets/markets-icon.svg",
    },
    {
      name: "Trends",
      description: "Get up-tp-date with the latest trends in the Crypto world!",
      icon: "/assets/trends-icon.svg",
    },
    {
      name: "AI Agents LP",
      description: "Stay updated with the latest on AI Agents!",
      icon: "/assets/ai-agents-icon.svg",
    },
    {
      name: "Pet Symptom Analyzer",
      description: "AI-powered veterinary diagnostic service that evaluates your pet's symptoms and generates detailed assessment reports.",
      icon: "/assets/pet-gray-icon.svg",
    },
  ],
};

const Page = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({
    config: config,
  });
  const sdk = useSdk(walletClient);
  const { push } = useRouter();

  const [detailsStep, setDetailsStep] = useState<"about" | "capabilities">(
    "about"
  );
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
  const [selectedAgentSubServices, setSelectedAgentSubServices] =
    useState<string>(
      SUB_SERVICES_LIST["DeFi"][0].name // Initialize with "Swap"
    );
  const [agentServicePrice, setAgentServicePrice] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerFailure, setRegisterFailure] = useState(false);

  // Add validation states
  const [isValidXProfile, setIsValidXProfile] = useState(false);
  const [isValidGitHub, setIsValidGitHub] = useState(false);
  const [isValidWebsite, setIsValidWebsite] = useState(false);

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
    if (url && url.match(/^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+[a-z]{2,6}$/)) {
      urlToTest = 'https://' + url;
    }
    
    // Basic URL validation
    try {
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
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
    try {
      if (agentPfp) {
        const imgUri = await handleUploadToPinata(agentPfp);

        const service = selectedAgentSubServices;

        // Validate service price before parsing
        if (!agentServicePrice || agentServicePrice.trim() === "") {
          throw new Error("Service price cannot be empty");
        }
        const servicePrice = parseEther(agentServicePrice).toString();

        console.log({
          agentAddress,
          name: agentName,
          description: agentDescription,
          socials: {
            twitter: agentXProfile,
            telegram: "",
            website: agentWebsite,
            dexscreener: "",
            github: agentGitHub,
          },
          imageURI: imgUri,
          service,
          servicePrice,
        });

        const boolean = await sdk?.registerAgent(
          agentAddress,
          {
            name: agentName,
            description: agentDescription,
            socials: {
              twitter: agentXProfile,
              telegram: "",
              website: agentWebsite,
              dexscreener: "",
              github: agentGitHub,
            },
            attributes: [{
              value: "",
              trait_type: ""
            }],
            imageURI: imgUri,
          },
          service,
          Number(servicePrice)
        );

        sendGAEvent('register_agent', {
          agentName,
          agentAddress,
          service: selectedAgentSubServices,
          servicePrice: agentServicePrice,
        })

        // Log successful registration to Sentry
        logAgentRegistration({
          name: agentName,
          service: selectedAgentSubServices,
          price: agentServicePrice,
          address: agentAddress
        });

        if (boolean) {
          setRegisterSuccess(true);
        } else {
          setRegisterFailure(true);
        }
      }
    } catch (error) {
      console.log(error);
      // Log error to Sentry
      logError(error as Error, {
        component: "RegisterAgent",
        action: "register_agent",
        agent_name: agentName,
        service: selectedAgentSubServices
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
    selectedAgentService,
    selectedAgentSubServices,
    agentAddress,
    address,
    agentServicePrice
  ]);

  const getProgressWidth = useCallback(() => {
    switch (detailsStep) {
      case "about":
        return "50%";
      case "capabilities":
        return "100%";
      default:
        return "2%";
    }
  }, [detailsStep]);

  const disableNext = useMemo(
    () =>
      !isConnected ||
      !(
        agentName &&
        agentPfp &&
        agentDescription &&
        agentXProfile &&
        isValidXProfile &&
        agentWebsite &&
        isValidWebsite
      ),
    [
      agentName,
      agentPfp,
      agentDescription,
      agentXProfile,
      isValidXProfile,
      agentGitHub,
      agentWebsite,
      isValidWebsite,
    ]
  );

  const disableRegister = useMemo(
    () =>
      disableNext ||
      !isConnected ||
      !agentAddress ||
      !selectedAgentService ||
      !selectedAgentSubServices ||
      !agentServicePrice,
    [
      disableNext,
      agentAddress,
      selectedAgentService,
      selectedAgentSubServices,
      agentServicePrice,
    ]
  );

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
    if (selectedAgentService && !selectedAgentSubServices) {
      setSelectedAgentSubServices(
        SUB_SERVICES_LIST[selectedAgentService][0].name
      );
    }
  }, [selectedAgentService, selectedAgentSubServices]);

  return (
    <div>
      <div className="flex items-start gap-4">
        <SideMenu />
        <div className="grow w-full">
        <AppHeader />
          <p className="flex items-center gap-2 mb-2">
            <span className="font-bold text-[#3d3d3d] leading-[24px]">
              Register Agent
            </span>
            <img
              src="/assets/code-icon.svg"
              alt="code-icon"
              className="w-6 h-6"
            />
          </p>
          <p className="text-light-text-color font-medium leading-[21px] mb-4">
            Configure your agent on Base
          </p>
          <div className="flex items-start gap-4 w-full">
            <div className="grow rounded-[10px] bg-gradient-to-r from-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0)] p-[1px]">
              <div className="py-8 px-5 rounded-[10px] w-full shadow-[inset_5px_5px_10px_0px_#D8D8D8,inset_-5px_-5px_10px_0px_#FAFBFF] bg-[#FAFAFA]">
                <div className="flex items-center w-full justify-between mb-6">
                  <div className="flex flex-col gap-2 justify-start items-stretch">
                    <p className="text-[#FE4600] text-[18px] leading-[24px] font-bold">
                      About Agent
                    </p>
                    <div className="w-full h-[8px] rounded-[200px] bg-[#FE460066]">
                      <div
                        className="w-full h-[8px] rounded-[200px] bg-[#FE4600] transition-all duration-300 ease-in-out"
                        style={{ width: getProgressWidth() }}
                      ></div>
                    </div>
                  </div>
                  {detailsStep === "capabilities" ? (
                    <button
                      className="w-auto space-x-2 flex items-center justify-between rounded-[50px] border border-[#3D3D3D66] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-[12px] px-[16px]"
                      onClick={() => setDetailsStep("about")}
                    >
                      <img
                        src="/assets/pixelated-arrow-light-black-icon.svg"
                        alt="pixelated-arrow"
                      />
                      <span className="font-bold text-light-text-color leading-[24px]">
                        Back
                      </span>
                    </button>
                  ) : (
                    <button
                      className="w-auto space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] disabled:bg-[#FE460066] disabled:cursor-not-allowed"
                      onClick={() => setDetailsStep("capabilities")}
                      disabled={disableNext}
                    >
                      <span className="text-white text-[16px] font-[700] leading-[24px]">
                        Next
                      </span>
                      <img
                        src="/assets/pixelated-arrow-icon.svg"
                        alt="pixelated-arrow"
                      />
                    </button>
                  )}
                </div>
                {detailsStep === "about" ? (
                  <div className="w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                          Name
                          {agentName ? (
                            <img
                              src="/assets/check-fill-icon.svg"
                              alt="fill"
                              className="w-5 h-5"
                            />
                          ) : null}
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
                          placeholder="Enter agent name"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                        />
                      </div>

                      <div className="flex-1 max-w-[300px]">
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
                      </div>
                    </div>
                    <hr
                      className="my-2 border-[0.5px] border-[#8F95B2] w-[50%] mt-6"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="max-w-[616px] mt-6">
                      <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                        Describe your agent
                        {agentDescription ? (
                          <img
                            src="/assets/check-fill-icon.svg"
                            alt="fill"
                            className="w-5 h-5"
                          />
                        ) : null}
                      </p>
                      <textarea
                        className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color resize-none"
                        placeholder="Enter description"
                        value={agentDescription}
                        onChange={(e) => setAgentDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <hr
                      className="my-2 border-[0.5px] border-[#8F95B2] w-[50%] mt-6"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex-1 w-[176px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                          X Profile
                          {agentXProfile && isValidXProfile ? (
                            <img
                              src="/assets/check-fill-icon.svg"
                              alt="fill"
                              className="w-5 h-5"
                            />
                          ) : null}
                        </p>
                        <div className="flex items-center gap-2 py-4 px-2 border border-light-text-color rounded-[4px]">
                          <img
                            src="/assets/og-x-icon.svg"
                            alt="x"
                            className="w-6 h-6"
                          />
                          <input
                            className="w-full outline-none focus:outline-none placeholder:text-light-text-color bg-inherit"
                            placeholder="Enter X link"
                            value={agentXProfile}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAgentXProfile(value);
                              setIsValidXProfile(validateXProfile(value));
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 w-[176px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                          GitHub
                          {agentGitHub && isValidGitHub ? (
                            <img
                              src="/assets/check-fill-icon.svg"
                              alt="fill"
                              className="w-5 h-5"
                            />
                          ) : null}
                        </p>
                        <div className="flex items-center gap-2 py-4 px-2 border border-light-text-color rounded-[4px]">
                          <img
                            src="/assets/og-github-icon.svg"
                            alt="github"
                            className="w-6 h-6"
                          />
                          <input
                            className="w-full outline-none focus:outline-none placeholder:text-light-text-color bg-inherit"
                            placeholder="Enter GitHub link"
                            value={agentGitHub}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAgentGitHub(value);
                              setIsValidGitHub(validateGitHub(value));
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 w-[176px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                          Website
                          {agentWebsite && isValidWebsite ? (
                            <img
                              src="/assets/check-fill-icon.svg"
                              alt="fill"
                              className="w-5 h-5"
                            />
                          ) : null}
                        </p>
                        <div className="flex items-center gap-2 py-4 px-2 border border-light-text-color rounded-[4px]">
                          <img
                            src="/assets/website-icon.svg"
                            alt="website"
                            className="w-6 h-6"
                          />
                          <input
                            className="w-full outline-none focus:outline-none placeholder:text-light-text-color bg-inherit"
                            placeholder="Enter Website link"
                            value={agentWebsite}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAgentWebsite(value);
                              setIsValidWebsite(validateWebsite(value));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          Owner address (connected)
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color cursor-not-allowed"
                          placeholder="Enter X Profile link"
                          value={address}
                          disabled
                        />
                      </div>
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color flex items-center gap-2">
                          Agent address
                          <div className="relative group">
                            <img
                              src="/assets/tooltip-icon.svg"
                              alt="tooltip"
                              className="w-4 h-4 cursor-help"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-[#FE460033] w-[230px] px-3 py-1 rounded-[2000px] text-[12px] leading-[24px] text-text-color z-10">
                              Smart contract address of your agent
                            </div>
                          </div>
                          {agentAddress ? (
                            <img
                              src="/assets/check-fill-icon.svg"
                              alt="fill"
                              className="w-5 h-5"
                            />
                          ) : null}
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
                          placeholder="Enter agent address"
                          value={agentAddress}
                          onChange={(e) => setAgentAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <hr
                      className="my-2 border-[0.5px] border-[#8F95B2] w-[50%] mt-6"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                        Services
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
                              setSelectedAgentSubServices(firstSubService);
                            }}
                            className={`w-auto space-x-2 flex items-center justify-between rounded-[50px] py-[12px] px-[16px] ${
                              selectedAgentService === service.title
                                ? "bg-primary shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                                : "border border-[#3D3D3D66] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF]"
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
                                service.title === "DeFi"
                                  ? "w-[15px] h-[14px]"
                                  : "w-6 h-6"
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
                      {selectedAgentService && (
                        <div className="mt-4 space-y-3">
                          {SUB_SERVICES_LIST[selectedAgentService].map(
                            (service) => (
                              <div
                                key={service.name}
                                className="border border-light-text-color rounded-[8px] p-4 flex items-center justify-between"
                              >
                                <div className="flex items-start gap-2">
                                  {service.icon ? (
                                    <img
                                      src={service.icon}
                                      alt={service.name.toLowerCase()}
                                      className={`${
                                        service.name === "Smart Contract Audit"
                                          ? "w-5 h-5"
                                          : "w-6 h-6"
                                      }`}
                                    />
                                  ) : null}
                                  <div className="flex flex-col items-start gap-1">
                                    <p className="font-bold text-text-color text-[14px]">
                                      {service.name.toUpperCase()}
                                    </p>
                                    <p className="font-medium text-text-color text-[14px]">
                                      {service.description}
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={
                                    selectedAgentSubServices === service.name
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedAgentSubServices(service.name);
                                    } else if (
                                      selectedAgentSubServices === service.name
                                    ) {
                                      // When unchecking the currently selected service, select none
                                      setSelectedAgentSubServices("");
                                    }
                                  }}
                                  size="default"
                                />
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <hr
                      className="my-2 border-[0.5px] border-[#8F95B2] w-[50%] mt-6"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="flex-1 max-w-[300px] mt-6">
                      <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                        Rate per Task
                      </p>
                      <input
                        className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color remove-arrow"
                        placeholder="0.05 ETH"
                        value={agentServicePrice}
                        step="0.000000000000000001"
                        min="0"
                        type="number"
                        onChange={(e) => setAgentServicePrice(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-[275px] h-[auto] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF]">
              <div className="relative">
                <img
                  src="/assets/register-preview-header-icon.svg"
                  alt="preview-header"
                  className="w-full"
                />
                <p className="font-bold leading-[24px] text-light-text-color absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
                  preview
                </p>
              </div>
              {loadingRegister ? (
                <div className="w-[243px] h-[192px] mx-auto flex flex-col gap-4 items-center justify-center">
                  <Loader size="xl" />
                  <p className="text-text-color text-[14px] font-bold leading-[19px]">
                    Confirming tx to deploy agent...
                  </p>
                </div>
              ) : registerSuccess ? (
                <div className="relative w-[243px] h-[192px] mx-auto flex flex-col gap-4 items-center justify-center">
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
                    className="w-[243px] rounded-[8px] h-[192px] mx-auto flex flex-col gap-4 items-center justify-center"
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
                  className="rounded-[8px] w-[243px] h-[192px] object-cover mx-auto"
                />
              ) : (
                <div className="w-[243px] h-[192px] rounded-[8px] mx-auto border border-light-text-color flex items-center justify-center">
                  <p className="text-[14px] leading-[18px] font-normal text-light-text-color text-center">
                    PFP
                    <br />
                    <i className="text-[12px]">max 5MB</i>
                  </p>
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
                    Service
                  </p>
                  {detailsStep === "capabilities" ? (
                    <p className="text-end w-1/2 ellipsis whitespace-nowrap overflow-hidden text-[16px] font-bold leading-[20px] text-text-color">
                      {selectedAgentService}&nbsp;
                      <span className="text-[16px] font-bold leading-[20px] text-light-text-color">
                        ({selectedAgentSubServices})
                      </span>
                    </p>
                  ) : null}
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
                  <p className="text-light-text-color text-[14px] font-medium leading-[18px]">
                    Socials
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    {agentXProfile && isValidXProfile ? (
                      <img
                        src="/assets/og-x-icon.svg"
                        alt="X"
                        className="w-6 h-6"
                      />
                    ) : null}
                    {agentWebsite && isValidWebsite ? (
                      <img
                        src="/assets/website-icon.svg"
                        alt="website"
                        className="w-6 h-6"
                      />
                    ) : null}
                    {agentGitHub && isValidGitHub ? (
                      <img
                        src="/assets/og-github-icon.svg"
                        alt="GitHub"
                        className="w-6 h-6"
                      />
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
                />
                <div className="flex w-full items-center justify-between">
                  <p className="text-light-text-color text-[16px] font-medium leading-[20px]">
                    Address
                  </p>
                  {detailsStep === "capabilities" ? (
                    <p className="text-end w-1/2 ellipsis whitespace-nowrap overflow-hidden text-[16px] font-bold leading-[20px] text-text-color">
                      {agentAddress.slice(0, 4)}...{agentAddress.slice(-4)}
                    </p>
                  ) : null}
                </div>
                {detailsStep === "capabilities" && !registerSuccess ? (
                  <button
                    className="w-full mt-4 space-x-2 flex items-center justify-center gap-1 rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] disabled:bg-[#FE460066] disabled:cursor-not-allowed"
                    onClick={registerAgent}
                    disabled={disableRegister || loadingRegister}
                  >
                    {loadingRegister ? (
                      <Loader color="white" size="md" />
                    ) : (
                      <img
                        src="/assets/bolt-icon.svg"
                        alt="bolt"
                        className="w-6 h-6"
                      />
                    )}
                    <span className="text-white text-[16px] font-[700] leading-[24px]">
                      Register Agent
                    </span>
                  </button>
                ) : null}
              </div>
              {registerSuccess && (
                <div className="p-4 pt-0">
                  <button
                    className="w-full space-x-2 flex items-center justify-center gap-1 rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                    onClick={() => push(`/agents/${agentAddress}`)}
                  >
                    <img
                      src="/assets/bolt-icon.svg"
                      alt="bolt"
                      className="w-4 h-4"
                    />
                    <span className="text-white text-[16px] font-[700] leading-[24px]">
                      View Agent Profile
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
