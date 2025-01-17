import { TaskStatus } from "@/enum/taskstatus";

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
