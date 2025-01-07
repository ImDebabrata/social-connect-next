'use client'
import { getCurrentUser } from "@/app/action";
import { useQuery } from "@tanstack/react-query";

export const useCurrentSession = () => {
  const { data, isError, isLoading, isFetched } = useQuery({
    queryKey: ["current user info"],
    staleTime: Infinity,
    queryFn: getCurrentUser,
  });
  return {
    user: data,
    isError,
    isLoading,
    isFetched,
  };
};
