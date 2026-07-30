import { LoaderCircle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div
      className="min-h-48 space-y-4 p-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin text-primary motion-reduce:animate-none" />
        {label}
      </div>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-4/5" />
      </div>
    </div>
  )
}
