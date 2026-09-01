import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import Misc from "@/constrants/Misc";
import AuthLayout from "../AuthLayout";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <AuthLayout image={ImageConfig.signupImage}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join {Misc.APP_NAME} to share posts, chat, and connect
          </p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
