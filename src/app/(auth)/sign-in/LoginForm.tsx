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
import { Input } from "@/components/ui/input";
import { loginSchema, LoginValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guestSignin, signin } from "./action";
import Link from "next/link";
import { AlertCircle, UserCheck } from "lucide-react";

export default function LoginForm() {
  const [error, setError] = useState<string>();

  const [isPending, startTransition] = useTransition();
  const [isGuestPending, startGuestTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signin(values);
      if (error) setError(error);
    });
  }

  function onGuestLogin() {
    setError(undefined);
    startGuestTransition(async () => {
      const { error } = await guestSignin();
      if (error) setError(error);
    });
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username"
                  autoComplete="username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          loading={isPending}
          disabled={isGuestPending}
          type="submit"
          className="w-full font-medium"
        >
          Log in
        </LoadingButton>

        <div className="relative my-2 flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">
            or
          </span>
          <div className="w-full border-t border-border" />
        </div>

        <LoadingButton
          loading={isGuestPending}
          disabled={isPending}
          type="button"
          variant="outline"
          className="w-full border-border/80 font-medium"
          onClick={onGuestLogin}
        >
          <UserCheck className="size-4 shrink-0" />
          {isGuestPending ? "Waking up demo server…" : "Continue as Guest"}
        </LoadingButton>
        <p className="text-center text-xs text-muted-foreground">
          Exploring? Test full features instantly with our demo account.
        </p>
      </form>
    </Form>
  );
}
