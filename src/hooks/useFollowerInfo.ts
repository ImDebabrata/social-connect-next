import APIConfig from "@/constrants/ApiConfig";
import { FollowerInfo } from "@/lib/types";
import { fetchData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

function useFollowerInfo(userId:string,initialState:FollowerInfo) {
    const query=useQuery({
        queryKey:['follower-info',userId],
        queryFn:()=>fetchData<FollowerInfo>({
            // @ts-expect-error: Todo: to fix it later
            url:APIConfig.GET_FOLLOWER_INFO.URL(userId),
            method:APIConfig.GET_FOLLOWER_INFO.METHOD
        }),
        initialData:initialState,
        staleTime:Infinity
    })

    return query;
}

export default useFollowerInfo