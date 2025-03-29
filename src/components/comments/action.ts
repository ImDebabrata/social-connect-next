'use server'

import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { PostData, getCommentDataInclude } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({post,content}:{post:PostData,content:string}){
    const user = await getCurrentUser();
    if(!user) throw new Error("Unauthorized");

    const {content:contentValidated}=createCommentSchema.parse({content});

    const newComment= await prisma.comment.create({
        data:{
            content:contentValidated,
            postId:post.id,
            userId:user.userId,

        },
        include:getCommentDataInclude(user.userId)
    })


    return newComment;
}