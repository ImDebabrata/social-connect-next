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
};

export default APIConfig;
