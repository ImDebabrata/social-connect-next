import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "./ForgotForm";
import AuthLayout from "../AuthLayout";
import { ArrowLeft, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function Page() {
  return (
    <AuthLayout image={ImageConfig.ForgotImage}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a password reset link
          </p>
        </div>

        <ForgotForm />

        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to log in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
