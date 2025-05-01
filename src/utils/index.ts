import { TaskStatus } from "@/enum/taskstatus";
import { Signer } from "@xmtp/browser-sdk";
import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toBytes } from "viem";

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

export function convertRatingToStars(rating: number | string): number {
  const numericRating = typeof rating === 'string' ? parseInt(rating, 10) : rating;
  const starRating = numericRating === 0 ? 0 : (numericRating / 25) + 1;
  return Number(starRating.toFixed(1));
}

export function convertStarsToRating(stars: number): number {
  return (stars - 1) * 25;
}

export const createEOASigner = (
  address: `0x${string}`,
  signMessage: (message: string) => Promise<string> | string,
): Signer => {
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await signMessage(message);
      return toBytes(signature);
    },
  };
};
