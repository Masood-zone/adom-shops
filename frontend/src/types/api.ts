export type ApiEnvelope<T> = {
  success: true
  message: string
  data: T
}

export type ApiValidationError = {
  field: string
  message: string
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Paginated<T> = {
  items: T[]
  pagination: Pagination
}

export type Category = {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type Product = {
  id: number
  categoryId: number
  category: Pick<Category, "id" | "name">
  sku: string
  name: string
  description: string | null
  unitPrice: string
  quantityInStock: number
  reorderLevel: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type StockMovementType =
  | "OPENING_STOCK"
  | "RESTOCK"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "SALE"
  | "SALE_VOID"

export type StockMovement = {
  id: number
  productId: number
  productName: string
  productSku: string
  type: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  referenceNumber: string | null
  createdAt: string
}

export type SaleStatus = "COMPLETED" | "VOIDED"

export type SaleListItem = {
  id: number
  saleNumber: string
  status: SaleStatus
  totalAmount: string
  totalUnits: number
  notes: string | null
  soldAt: string
  voidedAt: string | null
  voidReason: string | null
}

export type SaleItem = {
  id: number
  productId: number
  productName: string
  productSku: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export type Sale = Omit<SaleListItem, "totalUnits"> & {
  items: SaleItem[]
}

export type DashboardSummary = {
  totalCategories: number
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  salesToday: number
  revenueToday: string
  recentSales: SaleListItem[]
  lowStockItems: Array<
    Pick<Product, "id" | "sku" | "name" | "quantityInStock" | "reorderLevel">
  >
}

export type SalesSummary = {
  totalSales: number
  totalRevenue: string
  averageSaleValue: string
}

export type SalesByDate = {
  date: string
  totalSales: number
  revenue: string
}

export type TopProduct = {
  productId: number
  sku: string
  name: string
  quantitySold: number
  revenue: string
}

export type InventoryValue = {
  totalProducts: number
  totalUnits: number
  inventoryValue: string
}

export type LowStockReportItem = {
  productId: number
  sku: string
  name: string
  categoryId: number
  categoryName: string
  quantityInStock: number
  reorderLevel: number
  shortage: number
}

export type ProductInput = {
  categoryId: number
  sku: string
  name: string
  description?: string | null
  unitPrice: string
  reorderLevel: number
  isActive: boolean
  openingStock?: number
}

export type ProductQuery = {
  search?: string
  categoryId?: number
  isActive?: boolean
  lowStock?: boolean
  page?: number
  limit?: number
}

export type StockMovementQuery = {
  productId?: number
  type?: StockMovementType
  from?: string
  to?: string
  page?: number
  limit?: number
}

export type SaleQuery = {
  search?: string
  status?: SaleStatus
  from?: string
  to?: string
  page?: number
  limit?: number
}

export type DateRangeQuery = {
  from?: string
  to?: string
}
