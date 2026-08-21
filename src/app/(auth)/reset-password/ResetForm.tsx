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
import { resetPasswordSchema, ResetPasswordValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "./action";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import RouteConfig from "@/constrants/RouteConfig";

export default function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema.omit({token:true})),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setError(undefined);
    startTransition(async () => {
      const { error, success } = await resetPassword({...values,token});
      if (success) {
        toast({
          title: "Password reset successfully",
          description: "You can now login with your new password.",
          variant: "default",
        });
        router.push(RouteConfig.authScreens.SIGN_IN);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <p className="text-center text-destructive">{error}</p>}
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
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Reset Password
        </LoadingButton>
      </form>
    </Form>
  );
}
