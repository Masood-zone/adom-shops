import { useQuery } from "@tanstack/react-query"
import {
  Boxes,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react"
import { Link } from "react-router-dom"

import { LoadingState } from "@/components/ui/loading-state"
import { Card, ErrorState, PageHeader } from "@/components/ui/primitives"
import { formatCurrency, formatDate, number } from "@/lib/format"
import { cn } from "@/lib/utils"
import { getDashboardSummary } from "@/services/api/dashboard/dashboard.queries"
import { queryKeys } from "@/services/api/query-keys"

export function DashboardPage() {
  const summary = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardSummary,
  })

  if (summary.isPending) return <LoadingState label="Loading dashboard…" />
  if (summary.isError)
    return <ErrorState error={summary.error} onRetry={() => summary.refetch()} />

  const data = summary.data
  const metrics = [
    {
      label: "Total Products",
      value: number.format(data.totalProducts),
      icon: Package,
    },
    {
      label: "Categories",
      value: number.format(data.totalCategories),
      icon: Boxes,
    },
    {
      label: "Active Products",
      value: number.format(data.activeProducts),
      icon: Package,
      tone: "text-primary",
    },
    {
      label: "Low Stock",
      value: number.format(data.lowStockProducts),
      icon: TriangleAlert,
      tone: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "Out of Stock",
      value: number.format(data.outOfStockProducts),
      icon: TriangleAlert,
      tone: "text-destructive",
    },
    {
      label: "Sales Today",
      value: number.format(data.salesToday),
      icon: ShoppingCart,
    },
    {
      label: "Revenue Today",
      value: formatCurrency(data.revenueToday),
      icon: CircleDollarSign,
      tone: "text-primary",
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Operational overview for Adom Shops"
        action={
          <Link
            to="/sales/new"
            className="inline-flex h-10 items-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Sale
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={cn("size-5 text-muted-foreground", tone)} />
            </div>
            <p className={cn("mt-4 text-2xl font-semibold", tone)}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-lg font-semibold">Recent Sales</h2>
            <Link to="/sales" className="text-sm font-medium text-primary">
              View all
            </Link>
          </div>
          {data.recentSales.length === 0 ? (
            <p className="border-t px-5 py-10 text-center text-sm text-muted-foreground">
              No sales have been recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sale</th>
                    <th>Date</th>
                    <th>Units</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <Link
                          to={`/sales/${sale.id}`}
                          className="font-mono text-xs font-medium text-primary"
                        >
                          {sale.saleNumber}
                        </Link>
                      </td>
                      <td>{formatDate(sale.soldAt)}</td>
                      <td>{sale.totalUnits}</td>
                      <td className="font-semibold">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Inventory Alerts</h2>
            <Link to="/stock" className="text-sm font-medium text-primary">
              Manage stock
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {data.lowStockItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                All active products have healthy stock.
              </p>
            ) : (
              data.lowStockItems.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex items-center justify-between gap-4 rounded-[var(--radius)] border p-4 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        product.quantityInStock === 0
                          ? "text-destructive"
                          : "text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {product.quantityInStock} left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reorder at {product.reorderLevel}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
