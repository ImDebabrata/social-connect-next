/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  AxiosAdapter,
  AxiosBasicCredentials,
  AxiosProxyConfig,
  AxiosRequestTransformer,
  AxiosResponseTransformer,
  CancelToken,
  ResponseType,
} from "axios";
import Misc from "@/constrants/Misc";

export interface IAPIResponseType<TYPE> {
  success: boolean;
  data: TYPE;
  [Misc.API_RESPONSE_MESSAGE_KEY]: string;
}

export interface IAxiosOptions {
  transformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[];
  transformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[];
  paramsSerializer?: (params: unknown) => string;
  timeout?: number;
  timeoutErrorMessage?: string;
  withCredentials?: boolean;
  adapter?: AxiosAdapter;
  auth?: AxiosBasicCredentials;
  responseType?: ResponseType;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  validateStatus?: ((status: number) => boolean) | null;
  maxBodyLength?: number;
  maxRedirects?: number;
  socketPath?: string | null;
  httpAgent?: unknown;
  httpsAgent?: unknown;
  proxy?: AxiosProxyConfig | false;
  cancelToken?: CancelToken;
  decompress?: boolean;
}

const ENV = process.env;

export const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const AXIOS_REQUEST_CANCELLED = "AXIOS_REQUEST_CANCELLED";
//as of now jwt not required
const jwtToken: string | undefined = undefined;
// if (typeof window !== "undefined") {
//   jwtToken = localStorage.getItem(Misc.LS_JWT_TOKEN) || "";
// }

const getHeaders = (headers: any) => {
  const AuthorizationHeaders = { Authorization: "Bearer " + jwtToken };
  headers = {
    ...defaultHeaders,
    ...AuthorizationHeaders,
    ...headers,
  };
  return headers;
};

const ApiService = {
  post: (
    url: string,
    payload: any | FormData = {},
    headers = {},
    options: IAxiosOptions = {},
    progressCallback: (progress: number) => void = (progress) => {
      console.log(progress, "uploading");
    }
  ): Promise<IAPIResponseType<any>> => {
    if (payload instanceof FormData) {
      headers = { ...headers, "Content-Type": "multipart/form-data" };
    }
    const axiosOptions: AxiosRequestConfig = {
      headers: getHeaders(headers),
      ...options,
      onUploadProgress: uploadProgressHandler.bind(null, progressCallback),
    };
    const request = axios.post(url, payload, axiosOptions);
    return getRequestPromise(request);
  },
  patch: (
    url: string,
    payload = {},
    headers = {},
    options: IAxiosOptions = {},
    progressCallback: (progress: number) => void = (progress) => {
      console.log(progress, "uploading");
    }
  ): Promise<IAPIResponseType<any>> => {
    const axiosOptions: AxiosRequestConfig = {
      headers: getHeaders(headers),
      ...options,
      onUploadProgress: uploadProgressHandler.bind(null, progressCallback),
    };
    const request = axios.patch(url, payload, axiosOptions);
    return getRequestPromise(request);
  },

  put: (
    url: string,
    payload: any | FormData = {},
    headers = {},
    options: IAxiosOptions = {},
    progressCallback: (progress: number) => void = (progress) => {
      console.log(progress, "uploading");
    }
  ): Promise<IAPIResponseType<any>> => {
    if (payload instanceof FormData) {
      headers = { ...headers, "Content-Type": "multipart/form-data" };
    }
    const axiosOptions: AxiosRequestConfig = {
      headers: getHeaders(headers),
      ...options,
      onUploadProgress: uploadProgressHandler.bind(null, progressCallback),
    };
    const request = axios.put(url, payload, axiosOptions);
    return getRequestPromise(request);
  },
  get: (
    url: string,
    payload = {},
    headers = {},
    options: IAxiosOptions = {}
  ): Promise<IAPIResponseType<any>> => {
    const axiosOptions: AxiosRequestConfig = {
      headers: getHeaders(headers),
      params: payload,
      ...options,
    };
    const request = axios.get(url, axiosOptions);
    return getRequestPromise(request);
  },
  delete: (
    url: string,
    payload = {},
    headers = {},
    options: IAxiosOptions = {}
  ): Promise<IAPIResponseType<any>> => {
    // options = getParsedOptions(headers, options);
    const axiosOptions: AxiosRequestConfig = {
      headers: getHeaders(headers),
      data: payload,
      ...options,
    };
    const request = axios.delete(url, axiosOptions);
    return getRequestPromise(request);
  },
};

const uploadProgressHandler = (
  progressCallback: (progress: number) => void,
  progressEvent: any
) => {
  if (progressCallback) {
    const percentFraction = progressEvent.loaded / progressEvent.total;
    const percent = Math.floor(percentFraction * 100);
    progressCallback(percent);
  }
};

const getRequestPromise = (request: Promise<AxiosResponse>) => {
  return new Promise<any>((resolve, reject) => {
    request
      .then((resp) => {
        if (ENV.ENABLE_HTTP_LOGS) {
          // console.log('====>>>>>>', resp.data);
        }
        setTimeout(() => {
          resolve({ ...resp.data, status: resp.status });
        }, 300);
      })
      .catch((err: any) => {
        if (ENV.ENABLE_HTTP_LOGS) {
          // console.error('=====>', err, 'API Error');
        }
        // console.log("=====>", err.response, "Api Function Catch");
        try {
          const response: any = err.response ? err.response : { data: null };
          const error: any = response.data
            ? { ...response.data }
            : { status: 500 };
          error.status = response.status ? parseInt(response.status) : 500;

          // console.log("=====>Error", error, "RESPONSE", response);
          if (response.status === 401) {
            //user should logout
            // console.log("=====>", error, "Api Function Catch 401");
          }
          if (response.status === 403) {
            // Communications.ReloadStateSubject.next();
          }
          if (response.status === 404) {
            // console.log("=====>", error, "Api Function Catch 404 ");
          }
          if (axios.isCancel(err)) {
            error.status = 499;
            error.reason = AXIOS_REQUEST_CANCELLED;
          }
          setTimeout(() => {
            reject(error);
          }, 300);
        } catch (e) {
          console.error("=====>", e, "Api Function Catch");
        }
      });
  });
};

export default ApiService;
