import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Eye, Plus, Search } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
} from "@/components/ui/primitives"
import { formatCurrency, formatDate } from "@/lib/format"
import { queryKeys } from "@/services/api/query-keys"
import { getSales } from "@/services/api/sales/sales.queries"
import type { SaleQuery, SaleStatus } from "@/types/api"

export function SalesPage() {
  const [params, setParams] = useSearchParams()
  const [searchDraft, setSearchDraft] = useState(params.get("search") ?? "")
  const query: SaleQuery = {
    search: params.get("search") || undefined,
    status: (params.get("status") as SaleStatus) || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
    page: Number(params.get("page") ?? 1),
    limit: 20,
  }
  const sales = useQuery({
    queryKey: queryKeys.sales.list(query),
    queryFn: () => getSales(query),
    placeholderData: (previous) => previous,
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
        title="Sales History"
        description="Review completed and voided transactions."
        action={
          <Button render={<Link to="/sales/new" />}>
            <Plus /> New Sale
          </Button>
        }
      />

      <Card className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-5">
        <form
          className="relative sm:col-span-2"
          onSubmit={(event) => {
            event.preventDefault()
            updateParam("search", searchDraft.trim() || undefined)
          }}
        >
          <Search className="absolute top-3 left-3 size-5 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search sale number…"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
        </form>
        <Select
          aria-label="Filter by status"
          value={params.get("status") ?? ""}
          onChange={(event) =>
            updateParam("status", event.target.value || undefined)
          }
        >
          <option value="">All transactions</option>
          <option value="COMPLETED">Completed</option>
          <option value="VOIDED">Voided</option>
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
      </Card>

      <Card className="overflow-hidden">
        {sales.isPending ? (
          <LoadingState label="Loading sales…" />
        ) : sales.isError ? (
          <ErrorState error={sales.error} onRetry={() => sales.refetch()} />
        ) : sales.data.items.length === 0 ? (
          <EmptyState
            title="No sales found"
            description="Try different filters or complete a new sale."
            action={
              <Button render={<Link to="/sales/new" />}>Start New Sale</Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sale Number</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Units</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.data.items.map((sale) => (
                    <tr key={sale.id}>
                      <td className="font-mono text-xs font-medium">
                        {sale.saleNumber}
                      </td>
                      <td>{formatDate(sale.soldAt)}</td>
                      <td>
                        <Badge
                          tone={sale.status === "COMPLETED" ? "success" : "danger"}
                        >
                          {sale.status === "COMPLETED" ? "Completed" : "Voided"}
                        </Badge>
                      </td>
                      <td>{sale.totalUnits}</td>
                      <td className="font-semibold">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`View ${sale.saleNumber}`}
                          render={<Link to={`/sales/${sale.id}`} />}
                        >
                          <Eye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={sales.data.pagination.page}
              totalPages={sales.data.pagination.totalPages}
              onPageChange={(page) => updateParam("page", String(page))}
            />
          </>
        )}
      </Card>
    </div>
  )
}
