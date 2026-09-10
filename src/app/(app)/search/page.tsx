import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import React, { Suspense } from "react";
import SearchResults from "./SearchResults";
import { LoadingIcon } from "@/constrants/ImageConfig";

export const metadata: Metadata = {
  title: "SearchIcon - Social Connect",
  description: "SearchIcon people and posts on Social Connect.",
};

export default function SearchPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0">
        <Suspense
          fallback={
            <LoadingIcon className="mx-auto my-10 animate-spin text-primary" />
          }
        >
          <SearchResults />
        </Suspense>
      </div>
      <TrendsSidebar />
    </main>
  );
}
