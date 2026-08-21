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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <p className="text-center text-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link href="/forgot-password" className="block text-right hover:underline">Forgot password?</Link>
        <LoadingButton
          loading={isPending}
          disabled={isGuestPending}
          type="submit"
          className="w-full"
        >
          Log in
        </LoadingButton>

        <LoadingButton
          loading={isGuestPending}
          disabled={isPending}
          type="button"
          variant="secondary"
          className="w-full"
          onClick={onGuestLogin}
        >
          {isGuestPending ? "Waking up the server…" : "Continue as guest"}
        </LoadingButton>
        <p className="text-center text-xs text-muted-foreground">
          Just exploring? Skip the sign-up. Hosted on a free tier, so the first
          load can take up to a minute while the server wakes up.
        </p>
      </form>
    </Form>
  );
}
