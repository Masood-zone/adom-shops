import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Ban, Printer } from "lucide-react"
import { Link, useLocation, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Badge,
  Card,
  Dialog,
  ErrorState,
  Notice,
  PageHeader,
  Textarea,
} from "@/components/ui/primitives"
import { formatCurrency, formatDate } from "@/lib/format"
import { normalizeApiError } from "@/services/api/api-client"
import { queryKeys } from "@/services/api/query-keys"
import { voidSale as voidSaleRequest } from "@/services/api/sales/sales.mutations"
import { getSale } from "@/services/api/sales/sales.queries"

export function SaleDetailPage() {
  const { saleId } = useParams()
  const id = Number(saleId)
  const location = useLocation()
  const queryClient = useQueryClient()
  const [voidOpen, setVoidOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [notice, setNotice] = useState(
    (location.state as { notice?: string } | null)?.notice ?? ""
  )
  const sale = useQuery({
    queryKey: queryKeys.sales.detail(id),
    queryFn: () => getSale(id),
    enabled: Number.isFinite(id),
  })
  const voidSale = useMutation({
    mutationFn: () => voidSaleRequest(id, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stock.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ])
      setVoidOpen(false)
      setReason("")
      setNotice("Sale voided and stock restored successfully.")
    },
  })

  if (sale.isPending) return <LoadingState label="Loading sale…" />
  if (sale.isError)
    return <ErrorState error={sale.error} onRetry={() => sale.refetch()} />

  const data = sale.data
  const totalUnits = data.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      <Link
        to="/sales"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to sales history
      </Link>
      <PageHeader
        title={`Sale ${data.saleNumber}`}
        description={formatDate(data.soldAt)}
        action={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            {data.status === "COMPLETED" ? (
              <Button variant="destructive" onClick={() => setVoidOpen(true)}>
                <Ban /> Void Sale
              </Button>
            ) : null}
          </div>
        }
      />
      {notice ? <Notice>{notice}</Notice> : null}
      {data.status === "VOIDED" ? (
        <Notice tone="danger">
          This transaction was voided
          {data.voidedAt ? ` on ${formatDate(data.voidedAt)}` : ""}. Reason:{" "}
          {data.voidReason}
        </Notice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_.75fr]">
        <Card className="overflow-hidden">
          <div className="px-5 py-4">
            <h2 className="text-lg font-semibold">Items List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.productName}
                      </Link>
                    </td>
                    <td className="font-mono text-xs">{item.productSku}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{item.quantity}</td>
                    <td className="font-semibold">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sale Summary</h2>
            <Badge tone={data.status === "COMPLETED" ? "success" : "danger"}>
              {data.status}
            </Badge>
          </div>
          <dl className="mt-6 space-y-4">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Line items</dt>
              <dd>{data.items.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total units</dt>
              <dd>{totalUnits}</dd>
            </div>
            <div className="flex justify-between border-t pt-4 text-xl font-semibold">
              <dt>Grand Total</dt>
              <dd className="text-primary">{formatCurrency(data.totalAmount)}</dd>
            </div>
          </dl>
          {data.notes ? (
            <div className="mt-6 border-t pt-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Notes
              </p>
              <p className="mt-2 text-sm">{data.notes}</p>
            </div>
          ) : null}
        </Card>
      </div>

      <Dialog
        open={voidOpen}
        title="Void this transaction?"
        description="Stock quantities will be restored. This action cannot be reversed."
        onClose={() => setVoidOpen(false)}
      >
        {voidSale.error ? (
          <Notice tone="danger">
            {normalizeApiError(voidSale.error).message}
          </Notice>
        ) : null}
        <label className="mt-4 grid gap-2 text-sm font-medium">
          Reason for voiding
          <Textarea
            autoFocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Provide a clear reason"
            maxLength={255}
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setVoidOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reason.trim().length < 3 || voidSale.isPending}
            onClick={() => voidSale.mutate()}
          >
            {voidSale.isPending ? "Voiding…" : "Confirm Void Sale"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
