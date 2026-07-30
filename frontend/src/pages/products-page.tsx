import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Badge,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  Notice,
  PageHeader,
  Pagination,
  Select,
} from "@/components/ui/primitives"
import { formatCurrency, getStockStatus, number } from "@/lib/format"
import { normalizeApiError } from "@/services/api/api-client"
import { getCategories } from "@/services/api/categories/categories.queries"
import { deactivateProduct } from "@/services/api/products/products.mutations"
import { getProducts } from "@/services/api/products/products.queries"
import { queryKeys } from "@/services/api/query-keys"
import type { Product, ProductQuery } from "@/types/api"

function ProductStatus({ product }: { product: Product }) {
  const status = getStockStatus(product)
  const labels = {
    healthy: "Healthy",
    low: "Low stock",
    out: "Out of stock",
    inactive: "Inactive",
  }
  const tones = {
    healthy: "success",
    low: "warning",
    out: "danger",
    inactive: "neutral",
  } as const
  return <Badge tone={tones[status]}>{labels[status]}</Badge>
}

export function ProductsPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [searchDraft, setSearchDraft] = useState(params.get("search") ?? "")
  const [deactivating, setDeactivating] = useState<Product | null>(null)
  const query: ProductQuery = {
    search: params.get("search") || undefined,
    categoryId: params.get("categoryId")
      ? Number(params.get("categoryId"))
      : undefined,
    isActive: params.get("inactive") === "true" ? undefined : true,
    lowStock:
      params.get("stock") === "low"
        ? true
        : params.get("stock") === "healthy"
          ? false
          : undefined,
    page: Number(params.get("page") ?? 1),
    limit: 20,
  }
  const products = useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => getProducts(query),
    placeholderData: (previous) => previous,
  })
  const categories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })
  const deactivate = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ])
      setDeactivating(null)
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
        title="Products"
        description="Manage your store catalog and inventory levels."
        action={
          <Button
            render={<Link to="/products/new" />}
          >
            <Plus /> Add Product
          </Button>
        }
      />

      <Card className="grid gap-4 p-4 lg:grid-cols-[1fr_14rem_14rem_auto]">
        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault()
            updateParam("search", searchDraft.trim() || undefined)
          }}
        >
          <Search className="absolute top-3 left-3 size-5 text-muted-foreground" />
          <Input
            aria-label="Search products"
            className="pl-10"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search SKU or product name…"
          />
        </form>
        <Select
          aria-label="Filter by category"
          value={params.get("categoryId") ?? ""}
          onChange={(event) =>
            updateParam("categoryId", event.target.value || undefined)
          }
        >
          <option value="">All categories</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by stock level"
          value={params.get("stock") ?? ""}
          onChange={(event) =>
            updateParam("stock", event.target.value || undefined)
          }
        >
          <option value="">All stock levels</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low and out of stock</option>
        </Select>
        <label className="flex h-11 items-center gap-2 px-2 text-sm">
          <input
            type="checkbox"
            checked={params.get("inactive") === "true"}
            onChange={(event) =>
              updateParam("inactive", event.target.checked ? "true" : undefined)
            }
          />
          Show inactive
        </label>
      </Card>

      <Card className="overflow-hidden">
        {products.isPending ? (
          <LoadingState label="Loading products…" />
        ) : products.isError ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : products.data.items.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Change the filters or add your first product."
            action={
              <Button render={<Link to="/products/new" />}>Add Product</Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.data.items.map((product) => (
                    <tr key={product.id}>
                      <td className="font-mono text-xs">{product.sku}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-xl bg-muted">
                            <Package className="size-5 text-muted-foreground" />
                          </span>
                          <div>
                            <Link
                              to={`/products/${product.id}`}
                              className="font-semibold hover:text-primary"
                            >
                              {product.name}
                            </Link>
                            {!product.isActive ? (
                              <p className="text-xs text-muted-foreground">
                                Deactivated
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>{product.category.name}</td>
                      <td>{formatCurrency(product.unitPrice)}</td>
                      <td className="font-semibold">
                        {number.format(product.quantityInStock)}
                      </td>
                      <td>
                        <ProductStatus product={product} />
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`View ${product.name}`}
                            render={<Link to={`/products/${product.id}`} />}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${product.name}`}
                            render={<Link to={`/products/${product.id}/edit`} />}
                          >
                            <Pencil />
                          </Button>
                          {product.isActive ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Deactivate ${product.name}`}
                              onClick={() => setDeactivating(product)}
                            >
                              <Archive className="text-destructive" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={products.data.pagination.page}
              totalPages={products.data.pagination.totalPages}
              onPageChange={(page) => updateParam("page", String(page))}
            />
          </>
        )}
      </Card>

      <Dialog
        open={deactivating !== null}
        title="Deactivate product?"
        description="The product will remain in historical records but cannot be sold."
        onClose={() => setDeactivating(null)}
      >
        {deactivate.error ? (
          <Notice tone="danger">
            {normalizeApiError(deactivate.error).message}
          </Notice>
        ) : null}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeactivating(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deactivate.isPending}
            onClick={() =>
              deactivating && deactivate.mutate(deactivating.id)
            }
          >
            {deactivate.isPending ? "Deactivating…" : "Deactivate"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export { ProductStatus }
