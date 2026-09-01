"use client";

import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "./action";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, MailCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotForm() {
  const [error, setError] = useState<string>();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setError(undefined);
    startTransition(async () => {
      const { error, success } = await forgotPassword(values);
      if (success) {
        setSubmittedEmail(values.email);
        toast({
          title: "Reset link sent",
          description: "If an account exists with this email, a reset link was sent.",
        });
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

  if (submittedEmail) {
    return (
      <div className="space-y-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Check your inbox
          </h2>
          <p className="text-sm text-muted-foreground">
            If an account matches <span className="font-medium text-foreground">{submittedEmail}</span>, we&apos;ve sent a password reset link.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Button asChild className="w-full font-medium">
            <Link href="/sign-in">
              Return to log in
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSubmittedEmail(null);
              form.reset();
            }}
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Didn&apos;t receive the email? Try again
          </Button>
        </div>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
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
          Send reset link
        </LoadingButton>
      </form>
    </Form>
  );
}
