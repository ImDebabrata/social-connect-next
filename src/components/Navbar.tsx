import Misc from "@/constrants/Misc";
import RouteConfig from "@/constrants/RouteConfig";
import Link from "next/link";
import React from "react";
import UserButton from "./UserButton";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap">
        <Link
          href={RouteConfig.protectedRoute.MAIN_SCREEN}
          className="text-2xl font-bold text-primary"
        >
          {Misc.APP_NAME}
        </Link>
        <UserButton />
      </div>
    </header>
  );
};

export default Navbar;
