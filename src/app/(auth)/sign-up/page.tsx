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
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">Sign up to {Misc.APP_NAME}</h1>
        <p className="text-muted-foreground">
          A place where even <span className="italic">you</span> can find a
          friend.
        </p>
      </div>
      <div className="space-y-5">
        <SignUpForm />
        <Link href="/sign-in" className="block text-center hover:underline">
          Already have an account? Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
