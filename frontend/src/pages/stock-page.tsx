import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowDownToLine, SlidersHorizontal } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Badge,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Notice,
  PageHeader,
  Pagination,
  Select,
  Textarea,
} from "@/components/ui/primitives"
import { formatDate, titleCase } from "@/lib/format"
import { normalizeApiError } from "@/services/api/api-client"
import { getProducts } from "@/services/api/products/products.queries"
import { queryKeys } from "@/services/api/query-keys"
import { createStockAdjustment } from "@/services/api/stock/stock.mutations"
import { getStockMovements } from "@/services/api/stock/stock.queries"
import type { StockMovementQuery, StockMovementType } from "@/types/api"

const adjustmentSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  type: z.enum(["RESTOCK", "ADJUSTMENT_IN", "ADJUSTMENT_OUT"]),
  quantity: z
    .string()
    .regex(/^[1-9]\d*$/, "Enter a quantity greater than zero"),
  reason: z.string().trim().min(3, "Use at least 3 characters").max(255),
})

type AdjustmentValues = z.infer<typeof adjustmentSchema>

function toneForMovement(type: StockMovementType) {
  if (type === "RESTOCK" || type === "ADJUSTMENT_IN" || type === "SALE_VOID")
    return "success"
  if (type === "ADJUSTMENT_OUT" || type === "SALE") return "warning"
  return "neutral"
}

export function StockPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [adjusting, setAdjusting] = useState(false)
  const [notice, setNotice] = useState("")
  const query: StockMovementQuery = {
    productId: params.get("productId")
      ? Number(params.get("productId"))
      : undefined,
    type: (params.get("type") as StockMovementType) || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
    page: Number(params.get("page") ?? 1),
    limit: 20,
  }
  const movements = useQuery({
    queryKey: queryKeys.stock.movements(query),
    queryFn: () => getStockMovements(query),
    placeholderData: (previous) => previous,
  })
  const products = useQuery({
    queryKey: queryKeys.products.list({ isActive: true, limit: 100 }),
    queryFn: () => getProducts({ isActive: true, limit: 100 }),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustmentValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: params.get("productId") ?? "",
      type: "RESTOCK",
      quantity: "",
      reason: "",
    },
  })
  const adjust = useMutation({
    mutationFn: (values: AdjustmentValues) =>
      createStockAdjustment({
        productId: Number(values.productId),
        type: values.type,
        quantity: Number(values.quantity),
        reason: values.reason,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stock.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ])
      reset()
      setAdjusting(false)
      setNotice("Stock level adjusted successfully.")
    },
  })

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== "page") next.delete("page")
    setParams(next)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Management"
        description="Review inventory movement and adjust stock levels."
        action={
          <Button onClick={() => setAdjusting(true)}>
            <SlidersHorizontal /> Adjust Stock
          </Button>
        }
      />
      {notice ? <Notice>{notice}</Notice> : null}

      <Card className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-5">
        <Select
          aria-label="Filter by product"
          value={params.get("productId") ?? ""}
          onChange={(event) =>
            updateParam("productId", event.target.value || undefined)
          }
        >
          <option value="">All products</option>
          {products.data?.items.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by movement type"
          value={params.get("type") ?? ""}
          onChange={(event) =>
            updateParam("type", event.target.value || undefined)
          }
        >
          <option value="">All movement types</option>
          {[
            "OPENING_STOCK",
            "RESTOCK",
            "ADJUSTMENT_IN",
            "ADJUSTMENT_OUT",
            "SALE",
            "SALE_VOID",
          ].map((type) => (
            <option key={type} value={type}>
              {titleCase(type)}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          aria-label="From date"
          value={params.get("from") ?? ""}
          onChange={(event) => updateParam("from", event.target.value || undefined)}
        />
        <Input
          type="date"
          aria-label="To date"
          value={params.get("to") ?? ""}
          onChange={(event) => updateParam("to", event.target.value || undefined)}
        />
        <Button
          variant="outline"
          onClick={() => {
            setParams({})
          }}
        >
          Clear filters
        </Button>
      </Card>

      <Card className="overflow-hidden">
        {movements.isPending ? (
          <LoadingState label="Loading stock movements…" />
        ) : movements.isError ? (
          <ErrorState
            error={movements.error}
            onRetry={() => movements.refetch()}
          />
        ) : movements.data.items.length === 0 ? (
          <EmptyState
            title="No stock movements"
            description="Try different filters or record a stock adjustment."
            action={
              <Button onClick={() => setAdjusting(true)}>Adjust Stock</Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Stock change</th>
                    <th>Reason</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.data.items.map((movement) => (
                    <tr key={movement.id}>
                      <td>{formatDate(movement.createdAt)}</td>
                      <td>
                        <Link
                          to={`/products/${movement.productId}`}
                          className="font-medium hover:text-primary"
                        >
                          {movement.productName}
                        </Link>
                        <p className="font-mono text-xs text-muted-foreground">
                          {movement.productSku}
                        </p>
                      </td>
                      <td>
                        <Badge tone={toneForMovement(movement.type)}>
                          {titleCase(movement.type)}
                        </Badge>
                      </td>
                      <td className="font-semibold">{movement.quantity}</td>
                      <td>
                        {movement.previousStock} → {movement.newStock}
                      </td>
                      <td className="max-w-xs">{movement.reason}</td>
                      <td className="font-mono text-xs">
                        {movement.referenceNumber || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={movements.data.pagination.page}
              totalPages={movements.data.pagination.totalPages}
              onPageChange={(page) => updateParam("page", String(page))}
            />
          </>
        )}
      </Card>

      <Dialog
        open={adjusting}
        title="Adjust Stock Levels"
        description="Record a restock or a manual inventory correction."
        onClose={() => setAdjusting(false)}
      >
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => adjust.mutate(values))}
        >
          {adjust.error ? (
            <Notice tone="danger">{normalizeApiError(adjust.error).message}</Notice>
          ) : null}
          <Field label="Product" error={errors.productId?.message}>
            <Select {...register("productId")}>
              <option value="">Select a product</option>
              {products.data?.items.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.quantityInStock})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Adjustment type" error={errors.type?.message}>
            <Select {...register("type")}>
              <option value="RESTOCK">Restock / Add</option>
              <option value="ADJUSTMENT_IN">Adjustment In / Add</option>
              <option value="ADJUSTMENT_OUT">Adjustment Out / Remove</option>
            </Select>
          </Field>
          <Field label="Quantity" error={errors.quantity?.message}>
            <Input inputMode="numeric" min="1" {...register("quantity")} />
          </Field>
          <Field label="Reason" error={errors.reason?.message}>
            <Textarea
              placeholder="Why is this stock changing?"
              {...register("reason")}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdjusting(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={adjust.isPending}>
              <ArrowDownToLine />
              {adjust.isPending ? "Saving…" : "Record Adjustment"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
