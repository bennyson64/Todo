import { differenceInHours, isPast } from "date-fns";

export type TimeColor = "red" | "yellow" | "white";

export function getTimeRemainingColor(endAt: Date | string): TimeColor {
  const end = typeof endAt === "string" ? new Date(endAt) : endAt;
  const now = new Date();

  if (isPast(end)) {
    return "red";
  }

  const hoursRemaining = differenceInHours(end, now);

  if (hoursRemaining < 2) {
    return "red";
  }

  if (hoursRemaining <= 8) {
    return "yellow";
  }

  return "white";
}

export function getCardBackgroundClass(color: TimeColor): string {
  switch (color) {
    case "red":
      return "bg-red-100 border-red-300";
    case "yellow":
      return "bg-yellow-100 border-yellow-300";
    case "white":
      return "bg-white border-gray-200";
    default:
      return "bg-white border-gray-200";
  }
}
