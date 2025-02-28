"use client";
import { AppHeader, SideMenu } from "@/components";
import axios from "axios";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useSdk } from "@/sdk-config";
import { config } from "@/components/onchainconfig/config";
import Loader from "@/components/loader";
import { parseEther } from "ethers";
import { useRouter } from "next/navigation";

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

const SUB_SERVICES = {
  DeFi: ["Swap", "Bridge", "Provide LP"],
  Social: ["Bull-Post", "Reply", "Campaign"],
  Security: ["Smart Contract Audit"],
  Research: ["Markets", "Trends", "AI Agents LP"],
} as const;

const Page = () => {
  const { address } = useAccount();
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
  const [agentTelegram, setAgentTelegram] = useState("");
  const [agentAddress, setAgentAddress] = useState("");
  const [agentGitHub, setAgentGitHub] = useState("");
  const [selectedAgentService, setSelectedAgentService] = useState<
    "DeFi" | "Social" | "Security" | "Research"
  >("DeFi");
  const [selectedAgentSubServices, setSelectedAgentSubServices] =
    useState<string>(
      SUB_SERVICES["DeFi"][0] // Initialize with "Swap"
    );
  const [agentServicePrice, setAgentServicePrice] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerFailure, setRegisterFailure] = useState(false);

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
        const servicePrice = parseEther(agentServicePrice).toString();

        const boolean = await sdk.registerAgent(
          agentAddress,
          {
            name: agentName,
            description: agentDescription,
            socials: {
              twitter: agentXProfile,
              telegram: agentTelegram,
              dexscreener: "",
              github: agentGitHub,
            },
            imageURI: imgUri,
          },
          service,
          servicePrice
        );

        if (boolean) {
          setRegisterSuccess(true);
        } else {
          setRegisterFailure(true);
        }
      }
    } catch (error) {
      console.log(error);
      setRegisterFailure(true);
    } finally {
      setLoadingRegister(false);
    }
  }, [
    agentName,
    agentPfp,
    agentDescription,
    agentXProfile,
    agentTelegram,
    selectedAgentService,
    selectedAgentSubServices,
    agentAddress,
    address,
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
      !(
        agentName &&
        agentPfp &&
        agentDescription &&
        agentXProfile &&
        agentTelegram
      ),
    [agentName, agentPfp, agentDescription, agentXProfile, agentTelegram]
  );

  const disableRegister = useMemo(
    () =>
      disableNext ||
      !agentAddress ||
      !selectedAgentService ||
      !agentServicePrice,
    [disableNext, selectedAgentService, agentAddress]
  );

  useEffect(() => {
    if (registerFailure) {
      const timer = setTimeout(() => {
        setRegisterFailure(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [registerFailure]);

  return (
    <div>
      <AppHeader />
      <div className="flex items-start gap-16 pt-16">
        <SideMenu />
        <div className="grow w-full">
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
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          Name
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
                          placeholder="Enter agent name"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                        />
                      </div>

                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          PFP
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
                      <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                        Describe your agent
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
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          X Profile
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
                          placeholder="Enter X Profile link"
                          value={agentXProfile}
                          onChange={(e) => setAgentXProfile(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          Telegram
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
                          placeholder="Enter telegram link"
                          value={agentTelegram}
                          onChange={(e) => setAgentTelegram(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          Deployed address (connected)
                        </p>
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color cursor-not-allowed"
                          placeholder="Enter X Profile link"
                          value={address}
                          disabled
                        />
                      </div>
                      <div className="flex-1 max-w-[300px]">
                        <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                          Agent address
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
                                SUB_SERVICES[newService][0];
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
                      {selectedAgentService &&
                        SUB_SERVICES[selectedAgentService].length > 0 && (
                          <div className="mt-4 flex items-center gap-4">
                            {SUB_SERVICES[selectedAgentService].map(
                              (service) => (
                                <label
                                  key={service}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <div className="relative w-5 h-5 border border-light-text-color rounded-[4px]">
                                    <input
                                      type="checkbox"
                                      className="appearance-none w-5 h-5 cursor-pointer"
                                      checked={
                                        selectedAgentSubServices === service
                                      }
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedAgentSubServices(service);
                                        }
                                      }}
                                    />
                                    {selectedAgentSubServices === service && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-primary rounded-sm" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[#3d3d3d] text-[14px]">
                                    {service}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        )}
                      <div className="flex-1 max-w-[300px] mt-3">
                        <input
                          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color remove-arrow"
                          placeholder="Enter service fee in ETH"
                          value={agentServicePrice}
                          step="any"
                          type="number"
                          onChange={(e) => setAgentServicePrice(e.target.value)}
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
                    <div className="flex-1 max-w-[300px] mt-6">
                      <p className="font-medium leading-[21.6px] mb-2 text-light-text-color">
                        GitHub link <i>(optional)</i>
                      </p>
                      <input
                        className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
                        placeholder="Enter agent GitHub"
                        value={agentGitHub}
                        onChange={(e) => setAgentGitHub(e.target.value)}
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
                    {agentXProfile ? (
                      <img
                        src="/assets/og-x-icon.svg"
                        alt="X"
                        className="w-6 h-6"
                      />
                    ) : null}
                    {agentTelegram ? (
                      <img
                        src="/assets/og-tg-icon.svg"
                        alt="TG"
                        className="w-6 h-6"
                      />
                    ) : null}
                    {agentGitHub ? (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
