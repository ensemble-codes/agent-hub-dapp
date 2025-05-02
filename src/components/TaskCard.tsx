"use client";
import React from "react";
import Link from "next/link";
import StarRating from "./star-rating";
import { getTaskStatusText, getTaskStatusColor } from "@/utils";
import { TaskStatus } from "@/enum/taskstatus";

interface TaskCardProps {
  id: string;
  assignee: {
    name: string;
    id: string;
    metadata: {
      imageUri: string;
    };
  };
  title: string;
  skill: string;
  status: TaskStatus;
  rate: string;
  rating: string | number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  assignee,
  title,
  skill,
  status,
  rate,
  rating,
}) => {
  return (
    <div className="rounded-[16px] border border-[#D1D5DB] p-4 w-[300px] bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={
              assignee.metadata.imageUri.startsWith("https://")
                ? assignee.metadata.imageUri
                : `https://${assignee.metadata.imageUri}`
            }
            alt={assignee.name}
            className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D64F] rounded-full border border-white"></span>
        </div>
        <div>
          <div className="font-semibold text-[16px] text-[#121212] leading-tight">
            {assignee.name}
          </div>
          <div className="text-xs text-[#8F95B2] leading-tight">
            {assignee.id.slice(0, 4)}...{assignee.id.slice(-4)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#8F95B2] text-[15px] font-semibold">
            <img src="/assets/title-icon.svg" alt="title" className="w-4 h-4" />{" "}
            Title
          </div>
          <div className="text-[16px] text-[#121212] font-medium overflow-hidden text-ellipsis whitespace-nowrap w-[50%]">
            {title}
          </div>
        </div>
        <hr className="my-1 border-[#E5E7EB]" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#8F95B2] text-[15px] font-semibold">
            <img src="/assets/skill-icon.svg" alt="skill" className="w-4 h-4" />{" "}
            Skill
          </div>
          <div className="text-[16px] text-[#121212] font-medium">{skill}</div>
        </div>
        <hr className="my-1 border-[#E5E7EB]" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#8F95B2] text-[15px] font-semibold">
            <img src="/assets/created-at-icon.svg" className="w-4 h-4" />{" "}
            Status
          </div>
          <div className="text-[16px] text-[#121212] font-medium" style={{ color: getTaskStatusColor(Number(status)) }}>
            {getTaskStatusText(Number(status))}
          </div>
        </div>
        <hr className="my-1 border-[#E5E7EB]" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#8F95B2] text-[15px] font-semibold">
            <img src="/assets/rate-icon.svg" className="w-4 h-4" /> Rate
          </div>
          <div className="text-[18px] font-bold text-[#FE4600]">{rate}</div>
        </div>
        <hr className="my-1 border-[#E5E7EB]" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#8F95B2] text-[15px] font-semibold">
            <img src={"/assets/star-icon.svg"} className="w-4 h-4" /> Category
          </div>
          <div className="inline-flex items-center gap-2 bg-[#E6F0FF] rounded-[8px] px-3 py-1 text-[#121212] font-semibold text-[15px]">
            <StarRating rating={rating as string} />
          </div>
        </div>
      </div>
      <Link href={`/tasks/${id}`}>
        <button className="mt-4 w-full rounded-[50px] bg-[#FE4600] text-white font-semibold text-[18px] py-2 flex items-center justify-center gap-2 hover:bg-[#e04a00] transition-colors">
          View
          <img src="/assets/pixelated-arrow-icon.svg" alt="pixelated-arrow" />
        </button>
      </Link>
    </div>
  );
};

export default TaskCard;
