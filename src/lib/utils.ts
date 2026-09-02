import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs, { type ConfigType } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApiService from "./api.service";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3 minutes ago" style relative label (posts, comments). */
export function formatRelativeDate(date: ConfigType): string {
  const d = dayjs(date);
  if (!d.isValid()) return "Invalid date";

  const diffInSeconds = dayjs().diff(d, "second");
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

  return d.fromNow();
}

/** Absolute date, e.g. "04 Jul 2026" (profile "member since"). */
export function formatDate(date: ConfigType): string {
  return dayjs(date).format("DD MMM YYYY");
}

/** Clock time for a message bubble, e.g. "2:32 PM". */
export function formatMessageTime(date: ConfigType): string {
  return dayjs(date).format("h:mm A");
}

/** Day separator inside a chat thread: "Today" / "Yesterday" / "Jul 4" / "Jul 4, 2025". */
export function formatDayLabel(date: ConfigType): string {
  const d = dayjs(date);
  const now = dayjs();
  if (d.isSame(now, "day")) return "Today";
  if (d.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
  return d.isSame(now, "year") ? d.format("MMM D") : d.format("MMM D, YYYY");
}

/** Compact timestamp for the conversation list: time today, else "Yesterday" / "Jul 4". */
export function formatChatListTime(date: ConfigType): string {
  const d = dayjs(date);
  const now = dayjs();
  if (d.isSame(now, "day")) return d.format("h:mm A");
  if (d.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
  return d.format("MMM D");
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Safely parses and clamps a numeric pagination pageSize query parameter.
 */
export function parsePageSize(
  value: string | number | null | undefined,
  defaultSize = 10,
  min = 1,
  max = 50
): number {
  const parsed = Number(value);
  if (!parsed || Number.isNaN(parsed)) return defaultSize;
  return Math.min(Math.max(parsed, min), max);
}

// export const sendServerResponse={
//   onSuccess:function(data,message){
//     return {
//       success: true,
//       data: data,
//       [Misc.API_RESPONSE_MESSAGE_KEY]: "Post fetched success",
//     }
//   },
//   onError:function(message){

//   }
// }

export const fetchData = async <T>({
  method,
  url,
  payload,
  headers,
}: {
  method: string;
  url: string;
  payload?: object;
  headers?: object;
}) => {
  const apiCall = {
    get: ApiService.get,
    post: ApiService.post,
    put: ApiService.put,
    delete: ApiService.delete,
    patch:ApiService.patch
  }[method];

  if (!apiCall) {
    throw new Error(`Invalid HTTP method: ${method}`);
  }
  try {
    const response = await apiCall(url, payload, headers);
    return (response?.data || response) as T;
  } catch (error) {
    throw error;
  }
};
