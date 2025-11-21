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

// ============================================
// Socket Response Types
// ============================================

/**
 * Generic success response wrapper for socket callbacks
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Generic error response for socket callbacks
 */
export interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Combined response type for socket callbacks
 */
export type SocketResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================
// Socket Event Data Types
// ============================================

/**
 * Result structure for each conversation in the last messages list
 */
export interface LastMessageResult {
  userId: string;
  message: MessageData | null;
  unreadCount: number;
}

/**
 * Response structure for chat message events with success flag
 */
export interface ChatMessageResponse extends MessageData {
  success: boolean;
}

/**
 * Track unread messages between users
 */
export interface UnreadMessageCount {
  [receiverId: string]: {
    [senderId: string]: number;
  };
}
