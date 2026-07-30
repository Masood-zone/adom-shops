import { LoaderCircle } from "lucide-react"

import { Card } from "@/components/ui/primitives"
import { Skeleton } from "@/components/ui/skeleton"

const METRIC_SKELETONS = Array.from({ length: 4 }, (_, index) => index)
const TABLE_ROWS = Array.from({ length: 5 }, (_, index) => index)

export function RouteLoadingSkeleton() {
  return (
    <div
      className="space-y-7"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="space-y-3">
          <Skeleton className="h-8 w-52 sm:w-72" />
          <Skeleton className="h-4 w-64 max-w-[70vw] sm:w-96" />
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin text-primary motion-reduce:animate-none" />
          Loading
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_SKELETONS.map((item) => (
          <Card key={item} className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="divide-y">
          {TABLE_ROWS.map((row) => (
            <div
              key={row}
              className="grid grid-cols-[2fr_1fr_1fr] items-center gap-5 px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="ml-auto h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
      <span className="sr-only">Loading page content…</span>
    </div>
  )
}
