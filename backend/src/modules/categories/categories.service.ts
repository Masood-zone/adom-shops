import { AppError } from "../../common/errors/app-error.js";

import * as categoryRepository from "./categories.repository.js";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.validation.js";

export function getCategories() {
  return categoryRepository.findAll();
}

export async function getCategory(id: number) {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await categoryRepository.findByName(input.name);

  if (existing) {
    throw new AppError(409, "A category with this name already exists");
  }

  const category = await categoryRepository.create({
    name: input.name,
    description: input.description ?? null,
  });

  if (!category) {
    throw new AppError(500, "Category could not be created");
  }

  return category;
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  const current = await categoryRepository.findById(id);

  if (!current) {
    throw new AppError(404, "Category not found");
  }

  if (input.name) {
    const duplicate = await categoryRepository.findByName(input.name);

    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "A category with this name already exists");
    }
  }

  const updated = await categoryRepository.update(id, {
    ...input,
    description:
      input.description === undefined ? undefined : input.description,
  });

  if (!updated) {
    throw new AppError(500, "Category could not be updated");
  }

  return updated;
}

export async function deleteCategory(id: number) {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  await categoryRepository.remove(id);
}
