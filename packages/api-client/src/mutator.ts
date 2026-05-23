import axios, { type AxiosRequestConfig } from 'axios'

// EXPO_PUBLIC_API_URL is replaced at bundle time by Expo/Metro
const _env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
const API_BASE_URL = _env?.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source()
  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export type ErrorType<Error> = Error
export type BodyType<BodyData> = BodyData
