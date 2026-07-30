import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  Package,
  ShoppingBag,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Badge,
  Card,
  ErrorState,
  Input,
  PageHeader,
  Select,
} from "@/components/ui/primitives"
import { formatCurrency, number } from "@/lib/format"
import { getCategories } from "@/services/api/categories/categories.queries"
import { queryKeys } from "@/services/api/query-keys"
import {
  getInventoryValue,
  getLowStockReport,
  getSalesByDate,
  getSalesSummary,
  getTopProducts,
} from "@/services/api/reports/reports.queries"
import type { DateRangeQuery } from "@/types/api"

function dateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function defaultRange(): DateRangeQuery {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 29)
  return { from: dateInput(from), to: dateInput(to) }
}

export function ReportsPage() {
  const [tab, setTab] = useState<"sales" | "inventory">("sales")
  const [range, setRange] = useState<DateRangeQuery>(defaultRange)
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const summary = useQuery({
    queryKey: queryKeys.reports.summary(range),
    queryFn: () => getSalesSummary(range),
  })
  const byDate = useQuery({
    queryKey: queryKeys.reports.byDate(range),
    queryFn: () => getSalesByDate(range),
  })
  const topProducts = useQuery({
    queryKey: queryKeys.reports.topProducts(range),
    queryFn: () => getTopProducts({ ...range, limit: 8 }),
  })
  const inventory = useQuery({
    queryKey: queryKeys.reports.inventory(categoryId),
    queryFn: () => getInventoryValue({ categoryId }),
  })
  const lowStock = useQuery({
    queryKey: queryKeys.reports.lowStock,
    queryFn: () => getLowStockReport({ limit: 20 }),
  })
  const categories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })
  const maxRevenue = useMemo(
    () =>
      Math.max(...(byDate.data ?? []).map((item) => Number(item.revenue)), 1),
    [byDate.data]
  )

  const salesError = summary.error ?? byDate.error ?? topProducts.error
  const inventoryError = inventory.error ?? lowStock.error
  const summaryData = summary.data ?? {
    totalSales: 0,
    totalRevenue: "0.00",
    averageSaleValue: "0.00",
  }
  const byDateData = byDate.data ?? []
  const topProductsData = topProducts.data ?? []
  const inventoryData = inventory.data ?? {
    totalProducts: 0,
    totalUnits: 0,
    inventoryValue: "0.00",
  }
  const lowStockData = lowStock.data ?? {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence"
        description="Track your shop's sales performance and inventory health."
        action={
          <div className="flex rounded-[var(--radius)] border bg-card p-1">
            <Button
              size="sm"
              variant={tab === "sales" ? "default" : "ghost"}
              onClick={() => setTab("sales")}
            >
              Sales Report
            </Button>
            <Button
              size="sm"
              variant={tab === "inventory" ? "default" : "ghost"}
              onClick={() => setTab("inventory")}
            >
              Inventory Report
            </Button>
          </div>
        }
      />

      {tab === "sales" ? (
        <>
          <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
            <label className="grid gap-1.5 text-sm font-medium">
              From
              <Input
                type="date"
                value={range.from ?? ""}
                onChange={(event) =>
                  setRange((current) => ({
                    ...current,
                    from: event.target.value || undefined,
                  }))
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              To
              <Input
                type="date"
                value={range.to ?? ""}
                onChange={(event) =>
                  setRange((current) => ({
                    ...current,
                    to: event.target.value || undefined,
                  }))
                }
              />
            </label>
            <Button
              variant="outline"
              onClick={() => setRange(defaultRange())}
            >
              Last 30 Days
            </Button>
            <Button variant="outline" disabled className="sm:ml-auto">
              Export unavailable
            </Button>
          </Card>

          {summary.isPending || byDate.isPending || topProducts.isPending ? (
            <LoadingState label="Building sales report…" />
          ) : salesError ? (
            <ErrorState error={salesError} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Total Sales",
                    value: number.format(summaryData.totalSales),
                    icon: ShoppingBag,
                  },
                  {
                    label: "Revenue",
                    value: formatCurrency(summaryData.totalRevenue),
                    icon: CircleDollarSign,
                  },
                  {
                    label: "Average Sale Value",
                    value: formatCurrency(summaryData.averageSaleValue),
                    icon: BarChart3,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <Card key={label} className="p-6">
                    <span className="grid size-12 place-items-center rounded-[var(--radius)] bg-accent text-accent-foreground">
                      <Icon className="size-6" />
                    </span>
                    <p className="mt-5 text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.5fr_.7fr]">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold">Sales by Date</h2>
                  {byDateData.length === 0 ? (
                    <p className="grid min-h-72 place-items-center text-sm text-muted-foreground">
                      No completed sales in this date range.
                    </p>
                  ) : (
                    <div className="mt-8 flex h-72 items-end gap-2 overflow-x-auto border-b px-2">
                      {byDateData.map((point) => (
                        <div
                          key={point.date}
                          className="group flex h-full min-w-12 flex-1 flex-col justify-end"
                          title={`${point.date}: ${formatCurrency(point.revenue)}`}
                        >
                          <div
                            className="min-h-1 rounded-t-lg bg-primary/75 transition-colors group-hover:bg-primary"
                            style={{
                              height: `${Math.max(
                                4,
                                (Number(point.revenue) / maxRevenue) * 90
                              )}%`,
                            }}
                          />
                          <p className="h-10 pt-2 text-center text-[10px] text-muted-foreground">
                            {point.date.slice(5)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold">Top Selling</h2>
                  <div className="mt-5 space-y-4">
                    {topProductsData.length === 0 ? (
                      <p className="py-16 text-center text-sm text-muted-foreground">
                        No product sales in this period.
                      </p>
                    ) : (
                      topProductsData.map((product, index) => (
                        <Link
                          key={product.productId}
                          to={`/products/${product.productId}`}
                          className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.quantitySold} units sold
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(product.revenue)}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <Card className="max-w-md p-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Inventory category
              <Select
                value={categoryId ?? ""}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value ? Number(event.target.value) : undefined
                  )
                }
              >
                <option value="">All categories</option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </label>
          </Card>
          {inventory.isPending || lowStock.isPending ? (
            <LoadingState label="Building inventory report…" />
          ) : inventoryError ? (
            <ErrorState error={inventoryError} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Active Products",
                    value: number.format(inventoryData.totalProducts),
                    icon: Package,
                  },
                  {
                    label: "Units in Stock",
                    value: number.format(inventoryData.totalUnits),
                    icon: Boxes,
                  },
                  {
                    label: "Inventory Value",
                    value: formatCurrency(inventoryData.inventoryValue),
                    icon: CircleDollarSign,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <Card key={label} className="p-6">
                    <Icon className="size-6 text-primary" />
                    <p className="mt-5 text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </Card>
                ))}
              </div>
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <h2 className="text-lg font-semibold">Low Stock Report</h2>
                  <Badge tone="warning">
                    {lowStockData.pagination.total} items
                  </Badge>
                </div>
                {lowStockData.items.length === 0 ? (
                  <p className="border-t px-5 py-12 text-center text-sm text-muted-foreground">
                    All active products have healthy stock.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Reorder Level</th>
                          <th>Shortage</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockData.items.map((item) => (
                          <tr key={item.productId}>
                            <td>
                              <p className="font-medium">{item.name}</p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {item.sku}
                              </p>
                            </td>
                            <td>{item.categoryName}</td>
                            <td>{item.quantityInStock}</td>
                            <td>{item.reorderLevel}</td>
                            <td className="font-semibold text-amber-700 dark:text-amber-400">
                              {item.shortage}
                            </td>
                            <td>
                              <Button
                                variant="outline"
                                size="sm"
                                render={
                                  <Link to={`/stock?productId=${item.productId}`} />
                                }
                              >
                                Restock
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
