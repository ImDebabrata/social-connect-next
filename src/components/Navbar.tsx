import Misc from "@/constrants/Misc";
import RouteConfig from "@/constrants/RouteConfig";
import Link from "next/link";
import React from "react";
import SearchField from "./SearchField";
import UserButton from "./UserButton";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3">
        <Link
          href={RouteConfig.protectedRoute.MAIN_SCREEN}
          className="text-2xl font-bold tracking-tight text-primary transition-opacity hover:opacity-90"
        >
          {Misc.APP_NAME}
        </Link>
        <div className="max-w-md flex-1 hidden sm:block">
          <SearchField />
        </div>
        <UserButton />
      </div>
    </header>
  );
};

export default Navbar;
