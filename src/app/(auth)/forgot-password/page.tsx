import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "./ForgotForm";
import AuthLayout from "../AuthLayout";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function Page() {
  return (
    <AuthLayout image={ImageConfig.ForgotImage}>
      <h1 className="text-center text-3xl font-bold">
        Forgot your password? Let&apos;s reset it.
      </h1>
      <div className="space-y-5">
        <ForgotForm />
        <Link href="/sign-in" className="block text-center hover:underline">
          Remember your password? Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
