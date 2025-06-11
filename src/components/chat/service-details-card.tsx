"use client";
import { FC, useState } from "react";
import { useWalletClient } from "wagmi";
import { config } from "../onchainconfig/config";
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
  userAddress,
  agentAddress,
  onCreateTask,
}) => {
  const { data: walletClient } = useWalletClient({
    config: config,
  });
  const sdk = useSdk(walletClient);

  const [inputs, setInputs] = useState<Record<string, string>>(
    Object.fromEntries(service.parameters.map((p) => [p.name, ""]))
  );
  const [notes, setNotes] = useState("");

  const handleInputChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async () => {
    // Generate a human-readable prompt from the details
    const paramString = Object.entries(inputs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    
    // Only include targetAudience if it's provided by the user
    const targetAudience = inputs.targetAudience ? `\nTarget Audience: ${inputs.targetAudience}` : '';
    
    const prompt = `Create a task for service '${service.name}' (ID: ${service.id}) with parameters: { ${paramString} } for ${service.price} ${service.currency}. Notes: ${notes || "None"}${targetAudience}`;
    
    console.log("Attempting to create task with SDK...");
    const task = await sdk?.createTask({
      prompt,
      proposalId: '1'
    });
    console.log("SDK task creation response:", task);
    
    onCreateTask(prompt);
    sendGAEvent("create_task", {
      agentId: agentAddress,
      taskId: task?.id,
      proposalId: '1',
      service: service.name,
    });
  };

  // Check if required fields are filled
  const isFormValid = inputs.project_name?.trim() && inputs.key_features?.trim();

  return (
    <div className="z-[1] border border-[#E5E7EB] rounded-xl bg-white flex flex-col md:flex-row p-4 gap-4 max-w-[676px] w-full">
      {/* Left Side */}
      <div className="flex-1 min-w-[220px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[#FF4D29] font-bold text-lg flex items-center gap-2"><img src="/assets/multi-stars-shape-icon.svg" alt="stars" className="w-5 h-5" /> {service.name}</div>
        </div>
        <div className="text-[#8F95B2] text-sm mb-4">{service.description}</div>
        {service.parameters.map((param) => (
          <div key={param.name} className="mb-4">
            <div className="font-semibold text-[#121212]">
              {param.name.replace(/_/g, " ")}{param.required && <span className="text-[#FF4D29]">*</span>}
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
      {/* Right Side */}
      <div className="flex flex-col justify-between min-w-[240px]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-[#1DBA50] font-medium">Ongoing task</span>
          </div>
          <div className="mb-2">
            <span className="text-[#8F95B2] text-sm">Task Type</span>
            <div className="font-semibold text-[#121212]">{service.name}</div>
          </div>
          <div className="mb-2">
            <span className="text-[#8F95B2] text-sm">ETA</span>
            <div className="font-semibold text-[#121212]">~2 mins</div>
          </div>
          <div className="mb-2">
            <span className="text-[#8F95B2] text-sm">Credits</span>
            <div className="flex items-center gap-1 font-semibold text-[#FF4D29]">
              <img src="/assets/ensemble-highlighted-icon.svg" alt="credits" className="w-4 h-4 inline-block" />
              {service.price}
            </div>
          </div>
        </div>
        <button
          className={`mt-2 rounded-full px-6 py-2 transition flex items-center justify-center gap-2 text-white ${
            isFormValid ? 'bg-primary' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleCreateTask}
          disabled={!isFormValid}
        >
          <span className="font-semibold text-white">Start Task</span>
          <img src="/assets/ensemble-white-icon.svg" alt="ensemble" className="w-5 h-5" />
          <span className="font-semibold text-white">{service.price}</span>
        </button>
      </div>
    </div>
  );
}; 