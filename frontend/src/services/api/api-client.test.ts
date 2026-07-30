import { AxiosError, type AxiosResponse } from "axios"
import { describe, expect, it } from "vitest"

import { normalizeApiError } from "@/services/api/api-client"

describe("API error normalization", () => {
  it("maps validation errors to fields", () => {
    const response = {
      status: 400,
      data: {
        success: false,
        message: "Validation failed",
        errors: [{ field: "sku", message: "SKU is required" }],
      },
    } as AxiosResponse
    const error = new AxiosError(
      "Bad request",
      "400",
      undefined,
      undefined,
      response
    )
    const normalized = normalizeApiError(error)

    expect(normalized.message).toBe("Validation failed")
    expect(normalized.status).toBe(400)
    expect(normalized.fieldErrors).toEqual({ sku: "SKU is required" })
  })

  it("preserves conflict messages", () => {
    const response = {
      status: 409,
      data: { success: false, message: "A record already exists" },
    } as AxiosResponse
    const error = new AxiosError(
      "Conflict",
      "409",
      undefined,
      undefined,
      response
    )

    expect(normalizeApiError(error).message).toBe("A record already exists")
  })
})
