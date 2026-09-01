import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import ResetForm from "./ResetForm";
import AuthLayout from "../AuthLayout";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    return (
      <AuthLayout image={ImageConfig.ResetImage}>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Invalid or expired link
            </h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is missing or has expired. Please request a new link to reset your password.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full font-medium">
              <Link href="/forgot-password">
                Request new reset link
              </Link>
            </Button>
            <div>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back to log in
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout image={ImageConfig.ResetImage}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Please choose a secure password with at least 8 characters
          </p>
        </div>

        <ResetForm token={token} />

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
