import type { Product } from "@/types/api"

export type CartLine = {
  product: Product
  quantity: number
}

export function addToCart(lines: CartLine[], product: Product): CartLine[] {
  if (!product.isActive || product.quantityInStock < 1) return lines
  const existing = lines.find((line) => line.product.id === product.id)
  if (!existing) return [...lines, { product, quantity: 1 }]
  return setCartQuantity(lines, product.id, existing.quantity + 1)
}

export function setCartQuantity(
  lines: CartLine[],
  productId: number,
  quantity: number
): CartLine[] {
  if (quantity <= 0) return lines.filter((line) => line.product.id !== productId)
  return lines.map((line) =>
    line.product.id === productId
      ? {
          ...line,
          quantity: Math.min(quantity, line.product.quantityInStock),
        }
      : line
  )
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce(
    (total, line) =>
      total + Number(line.product.unitPrice) * line.quantity,
    0
  )
}

export function salePayload(lines: CartLine[], notes?: string) {
  return {
    items: lines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
    })),
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
  }
}
