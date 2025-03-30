import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment, { Moment } from "moment";
import ApiService from "./api.service";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: string | Moment | Date): string {
  // Check if the input is a valid moment date (whether it's a string or a moment object)
  const mDate = moment(date);

  if (!mDate.isValid()) {
    return "Invalid date";
  }

  const now = moment();
  const diffInSeconds = now.diff(mDate, 'seconds');

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  return mDate.fromNow();
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
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
