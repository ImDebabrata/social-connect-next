import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import Misc from "@/constrants/Misc";
import AuthLayout from "../AuthLayout";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ registered?: string; reset?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <AuthLayout image={ImageConfig.signinImage}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Log in to your {Misc.APP_NAME} account to continue
          </p>
        </div>

        {params.registered === "true" && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Account created successfully! Please log in.</span>
          </div>
        )}

        {params.reset === "true" && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Password updated successfully! Please log in with your new password.</span>
          </div>
        )}

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
