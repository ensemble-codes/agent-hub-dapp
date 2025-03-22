"use client";
import { FC, useCallback } from "react";
import TWEETSTYLES from "@/dummydata/tweetstyles.json";
import { useSearchParams } from "next/navigation";

interface DetailStepProps {
  setDetailStep: (step: string) => void;
  selectedTweetStyles: string[];
  setSelectedTweetStyles: (styles: string[]) => void;
  topic: string;
  setTopic: (val: string) => void;
  vibesXUsername: string;
  setVibesXUsername: (val: string) => void;
}

const DetailStep: FC<DetailStepProps> = ({
  setDetailStep,
  selectedTweetStyles,
  setSelectedTweetStyles,
  topic,
  setTopic,
  vibesXUsername,
  setVibesXUsername
}) => {
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");
  const handleSelectTweetStyle = useCallback(
    (selectedStyleValue: string) => {
      let tempStyles = [...selectedTweetStyles];
      if (tempStyles.includes(selectedStyleValue)) {
        tempStyles = tempStyles.filter((style) => style !== selectedStyleValue);
      } else {
        tempStyles.push(selectedStyleValue);
      }
      setSelectedTweetStyles(tempStyles);
    },
    [selectedTweetStyles]
  );

  return (
    <>
      <div className="max-w-[580px] space-y-2 mb-5">
        <p className="font-medium leading-[21.6px]">
          {selectedService?.toLowerCase() === "bull-post"
            ? "Topic"
            : selectedService?.toLowerCase() === "bless me"
            ? "Greeting"
            : selectedService?.toLowerCase() === "smart contract audit"
            ? "Audit"
            : "Problem Description"}
        </p>
        <input
          className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
          placeholder="Briefly describe your requirement"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      {selectedService?.toLowerCase() === "bull-post" ? (
        <div className="max-w-[580px] space-y-2 mb-5">
          <p className="font-medium leading-[21.6px]">Tweet Style</p>
          <div className="w-full flex items-center justify-start gap-2 flex-wrap">
            {TWEETSTYLES.map((ts) => (
              <p
                key={ts.value}
                className={`rounded-[20px] text-[14px] border-[${ts.color}] flex-shrink-0 cursor-pointer px-2 py-[2px] border-[0.5px] shadow-[0px_2px_4px_0px_#0000001F]`}
                onClick={() => handleSelectTweetStyle(ts.value)}
                style={{
                  background: selectedTweetStyles.includes(ts.value)
                    ? ts.color
                    : "inherit",
                  color: selectedTweetStyles.includes(ts.value)
                    ? "white"
                    : "inherit",
                  fontWeight: selectedTweetStyles.includes(ts.value)
                    ? 500
                    : 400,
                }}
              >
                {ts.label}
              </p>
            ))}
          </div>
        </div>
      ) : selectedService?.toLowerCase() === "bless me" ? (
        <div className="max-w-[580px] space-y-2 mb-5">
          <p className="font-medium leading-[21.6px]">X handle</p>
          <input
            className="w-full border border-light-text-color rounded-[4px] outline-none focus:outline-none py-4 px-2 placeholder:text-light-text-color"
            placeholder="@ enter X username"
            value={vibesXUsername}
            onChange={(e) => setVibesXUsername(e.target.value)}
          />
        </div>
      ) : null}
      <button
        className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-gradient-to-[317.7deg] from-[rgba(0,0,0,0.4)] to-[rgba(255,255,255,0.4)] py-[12px] px-[16px] shadow-[2px_2px_0px_0px_#FE4600,-5px_-5px_10px_0px_#FAFBFFAD] disabled:bg-light-text-color"
        onClick={() => setDetailStep("select")}
        disabled={!topic}
      >
        <span className="text-white text-[16px] font-[700] leading-[24px]">
          Proceed
        </span>
        <img src="/assets/pixelated-arrow-icon.svg" alt="pixelated-arrow" />
      </button>
    </>
  );
};

export default DetailStep;
