import { Metadata } from "next";
import Chat from "./Chat";
export const metadata:Metadata={
    title:'Messages',
    description:'Messages page',
}

export default function Messages(){
    return <Chat/>
}