import { TaskStatus } from "@/enum/taskstatus";
import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function getTaskStatusText(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.CREATED:
      return "CREATED";
    case TaskStatus.ASSIGNED:
      return "ASSIGNED";
    case TaskStatus.COMPLETED:
      return "COMPLETED";
    case TaskStatus.FAILED:
      return "FAILED";
    default:
      return "UNKNOWN";
  }
}

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor Raw focusInput [v0.0.1]

export const switchFocusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
]
