import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Package, Pencil } from "lucide-react"
import { Link, useLocation, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Card,
  EmptyState,
  ErrorState,
  Notice,
  PageHeader,
} from "@/components/ui/primitives"
import {
  formatCurrency,
  formatDate,
  number,
  titleCase,
} from "@/lib/format"
import { ProductStatus } from "@/pages/products-page"
import { getProduct } from "@/services/api/products/products.queries"
import { queryKeys } from "@/services/api/query-keys"
import { getStockMovements } from "@/services/api/stock/stock.queries"

export function ProductDetailPage() {
  const { productId } = useParams()
  const id = Number(productId)
  const location = useLocation()
  const product = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: Number.isFinite(id),
  })
  const movements = useQuery({
    queryKey: queryKeys.stock.movements({ productId: id, limit: 10 }),
    queryFn: () => getStockMovements({ productId: id, limit: 10 }),
    enabled: Number.isFinite(id),
  })

  if (product.isPending) return <LoadingState label="Loading product…" />
  if (product.isError)
    return <ErrorState error={product.error} onRetry={() => product.refetch()} />

  const item = product.data

  return (
    <div className="space-y-6">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <PageHeader
        title={item.name}
        description={item.sku}
        action={
          <Button render={<Link to={`/products/${item.id}/edit`} />}>
            <Pencil /> Edit Product
          </Button>
        }
      />
      {(location.state as { notice?: string } | null)?.notice ? (
        <Notice>{(location.state as { notice: string }).notice}</Notice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="p-6">
          <div className="grid aspect-video place-items-center rounded-[var(--radius)] bg-muted">
            <Package className="size-16 text-muted-foreground/60" />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Stock status</p>
              <div className="mt-2">
                <ProductStatus product={item} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold">
                {number.format(item.quantityInStock)}
              </p>
              <p className="text-sm text-muted-foreground">units available</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Product details</h2>
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {[
              ["Category", item.category.name],
              ["Unit price", formatCurrency(item.unitPrice)],
              ["Reorder level", number.format(item.reorderLevel)],
              ["Status", item.isActive ? "Active" : "Inactive"],
              ["Created", formatDate(item.createdAt)],
              ["Last updated", formatDate(item.updatedAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {label}
                </dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t pt-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Description
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description || "No description provided."}
            </p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-semibold">Recent Stock Movements</h2>
          <Link
            to={`/stock?productId=${item.id}`}
            className="text-sm font-medium text-primary"
          >
            View all history
          </Link>
        </div>
        {movements.isPending ? (
          <LoadingState />
        ) : movements.isError ? (
          <ErrorState error={movements.error} />
        ) : movements.data.items.length === 0 ? (
          <EmptyState
            title="No stock movements"
            description="Stock changes for this product will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Previous</th>
                  <th>New</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.data.items.map((movement) => (
                  <tr key={movement.id}>
                    <td>{formatDate(movement.createdAt)}</td>
                    <td>{titleCase(movement.type)}</td>
                    <td className="font-semibold">{movement.quantity}</td>
                    <td>{movement.previousStock}</td>
                    <td>{movement.newStock}</td>
                    <td>{movement.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
