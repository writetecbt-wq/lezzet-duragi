"use client";

import { create } from "zustand";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";

// ─── Types ─────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
};

type ProductStore = {
  products: Product[];
  categories: Category[];

  // Actions
  addProduct: (product: Omit<Product, "id" | "sortOrder">) => void;
  updateProduct: (id: string, data: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;
};

// ─── Store ─────────────────────────────────────────────────────────────────

let productIdCounter = 1000;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: MOCK_PRODUCTS.map((p) => ({
    ...p,
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
  })),
  categories: MOCK_CATEGORIES,

  addProduct: (data) => {
    productIdCounter++;
    const newProduct: Product = {
      ...data,
      id: `prod_custom_${productIdCounter}`,
      sortOrder: get().products.filter((p) => p.categoryId === data.categoryId).length + 1,
    };
    set((state) => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: (id, data) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },

  toggleAvailability: (id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
      ),
    }));
  },
}));
