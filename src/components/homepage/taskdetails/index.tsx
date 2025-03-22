"use client";
import { FC, useCallback, useState, useEffect, useContext } from "react";
import DetailStep from "./detail-step";
import SelectAgentStep from "./select-step";
import ConfirmAgent from "./confirm-agent";
import { AppContext } from "@/context";
import { SET_TASK_PROMPT } from "@/context/actions";
import { useSearchParams } from "next/navigation";

interface TaskDetailsProps {
  selectedService: string;
}

const TaskDetails: FC<TaskDetailsProps> = ({ selectedService }) => {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposal");
  const [, dispatch] = useContext(AppContext);
  const [detailStep, setDetailStep] = useState<string>("details");
  const [selectedAgent, setSelectedAgent] = useState<number>(1);
  const [selectedTweetStyles, setSelectedTweetStyles] = useState<string[]>([]);
  const [vibesXUsername, setVibesXUsername] = useState("");
  const [taskTopic, setTaskTopic] = useState<string>("");

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if user has entered topic or moved past details step
      if (taskTopic || detailStep !== "details") {
        e.preventDefault();
        e.returnValue = "Changes you made may not be saved.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [detailStep, taskTopic]);

  const getProgressWidth = useCallback(() => {
    switch (detailStep) {
      case "details":
        return "2%";
      case "select":
        return "48%";
      case "confirm":
        return "96%";
      default:
        return "2%";
    }
  }, [detailStep]);

  // Handle step navigation
  const handleStepClick = (step: string) => {
    if (detailStep === "confirm" && (step === "details" || step === "select")) {
      setDetailStep(step);
    } else if (detailStep === "select" && step === "details") {
      setDetailStep(step);
    }
  };

  const generatePrompt = useCallback(() => {
    if (!taskTopic) return "";

    const payload =
      selectedService?.toLowerCase() === "bull-post"
        ? `topic: ${taskTopic}. adjective: ${selectedTweetStyles.join(
            ", "
          )}`.trim()
        : selectedService?.toLowerCase() === "bless me"
        ? `topic: ${taskTopic}. username: ${vibesXUsername}`.trim()
        : `topic: ${taskTopic}`;

    dispatch({
      type: SET_TASK_PROMPT,
      payload: payload,
    });
  }, [taskTopic, selectedTweetStyles, vibesXUsername]);

  return (
    <div className="flex flex-col items-start w-full">
      <div className="mb-5">
        <p className="text-[18px] font-bold leading-[24.3px] flex items-center gap-1 mb-1">
          {selectedService.toUpperCase()}
          {selectedService.toLowerCase() === "bull-post" ? (
            <img
              src="/assets/bull-post-icon.svg"
              alt="bull-post"
              className="w-7 h-7"
            />
          ) : selectedService.toLowerCase() === "bless me" ? (
            <img src="/assets/vibes-icon.svg" alt="vibes" className="w-7 h-7" />
          ) : selectedService === "veterinary" ? (
            <img src="/assets/vet-icon.svg" alt="vet" className="w-7 h-7" />
          ) : (
            <img
              src="/assets/smart-contract-audit-primary-icon.svg"
              alt="audit"
              className="w-7 h-7"
            />
          )}
        </p>
        {selectedService.toLowerCase() === "bull-post" ? (
          <p className="text-[16px] font-medium leading-[21.56px] text-[#8F95B2]">
            Select an AI KOL your project. The perfect Hype-man!
          </p>
        ) : selectedService.toLowerCase() === "bless me" ? (
          <p className="text-[16px] font-medium leading-[21.56px] text-[#8F95B2]">
            Send good vibes to your near and dear ones
          </p>
        ) : selectedService.toLowerCase() === "veterinary" ? (
          <p className="text-[16px] font-medium leading-[21.56px] text-[#8F95B2]">
            Instant AI analysis for your pets
          </p>
        ) : (
          <p className="text-[16px] font-medium leading-[21.56px] text-[#8F95B2]">
            On-demand security expert when you need it!
          </p>
        )}
      </div>
      <div className="relative w-full max-w-[900px]">
        <div className="w-full rounded-[10px] bg-gradient-to-r from-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0)] p-[1px]">
          <div
            className="py-8 px-5 rounded-[10px] w-full shadow-[inset_5px_5px_10px_0px_#D8D8D8,inset_-5px_-5px_10px_0px_#FAFBFF]"
            style={{
              background: detailStep === "details" ? "white" : "#FAFAFA",
            }}
          >
            <div className="relative w-full mb-5">
              <div className="absolute bg-[#FE460066] h-2 rounded-[200px] w-full"></div>
              <div
                className="w-8 h-8 top-[-12px] absolute transition-all duration-300 ease-in-out"
                style={{ left: getProgressWidth() }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-[rgba(254,70,0,0.4)] to-[rgba(254,70,0,0.16)] p-[1px]">
                  <div className="w-full h-full rounded-full bg-white shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF]"></div>
                </div>
              </div>
              <div
                className="h-2 bg-primary rounded-[200px] transition-all duration-300 ease-in-out"
                style={{ width: getProgressWidth() }}
              ></div>
              <div className="flex items-center justify-between mt-5">
                <p
                  className={`font-spaceranger text-[20px] leading-[18px] ${
                    detailStep === "details" ? "text-primary" : "text-[#8F95B2]"
                  } ${detailStep !== "details" ? "cursor-pointer" : ""}`}
                  onClick={() => handleStepClick("details")}
                >
                  Details
                </p>
                <p
                  className={`font-spaceranger text-[20px] leading-[18px] ${
                    detailStep === "select" ? "text-primary" : "text-[#8F95B2]"
                  } ${detailStep === "confirm" ? "cursor-pointer" : ""}`}
                  onClick={() => handleStepClick("select")}
                >
                  Select Agent
                </p>
                <p
                  className={`font-spaceranger text-[20px] leading-[18px] ${
                    detailStep === "confirm" ? "text-primary" : "text-[#8F95B2]"
                  }`}
                >
                  Start
                </p>
              </div>
            </div>
            {detailStep === "details" ? (
              <DetailStep
                setDetailStep={(val) => {
                  setDetailStep(proposalId ? "confirm" : val);
                  generatePrompt();
                }}
                selectedTweetStyles={selectedTweetStyles}
                setSelectedTweetStyles={setSelectedTweetStyles}
                topic={taskTopic}
                setTopic={setTaskTopic}
                vibesXUsername={vibesXUsername}
                setVibesXUsername={setVibesXUsername}
              />
            ) : detailStep === "select" ? (
              <SelectAgentStep
                selectedAgent={(val) => {
                  setSelectedAgent(val);
                  setDetailStep("confirm");
                }}
              />
            ) : (
              <ConfirmAgent
                selectedAgent={selectedAgent}
                selectedTweetStyles={selectedTweetStyles}
                topic={taskTopic}
                vibesXUsername={vibesXUsername}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
