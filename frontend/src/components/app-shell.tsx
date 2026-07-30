import { Suspense, useState } from "react"
import {
  BarChart3,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  PanelLeftClose,
  ReceiptText,
  ShoppingBasket,
  Sun,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { RouteLoadingSkeleton } from "@/components/layout/route-loading-skeleton"

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/categories", label: "Categories", icon: Boxes },
  { to: "/products", label: "Products", icon: Package },
  { to: "/stock", label: "Stock Management", icon: PanelLeftClose },
  { to: "/sales/new", label: "New Sale", icon: ShoppingBasket },
  { to: "/sales", label: "Sales History", icon: ReceiptText, end: true },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const

function ThemeMenu() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Theme: ${theme}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {theme === "dark" ? <Moon /> : <Sun />}
      </Button>
      {open ? (
        <div className="absolute top-12 right-0 z-40 min-w-36 rounded-[var(--radius)] border bg-popover p-1 shadow-lg">
          {(["light", "dark", "system"] as const).map((value) => (
            <button
              type="button"
              key={value}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm capitalize hover:bg-muted",
                theme === value && "text-primary"
              )}
              onClick={() => {
                setTheme(value)
                setOpen(false)
              }}
            >
              {value}
              {theme === value ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
        <img
          src="/android-chrome-192x192.png"
          alt=""
          width="44"
          height="44"
          className="size-11 rounded-[var(--radius)] bg-primary/10 object-contain p-1"
        />
        <div>
          <p className="text-xl font-semibold text-foreground">Adom Shops</p>
          <p className="text-xs text-muted-foreground">Internal Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-7">
        {navigation.map(({ icon: Icon, ...item }) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : undefined}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-[var(--radius)] px-4 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
            AS
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Admin User
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Shop Manager
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-70 border-r border-sidebar-border lg:block">
        <Sidebar />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-70 border-r border-sidebar-border">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-70">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <img
              src="/android-chrome-192x192.png"
              alt=""
              width="20"
              height="20"
              className="size-5 object-contain"
            />
            Operations Console
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeMenu />
            <Button variant="ghost" size="sm">
              Admin
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-400 p-4 sm:p-8">
          <Suspense fallback={<RouteLoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
