import { useToast } from "@/hooks/use-toast";
import {  PostsPage } from "@/lib/types";
import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "./actions";

export function useDeletePostMutation(){
    const {toast}=useToast();
    
    const queryClient=useQueryClient();

    const router=useRouter();
    const pathname=usePathname();

    const mutation=useMutation({
        mutationFn:deletePost,
        onSuccess:async (deletedPost)=>{
            const queryFilter:QueryFilters={queryKey:["post-feed"]}
            await queryClient.cancelQueries(queryFilter);
            queryClient.setQueriesData<InfiniteData<PostsPage,string|null>>(
                { queryKey: queryFilter.queryKey },
                (oldData?:InfiniteData<PostsPage,string|null>):InfiniteData<PostsPage,string|null> | undefined=>{
                    if(!oldData) return oldData;
                    return {
                        pageParams:oldData.pageParams,
                        pages:oldData.pages.map((page)=>{
                            return {
                                posts:page.posts.filter((post)=>post.id!==deletedPost.id),
                                nextCursor:page.nextCursor
                            }
                        })
                    }
                }
            )
            toast({
                description:"Post deleted"
            })
            if(pathname===`/post/${deletedPost.id}`){
                router.push(`/users/${deletedPost.userId}`);//Todo: Make route dynamic
            }
        },
        onError(error){
            console.log(error);
            toast({
                variant:"destructive",
                description:"Something went wrong. Please try again later"
            })
        }
    })

    return mutation;
    
}