"use client";

import ImageConfig from "@/constrants/ImageConfig";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { Input } from "./ui/input";

function SearchField() {
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const q = (form.q as HTMLInputElement).value.trim();
      if (!q) return;
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [router]
  );

  const handleSearchIconClick = (e: React.MouseEvent<SVGElement>) => {
    const form = e.currentTarget.closest("form");
    if (form) form.requestSubmit();
  };

  return (
    <form onSubmit={handleSubmit} action="/search">
      <div className="relative">
        <Input
          name="q"
          placeholder="Search people, hashtags, posts..."
          className="h-10 w-full rounded-full bg-muted/50 pe-10 pl-4 text-sm transition-colors focus-visible:bg-card"
        />
        <ImageConfig.SearchIcon
          onClick={handleSearchIconClick}
          className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        />
      </div>
    </form>
  );
}

export default SearchField;
