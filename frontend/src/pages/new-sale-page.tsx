import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBasket,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Card,
  EmptyState,
  ErrorState,
  Input,
  Notice,
  PageHeader,
  Textarea,
} from "@/components/ui/primitives"
import {
  addToCart,
  cartTotal,
  salePayload,
  setCartQuantity,
  type CartLine,
} from "@/lib/cart"
import { formatCurrency } from "@/lib/format"
import { normalizeApiError } from "@/services/api/api-client"
import { getProducts } from "@/services/api/products/products.queries"
import { queryKeys } from "@/services/api/query-keys"
import { createSale } from "@/services/api/sales/sales.mutations"

export function NewSalePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [notes, setNotes] = useState("")
  const products = useQuery({
    queryKey: queryKeys.products.list({ isActive: true, limit: 100 }),
    queryFn: () => getProducts({ isActive: true, limit: 100 }),
  })
  const saleMutation = useMutation({
    mutationFn: () => createSale(salePayload(cart, notes)),
    onSuccess: async (sale) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stock.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ])
      navigate(`/sales/${sale.id}`, {
        state: { notice: "Sale completed successfully." },
      })
    },
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (products.data?.items ?? []).filter(
      (product) =>
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
    )
  }, [products.data, search])
  const total = cartTotal(cart)

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Sale"
        description="Select products and complete a new transaction."
      />
      {saleMutation.error ? (
        <Notice tone="danger">
          {normalizeApiError(saleMutation.error).message}
        </Notice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <div className="space-y-5">
          <Card className="p-4">
            <label className="relative block">
              <span className="sr-only">Search products</span>
              <Search className="absolute top-3 left-3 size-5 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by product name or SKU…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </Card>
          {products.isPending ? (
            <LoadingState label="Loading products…" />
          ) : products.isError ? (
            <ErrorState error={products.error} onRetry={() => products.refetch()} />
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState
                title="No products available"
                description="Try another search or add stock to an active product."
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((product) => {
                const inCart =
                  cart.find((line) => line.product.id === product.id)?.quantity ??
                  0
                return (
                  <Card key={product.id} className="flex flex-col p-5">
                    <span className="grid size-11 place-items-center rounded-xl bg-muted">
                      <Package className="size-5 text-muted-foreground" />
                    </span>
                    <h2 className="mt-4 font-semibold">{product.name}</h2>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <div>
                        <p className="font-semibold">
                          {formatCurrency(product.unitPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantityInStock} in stock
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={
                          product.quantityInStock === 0 ||
                          inCart >= product.quantityInStock
                        }
                        onClick={() =>
                          setCart((current) => addToCart(current, product))
                        }
                      >
                        <Plus /> Add
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <Card className="flex min-h-150 flex-col overflow-hidden xl:sticky xl:top-26 xl:max-h-[calc(100svh-7.5rem)]">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <ShoppingBasket className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Current Sale</h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {cart.reduce((sum, line) => sum + line.quantity, 0)} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <EmptyState
                title="Cart is currently empty"
                description="Add products from the catalog to start a sale."
              />
            ) : (
              <div className="space-y-3">
                {cart.map((line) => (
                  <div
                    key={line.product.id}
                    className="rounded-[var(--radius)] border p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{line.product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatCurrency(line.product.unitPrice)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${line.product.name}`}
                        onClick={() =>
                          setCart((current) =>
                            setCartQuantity(current, line.product.id, 0)
                          )
                        }
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          aria-label={`Decrease ${line.product.name}`}
                          onClick={() =>
                            setCart((current) =>
                              setCartQuantity(
                                current,
                                line.product.id,
                                line.quantity - 1
                              )
                            )
                          }
                        >
                          <Minus />
                        </Button>
                        <span className="min-w-7 text-center font-semibold">
                          {line.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          aria-label={`Increase ${line.product.name}`}
                          disabled={line.quantity >= line.product.quantityInStock}
                          onClick={() =>
                            setCart((current) =>
                              setCartQuantity(
                                current,
                                line.product.id,
                                line.quantity + 1
                              )
                            )
                          }
                        >
                          <Plus />
                        </Button>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(
                          Number(line.product.unitPrice) * line.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <Textarea
                  aria-label="Sale notes"
                  className="min-h-20"
                  placeholder="Optional sale notes"
                  value={notes}
                  maxLength={255}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            )}
          </div>

          <div className="border-t bg-muted/40 p-5">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Grand Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              No tax or VAT is added by the current API.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                disabled={cart.length === 0 || saleMutation.isPending}
                onClick={() => {
                  setCart([])
                  setNotes("")
                }}
              >
                Clear Sale
              </Button>
              <Button
                disabled={cart.length === 0 || saleMutation.isPending}
                onClick={() => saleMutation.mutate()}
              >
                {saleMutation.isPending ? "Completing…" : "Complete Sale"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
