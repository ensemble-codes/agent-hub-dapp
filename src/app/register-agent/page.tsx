"use client";
import { AppHeader, SideMenu } from "@/components";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useSdk } from "@/sdk-config";
import { config } from "@/components/onchainconfig/config";
import Loader from "@/components/loader";
import { parseEther } from "ethers";

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
  Social: ["Bull Post", "Reply", "Campaign"],
  Security: ["Audit"],
  Research: ["Markets", "Trends", "AI Agents LP"],
} as const;

const Page = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    config: config,
  });
  const sdk = useSdk(walletClient);

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
  const [selectedAgentSubServices, setSelectedAgentSubServices] = useState<
    string[]
  >(
    [SUB_SERVICES["DeFi"][0]] // Initialize with "Swap"
  );
  const [agentServicePrice, setAgentServicePrice] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);

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

        const boolean = await sdk.registerAgent(
          address,
          agentName,
          imgUri,
          selectedAgentService,
          Number(parseEther(agentServicePrice))
        );

        console.log({ registration: boolean });
      }
    } catch (error) {
      console.log(error);
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
      selectedAgentSubServices.length === 0 ||
      !agentServicePrice,
    [disableNext, selectedAgentService, selectedAgentSubServices, agentAddress]
  );

  return (
    <div>
      <AppHeader />
      <div className="flex items-start gap-16 pt-16">
        <SideMenu />
        <div className="grow">
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
          <div className="rounded-[10px] bg-gradient-to-r from-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0)] p-[1px]">
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
                            const firstSubService = SUB_SERVICES[newService][0];
                            setSelectedAgentSubServices([firstSubService]);
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
                          {SUB_SERVICES[selectedAgentService].map((service) => (
                            <label
                              key={service}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div className="relative w-5 h-5 border border-light-text-color rounded-[4px]">
                                <input
                                  type="checkbox"
                                  className="appearance-none w-5 h-5 cursor-pointer"
                                  checked={selectedAgentSubServices.includes(
                                    service
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAgentSubServices([
                                        ...selectedAgentSubServices,
                                        service,
                                      ]);
                                    } else {
                                      setSelectedAgentSubServices(
                                        selectedAgentSubServices.filter(
                                          (s) => s !== service
                                        )
                                      );
                                    }
                                  }}
                                />
                                {selectedAgentSubServices.includes(service) && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-primary rounded-sm" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[#3d3d3d] text-[14px]">
                                {service}
                              </span>
                            </label>
                          ))}
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
                  <button
                    className="w-auto mt-12 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] disabled:bg-[#FE460066] disabled:cursor-not-allowed"
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
