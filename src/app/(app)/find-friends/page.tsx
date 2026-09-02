import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import React from "react";
import FindFriendsView from "./FindFriendsView";

export const metadata: Metadata = {
  title: "Find Friends - Social Connect",
  description: "Discover new friends and connect with community members.",
};

export default function FindFriendsPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0">
        <FindFriendsView />
      </div>
      <TrendsSidebar />
    </main>
  );
}
