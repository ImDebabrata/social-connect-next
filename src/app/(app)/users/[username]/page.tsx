import { getCurrentUser } from "@/app/action";
import TrendsSidebar from "@/components/TrendsSidebar";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });
  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.userId);
  return {
    title: `${user.displayName} (@${user.username}) - Social Connect`,
    description: user.bio || `${user.displayName}'s profile on Social Connect`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const loggedInUser = await getCurrentUser();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.userId);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <ProfileHeader user={user} loggedInUserId={loggedInUser.userId} />
        <ProfileTabs user={user} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
