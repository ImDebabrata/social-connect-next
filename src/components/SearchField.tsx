"use client";

import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import ImageConfig from "@/constrants/ImageConfig";
import { useCallback } from "react";

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
  // This is the function to trigger form submission
  const handleSearchIconClick = (e: React.MouseEvent<SVGElement>) => {
    const form = e.currentTarget.closest("form"); // Get the parent form
    if (form) form.submit(); // Trigger form submission
  };
  return (
    <form onSubmit={handleSubmit} action="/search">
      <div className="relative">
        <Input name="q" placeholder="Search" className="pe-10" />
        <ImageConfig.SearchIcon
          onClick={handleSearchIconClick}
          className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground cursor-pointer"
        />
      </div>
    </form>
  );
}

export default SearchField;
