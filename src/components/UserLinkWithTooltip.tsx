import APIConfig from "@/constrants/ApiConfig";
import RouteConfig from "@/constrants/RouteConfig";
import { UserData } from "@/lib/types";
import { fetchData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

function UserLinkWithTooltip(props: UserLinkWithTooltipProps) {
  const { username, children } = props;

  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      fetchData<UserData>({
        // @ts-expect-error: Todo: to fix it later
        url: APIConfig.GET_USER_PROFILE.URL(username),
        method: APIConfig.GET_USER_PROFILE.METHOD,
      }),
    retry(failureCount, error:{status:number}) {
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
      
    },
    staleTime: Infinity,
  });

  if (!data) {
    return (
      <Link
        href={RouteConfig.protectedRoute.PROFILE.replace(":username", username)}
        className="text-blue-600 hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <UserTooltip user={data}>
      <Link
        href={RouteConfig.protectedRoute.PROFILE.replace(":username", username)}
        className="text-blue-600 hover:underline"
      >
        {children}
      </Link>
    </UserTooltip>
  );
}

export default UserLinkWithTooltip;
