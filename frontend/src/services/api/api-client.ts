import axios, { AxiosError } from "axios"

import type {
  ApiEnvelope,
  ApiValidationError,
} from "@/types/api"

export class ApiError extends Error {
  status?: number
  fieldErrors: Record<string, string>

  constructor(
    message: string,
    options: { status?: number; fieldErrors?: Record<string, string> } = {}
  ) {
    super(message)
    this.name = "ApiError"
    this.status = options.status
    this.fieldErrors = options.fieldErrors ?? {}
  }
}

type ErrorPayload = {
  message?: string
  errors?: ApiValidationError[]
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof AxiosError) {
    const payload = error.response?.data as ErrorPayload | undefined
    const fieldErrors = Object.fromEntries(
      (payload?.errors ?? []).map((item) => [item.field, item.message])
    )

    return new ApiError(
      payload?.message ??
        (error.response
          ? "The request could not be completed."
          : "Unable to reach the Adom Shops API."),
      { status: error.response?.status, fieldErrors }
    )
  }

  return new ApiError(
    error instanceof Error ? error.message : "An unexpected error occurred."
  )
}

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error))
)

export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const response = await apiClient.get<ApiEnvelope<T>>(url, { params })
  return response.data.data
}

export async function apiPost<T>(url: string, body?: object): Promise<T> {
  const response = await apiClient.post<ApiEnvelope<T>>(url, body)
  return response.data.data
}

export async function apiPatch<T>(url: string, body: object): Promise<T> {
  const response = await apiClient.patch<ApiEnvelope<T>>(url, body)
  return response.data.data
}
