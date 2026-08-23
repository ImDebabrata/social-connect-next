import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import ResetForm from "./ResetForm";
import { redirect } from "next/navigation";
import AuthLayout from "../AuthLayout";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    redirect("/forgot-password");
  }
  return (
    <AuthLayout image={ImageConfig.ResetImage}>
      <h1 className="text-center text-3xl font-bold">Choose a new password</h1>
      <div className="space-y-5">
        <ResetForm token={token} />
        <Link href="/sign-in" className="block text-center hover:underline">
          Remember your password? Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
