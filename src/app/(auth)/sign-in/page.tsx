import ImageConfig from "@/constrants/ImageConfig";
import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import Misc from "@/constrants/Misc";
import AuthLayout from "../AuthLayout";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <AuthLayout image={ImageConfig.signinImage}>
      <h1 className="text-center text-3xl font-bold">
        Login to {Misc.APP_NAME}
      </h1>
      <div className="space-y-5">
        <LoginForm />
        <Link href="/sign-up" className="block text-center hover:underline">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
