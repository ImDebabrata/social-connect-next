enum HttpMethod {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PUT = "put",
  PATCH = "patch",
}

export interface IAPIConfig {
  [k: string]: {
    URL: string | ((...args: string[]) => string);
    METHOD: HttpMethod;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const APIConfig: IAPIConfig = {
  GET_POSTS: {
    URL: baseUrl + "/api/posts/for-you",
    METHOD: HttpMethod.GET,
  },
  GET_FOLLOWING_POSTS: {
    URL: baseUrl + "/api/posts/following",
    METHOD: HttpMethod.GET,
  },
  GET_USER_POSTS: {
    URL: (userId: string) => baseUrl + `/api/users/${userId}/posts`,
    METHOD: HttpMethod.GET,
  },
  GET_FOLLOWER_INFO: {
    URL: (userId: string) => baseUrl + `/api/users/${userId}/followers`,
    METHOD: HttpMethod.GET,
  },
  FOLLOW: {
    URL: (userId: string) => baseUrl + `/api/users/${userId}/followers`,
    METHOD: HttpMethod.POST,
  },
  UNFOLLOW: {
    URL: (userId: string) => baseUrl + `/api/users/${userId}/followers`,
    METHOD: HttpMethod.DELETE,
  },
  GET_USER_PROFILE: {
    URL: (username: string) => baseUrl + `/api/users/username/${username}`,
    METHOD: HttpMethod.GET,
  },
  UPLOAD_AVATAR: {
    URL: baseUrl + `/api/profile/avatar`,
    METHOD: HttpMethod.POST,
  },
  UPLOAD_MEDIA: {
    URL: baseUrl + `/api/posts/media`,
    METHOD: HttpMethod.POST,
  },
  LIKE_INFO: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/likes`,
    METHOD: HttpMethod.GET,
  },
  LIKE_POST: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/likes`,
    METHOD: HttpMethod.POST,
  },
  UNLIKE_POST: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/likes`,
    METHOD: HttpMethod.DELETE,
  },
  GET_BOOKMARKED_POSTS: {
    URL: baseUrl + "/api/posts/bookmarked",
    METHOD: HttpMethod.GET,
  },
  BOOKMARK_INFO: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/bookmark`,
    METHOD: HttpMethod.GET,
  },
  BOOKMARK_POST: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/bookmark`,
    METHOD: HttpMethod.POST,
  },
  UNBOOKMARK_POST: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/bookmark`,
    METHOD: HttpMethod.DELETE,
  },
  GET_COMMENTS: {
    URL: (postId: string) => baseUrl + `/api/posts/${postId}/comments`,
    METHOD: HttpMethod.GET,
  },
};

export default APIConfig;
