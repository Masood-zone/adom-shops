import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ImageIcon, Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Card,
  ErrorState,
  Field,
  Input,
  Notice,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui/primitives"
import { normalizeApiError } from "@/services/api/api-client"
import { getCategories } from "@/services/api/categories/categories.queries"
import {
  createProduct,
  updateProduct,
} from "@/services/api/products/products.mutations"
import { getProduct } from "@/services/api/products/products.queries"
import { queryKeys } from "@/services/api/query-keys"
import type { ProductInput } from "@/types/api"

const productFormSchema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  sku: z.string().trim().min(1, "SKU is required").max(50),
  name: z.string().trim().min(2, "Use at least 2 characters").max(150),
  description: z.string().trim().max(65_535).optional(),
  unitPrice: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter a valid amount")
    .refine((value) => Number(value) > 0, "Price must be greater than zero"),
  reorderLevel: z
    .string()
    .regex(/^\d+$/, "Enter a whole number")
    .refine((value) => Number(value) >= 0),
  openingStock: z
    .string()
    .regex(/^\d+$/, "Enter a whole number")
    .refine((value) => Number(value) >= 0),
  isActive: z.boolean(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export function ProductFormPage() {
  const { productId } = useParams()
  const id = productId ? Number(productId) : undefined
  const isEditing = id !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const categories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })
  const product = useQuery({
    queryKey: queryKeys.products.detail(id ?? 0),
    queryFn: () => getProduct(id!),
    enabled: isEditing,
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: "",
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      reorderLevel: "5",
      openingStock: "0",
      isActive: true,
    },
  })

  useEffect(() => {
    if (!product.data) return
    reset({
      categoryId: String(product.data.categoryId),
      sku: product.data.sku,
      name: product.data.name,
      description: product.data.description ?? "",
      unitPrice: product.data.unitPrice,
      reorderLevel: String(product.data.reorderLevel),
      openingStock: "0",
      isActive: product.data.isActive,
    })
  }, [product.data, reset])

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const input: ProductInput = {
        categoryId: Number(values.categoryId),
        sku: values.sku,
        name: values.name,
        description: values.description || null,
        unitPrice: values.unitPrice,
        reorderLevel: Number(values.reorderLevel),
        isActive: values.isActive,
      }
      return isEditing
        ? updateProduct(id, input)
        : createProduct({
            ...input,
            openingStock: Number(values.openingStock),
          })
    },
    onSuccess: async (saved) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ])
      navigate(`/products/${saved.id}`, {
        state: {
          notice: isEditing
            ? "Product updated successfully."
            : "Product created successfully.",
        },
      })
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      Object.entries(normalized.fieldErrors).forEach(([field, message]) => {
        if (field in productFormSchema.shape) {
          setError(field as keyof ProductFormValues, { message })
        }
      })
    },
  })

  if (isEditing && product.isPending) {
    return <LoadingState label="Loading product…" />
  }
  if (isEditing && product.isError) {
    return <ErrorState error={product.error} onRetry={() => product.refetch()} />
  }

  return (
    <div className="space-y-6">
      <Link
        to={isEditing ? `/products/${id}` : "/products"}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <PageHeader
        title={isEditing ? "Edit Product" : "Add New Product"}
        description="Keep catalog information accurate and easy to find."
      />
      {mutation.error ? (
        <Notice tone="danger">{normalizeApiError(mutation.error).message}</Notice>
      ) : null}

      <form
        className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <Card className="space-y-5 p-6">
          <h2 className="text-lg font-semibold">Product information</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Product name" error={errors.name?.message}>
              <Input placeholder="Premium Rice 5kg" {...register("name")} />
            </Field>
            <Field label="SKU" error={errors.sku?.message}>
              <Input
                className="font-mono"
                placeholder="ADS-RICE-5KG"
                {...register("sku")}
              />
            </Field>
          </div>
          <Field label="Category" error={errors.categoryId?.message}>
            <Select {...register("categoryId")}>
              <option value="">Select a category</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <Textarea
              placeholder="Describe the product"
              {...register("description")}
            />
          </Field>
          <div className="rounded-[var(--radius)] border border-dashed p-6 text-center">
            <ImageIcon className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Product image unavailable</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The current API does not store product images.
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <h2 className="text-lg font-semibold">Pricing &amp; logistics</h2>
            <Field label="Unit price (GH₵)" error={errors.unitPrice?.message}>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                {...register("unitPrice")}
              />
            </Field>
            <Field
              label="Reorder level"
              error={errors.reorderLevel?.message}
              hint="The product is flagged when stock reaches this number."
            >
              <Input
                inputMode="numeric"
                min="0"
                {...register("reorderLevel")}
              />
            </Field>
            {!isEditing ? (
              <Field
                label="Opening stock"
                error={errors.openingStock?.message}
              >
                <Input
                  inputMode="numeric"
                  min="0"
                  {...register("openingStock")}
                />
              </Field>
            ) : null}
            <label className="flex items-center gap-3 rounded-[var(--radius)] border p-4 text-sm font-medium">
              <input type="checkbox" {...register("isActive")} />
              Product is active
            </label>
          </Card>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              render={<Link to={isEditing ? `/products/${id}` : "/products"} />}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Save />
              {mutation.isPending ? "Saving…" : "Save Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
