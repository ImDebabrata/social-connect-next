"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "./action";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import RouteConfig from "@/constrants/RouteConfig";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  resetPasswordClientSchema,
  ResetPasswordClientValues,
} from "@/lib/validation";

export default function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ResetPasswordClientValues>({
    resolver: zodResolver(resetPasswordClientSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordClientValues) {
    setError(undefined);
    startTransition(async () => {
      const { error, success } = await resetPassword({
        password: values.password,
        token,
      });

      if (success) {
        setIsSuccess(true);
        toast({
          title: "Password reset successfully",
          description: "You can now log in with your new password.",
        });
        setTimeout(() => {
          router.push(`${RouteConfig.authScreens.SIGN_IN}?reset=true`);
        }, 1500);
      }

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        setError(error);
      }
    });
  }

  if (isSuccess) {
    return (
      <div className="space-y-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Password updated!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your password has been changed successfully. Redirecting you to login…
          </p>
        </div>

        <Button asChild className="w-full font-medium">
          <Link href={`${RouteConfig.authScreens.SIGN_IN}?reset=true`}>
            Proceed to log in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          loading={isPending}
          type="submit"
          className="w-full font-medium"
        >
          Update password
        </LoadingButton>
      </form>
    </Form>
  );
}
