import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RouteLoadingSkeleton } from "@/components/layout/route-loading-skeleton"

describe("RouteLoadingSkeleton", () => {
  it("announces loading while rendering a structured page placeholder", () => {
    const { container } = render(<RouteLoadingSkeleton />)

    expect(
      screen.getByRole("status", { name: "Loading page content" })
    ).toBeInTheDocument()
    expect(screen.getByText("Loading")).toBeInTheDocument()
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(
      10
    )
  })
})
