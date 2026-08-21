import loginImage from "@/assets/login-image.png";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
// import GoogleSignInButton from "./google/GoogleSignInButton";
import ResetForm from "./ResetForm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function Page({
  searchParams,
}:{
  searchParams: Promise<{token?:string}>;
}) {
  const {token} = await searchParams;
  if(!token) {
    redirect("/forgot-password");
  }
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">
            Choose a new password
          </h1>
          <div className="space-y-5">
            {/* <GoogleSignInButton /> */}
            {/* <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span>OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div> */}
            <ResetForm  token={token}/>
            <Link href="/sign-in" className="block text-center hover:underline">
              Remember your password? Log in
            </Link>
          </div>
        </div>
        {/* TODO: use a dedicated thumbnail for reset screen */}
        <Image
          src={loginImage}
          alt=""
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
