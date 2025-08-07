"use client";
import { FC, useState, useEffect } from "react";

import { useSdk } from "@/sdk-config";
import { sendGAEvent } from "@next/third-parties/google";

interface Parameter {
  name: string;
  required: boolean;
  description: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  parameters: Parameter[];
}

interface ServiceDetailsCardProps {
  service: Service;
  userAddress: string;
  agentAddress: string;
  onCreateTask: (jsonString: string) => void;
}

export const ServiceDetailsCard: FC<ServiceDetailsCardProps> = ({
  service,
  agentAddress,
  onCreateTask,
}) => {
  const sdk = useSdk();

  const [inputs, setInputs] = useState<Record<string, string>>(
    Object.fromEntries(service.parameters.map((p) => [p.name, ""]))
  );
  const [notes, setNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showLeftSide, setShowLeftSide] = useState(false);
  const [showRightSide, setShowRightSide] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Show card container first
    setIsVisible(true);

    // Show left side after 200ms
    setTimeout(() => {
      setShowLeftSide(true);
    }, 200);

    // Show right side after 400ms
    setTimeout(() => {
      setShowRightSide(true);
    }, 400);
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async () => {
    try {
      setIsCreating(true);
      // Generate a human-readable prompt from the details
      const paramString = Object.entries(inputs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      // Only include targetAudience if it's provided by the user
      const targetAudience = inputs.targetAudience
        ? `\nTarget Audience: ${inputs.targetAudience}`
        : "";

      const prompt = `Create a task for service '${service.name}' (ID: ${
        service.id
      }) with parameters: { ${paramString} } for ${service.price} ${
        service.currency
      }. Notes: ${notes || "None"}${targetAudience}`;

      console.log("Attempting to create task with SDK...");
      const task = await sdk?.createTask({
        prompt,
        proposalId: "1",
      });
      console.log("SDK task creation response:", task);

      const message = {
        task: {
          service_id: service.id,
          task_id: task?.id?.toString(),
          price: service.price,
          parameters: inputs,
        },
      };
      onCreateTask(JSON.stringify(message));
      setTaskCreated(true);
      sendGAEvent("create_task", {
        agentId: agentAddress,
        taskId: task?.id,
        proposalId: "1",
        service: service.name,
      });
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if all required fields are filled
  const isFormValid = service.parameters
    .filter((param) => param.required)
    .every((param) => inputs[param.name]?.trim());

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2 w-full">
        <img
          src={"/assets/check-icon.svg"}
          alt="check"
          className="w-6 h-6 rounded-full"
        />
        <p
          className="text-[16px] font-normal leading-[20px] bg-clip-text text-transparent"
          style={{
            background: "linear-gradient(90.79deg, #121212 0%, #787878 99.7%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Task created
        </p>
      </div>
        {/* Collapsed View */}

      <div
        className={`z-[2] bg-white flex flex-col md:flex-row gap-4 max-w-[676px] w-full transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ${!isExpanded ? "p-4 border border-[#E5E7EB] rounded-xl" : ""}`}
      >
        <div 
          className={`w-full transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-0 opacity-0 overflow-hidden" : "max-h-20 opacity-100"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="text-[#FF4D29] font-bold text-lg flex items-center gap-2">
                <img
                  src="/assets/multi-stars-shape-icon.svg"
                  alt="stars"
                  className="w-5 h-5"
                />
                {service.name}
              </div>
            </div>
            <div className="flex items-center justify-between w-[240px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-[#1DBA50] font-medium">Ongoing task</span>
              </div>
              <img
                src={"/assets/maximize-task-icon.svg"}
                alt="expand"
                className="w-4 h-4 cursor-pointer"
                onClick={toggleExpand}
              />
            </div>
          </div>
        </div>
        </div>

        <div
        className={`z-[2] bg-white flex flex-col md:flex-row gap-4 max-w-[676px] w-full transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ${isExpanded ? "p-4 border border-[#E5E7EB] rounded-xl" : ""}`}
      >
        {/* Expanded View */}
        <div 
          className={`w-full transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Left Side */}
            <div
              className={`flex-1 min-w-[220px] transition-all duration-500 ${
                showLeftSide
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="text-[#FF4D29] font-bold text-lg flex items-center gap-2">
                  <img
                    src="/assets/multi-stars-shape-icon.svg"
                    alt="stars"
                    className="w-5 h-5"
                  />{" "}
                  {service.name}
                </div>
              </div>
              <div className="text-[#8F95B2] text-sm mb-4">
                {service.description}
              </div>
              {service.parameters.map((param) => (
                <div key={param.name} className="mb-4">
                  <div className="font-semibold text-[#121212]">
                    {param.name.replace(/_/g, " ")}
                    {param.required && <span className="text-[#FF4D29]">*</span>}
                  </div>
                  <input
                    className="w-full border-b border-[#E5E7EB] bg-transparent outline-none py-1 text-[#FF4D29] text-[15px] placeholder-[#FF4D29]/50"
                    placeholder={param.description}
                    value={inputs[param.name]}
                    onChange={(e) => handleInputChange(param.name, e.target.value)}
                    required={param.required}
                  />
                </div>
              ))}
              <div className="mb-4">
                <div className="font-semibold text-[#121212]">Notes</div>
                <input
                  className="w-full border-b border-[#E5E7EB] bg-transparent outline-none py-1 text-[#8F95B2] text-[15px] placeholder-[#8F95B2]"
                  placeholder="Any special instructions?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="w-[1px] h-full bg-[#E5E7EB]" />
            {/* Right Side */}
            <div
              className={`flex flex-col justify-between min-w-[240px] transition-all duration-500 ${
                showRightSide
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    <span className="text-[#1DBA50] font-medium">Ongoing task</span>
                  </div>
                  <img
                    src={"/assets/maximize-task-icon.svg"}
                    alt="collapse"
                    className="w-4 h-4 cursor-pointer"
                    onClick={toggleExpand}
                  />
                </div>
                <div className="mb-2">
                  <span className="text-[#8F95B2] text-sm">Task Type</span>
                  <div className="font-semibold text-[#121212]">{service.name}</div>
                </div>
                <div className="w-full h-[1px] bg-[#E5E7EB] mb-2" />
                <div className="mb-2">
                  <span className="text-[#8F95B2] text-sm">ETA</span>
                  <div className="font-semibold text-[#121212]">~2 mins</div>
                </div>
                <div className="w-full h-[1px] bg-[#E5E7EB] mb-2" />
                <div className="mb-2">
                  <span className="text-[#8F95B2] text-sm">Credits</span>
                  <div className="flex items-center gap-1 font-semibold text-[#FF4D29]">
                    <img
                      src="/assets/ensemble-highlighted-icon.svg"
                      alt="credits"
                      className="w-4 h-4 inline-block"
                    />
                    {service.price}
                  </div>
                </div>
              </div>
              <button
                className={`mt-2 rounded-full px-6 py-2 transition flex items-center justify-center gap-2 text-white ${
                  isFormValid && !isCreating
                    ? "bg-primary"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleCreateTask}
                disabled={!isFormValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-semibold text-white">Creating...</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-white">Start Task</span>
                    <img
                      src="/assets/ensemble-white-icon.svg"
                      alt="ensemble"
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-white">
                      {service.price}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
