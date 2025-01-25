import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment, { Moment } from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: string | Moment | Date): string {
  // Check if the input is a valid moment date (whether it's a string or a moment object)
  const mDate = moment(date);

  if (!mDate.isValid()) {
    return "Invalid date";
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
