export interface UserData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  followers: {
    followerId: string;
  }[];
  _count: {
    posts: number;
    followers: number;
  };
}

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  };
}

export interface MessageData {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}
