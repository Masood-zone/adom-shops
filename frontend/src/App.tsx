import { lazy } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/app-shell"

const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  }))
)
const CategoriesPage = lazy(() =>
  import("@/pages/categories-page").then((module) => ({
    default: module.CategoriesPage,
  }))
)
const ProductsPage = lazy(() =>
  import("@/pages/products-page").then((module) => ({
    default: module.ProductsPage,
  }))
)
const ProductFormPage = lazy(() =>
  import("@/pages/product-form-page").then((module) => ({
    default: module.ProductFormPage,
  }))
)
const ProductDetailPage = lazy(() =>
  import("@/pages/product-detail-page").then((module) => ({
    default: module.ProductDetailPage,
  }))
)
const StockPage = lazy(() =>
  import("@/pages/stock-page").then((module) => ({
    default: module.StockPage,
  }))
)
const NewSalePage = lazy(() =>
  import("@/pages/new-sale-page").then((module) => ({
    default: module.NewSalePage,
  }))
)
const SalesPage = lazy(() =>
  import("@/pages/sales-page").then((module) => ({
    default: module.SalesPage,
  }))
)
const SaleDetailPage = lazy(() =>
  import("@/pages/sale-detail-page").then((module) => ({
    default: module.SaleDetailPage,
  }))
)
const ReportsPage = lazy(() =>
  import("@/pages/reports-page").then((module) => ({
    default: module.ReportsPage,
  }))
)

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="products/:productId/edit" element={<ProductFormPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="sales/new" element={<NewSalePage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/:saleId" element={<SaleDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
