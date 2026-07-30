import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Notice,
  PageHeader,
  Textarea,
} from "@/components/ui/primitives"
import { formatDate } from "@/lib/format"
import { normalizeApiError } from "@/services/api/api-client"
import {
  createCategory,
  updateCategory,
} from "@/services/api/categories/categories.mutations"
import { getCategories } from "@/services/api/categories/categories.queries"
import { deleteCategory } from "@/services/api/categories/categories.mutations"
import { queryKeys } from "@/services/api/query-keys"
import type { Category } from "@/types/api"

const categorySchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters").max(100),
  description: z.string().trim().max(255).optional(),
})

type CategoryValues = z.infer<typeof categorySchema>

function CategoryForm({
  category,
  onDone,
  onCancel,
}: {
  category?: Category
  onDone: () => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: CategoryValues) =>
      category
        ? updateCategory(category.id, {
            name: values.name,
            description: values.description || null,
          })
        : createCategory({
            name: values.name,
            description: values.description || null,
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      onDone()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      Object.entries(normalized.fieldErrors).forEach(([field, message]) => {
        if (field === "name" || field === "description") {
          setError(field, { message })
        }
      })
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      {mutation.error ? (
        <Notice tone="danger">{normalizeApiError(mutation.error).message}</Notice>
      ) : null}
      <Field label="Category name" error={errors.name?.message}>
        <Input autoFocus placeholder="e.g. Groceries" {...register("name")} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <Textarea
          placeholder="A short description of this category"
          {...register("description")}
        />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save category"}
        </Button>
      </div>
    </form>
  )
}

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Category | "new" | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [notice, setNotice] = useState("")
  const categories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      setDeleting(null)
      setNotice("Category deleted successfully.")
    },
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return categories.data ?? []
    return (categories.data ?? []).filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        category.description?.toLowerCase().includes(term)
    )
  }, [categories.data, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize products into simple, searchable groups."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus /> Add Category
          </Button>
        }
      />
      {notice ? <Notice>{notice}</Notice> : null}

      <Card className="p-4">
        <label className="relative block max-w-md">
          <span className="sr-only">Search categories</span>
          <Search className="absolute top-3 left-3 size-5 text-muted-foreground" />
          <Input
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories…"
          />
        </label>
      </Card>

      <Card className="overflow-hidden">
        {categories.isPending ? (
          <LoadingState label="Loading categories…" />
        ) : categories.isError ? (
          <ErrorState
            error={categories.error}
            onRetry={() => categories.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No categories found"
            description={
              search
                ? "Try a different search term."
                : "Add a category to begin organizing your products."
            }
            action={
              !search ? (
                <Button onClick={() => setEditing("new")}>Add Category</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th className="w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr key={category.id}>
                    <td className="font-semibold">{category.name}</td>
                    <td className="max-w-md text-muted-foreground">
                      {category.description || "—"}
                    </td>
                    <td>{formatDate(category.createdAt, { dateStyle: "medium" })}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => setEditing(category)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${category.name}`}
                          onClick={() => setDeleting(category)}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog
        open={editing !== null}
        title={editing === "new" ? "Add category" : "Edit category"}
        description="Category names must be unique."
        onClose={() => setEditing(null)}
      >
        <CategoryForm
          category={editing && editing !== "new" ? editing : undefined}
          onDone={() => {
            setNotice(
              editing === "new"
                ? "Category created successfully."
                : "Category updated successfully."
            )
            setEditing(null)
          }}
          onCancel={() => setEditing(null)}
        />
      </Dialog>

      <Dialog
        open={deleting !== null}
        title="Delete category?"
        description="This cannot be undone. Categories used by products cannot be deleted."
        onClose={() => setDeleting(null)}
      >
        {remove.error ? (
          <Notice tone="danger">{normalizeApiError(remove.error).message}</Notice>
        ) : null}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id)}
          >
            {remove.isPending ? "Deleting…" : "Delete permanently"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
