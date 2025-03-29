import { CommentData } from "@/lib/types";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import RouteConfig from "@/constrants/RouteConfig";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  return (
    <div className="flex gap-3 py-3">
      <span className="hidden sm:inline ">
        <UserTooltip user={comment.user}>
          <Link
            href={RouteConfig.protectedRoute.PROFILE.replace(
              ":id",
              comment.user.username
            )}
          >
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              href={RouteConfig.protectedRoute.PROFILE.replace(
                ":id",
                comment.user.username
              )}
              className="font-medium hover:underline"
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <div>{comment.content}</div>
      </div>
    </div>
  );
}
