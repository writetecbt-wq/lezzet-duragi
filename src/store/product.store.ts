"use client";

import { create } from "zustand";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ProductTag =
  | "vegan"
  | "vejetaryen"
  | "glutenFree"
  | "laktosuzFree"
  | "acili"
  | "fistik"
  | "sut"
  | "yumurta"
  | "denizUrunu";

export const PRODUCT_TAG_META: Record<
  ProductTag,
  { label: string; emoji: string; color: string; type: "diet" | "allergen" | "spice" }
> = {
  vegan:        { label: "Vegan",           emoji: "🌱", color: "#22c55e", type: "diet" },
  vejetaryen:   { label: "Vejetaryen",      emoji: "🥗", color: "#86efac", type: "diet" },
  glutenFree:   { label: "Gluten Free",     emoji: "🌾", color: "#f59e0b", type: "diet" },
  laktosuzFree: { label: "Laktoz İçermez", emoji: "🥛", color: "#60a5fa", type: "diet" },
  acili:        { label: "Acılı",           emoji: "🌶️", color: "#ef4444", type: "spice" },
  fistik:       { label: "Fıstık İçerir",  emoji: "🥜", color: "#d97706", type: "allergen" },
  sut:          { label: "Süt İçerir",      emoji: "🧀", color: "#fbbf24", type: "allergen" },
  yumurta:      { label: "Yumurta İçerir", emoji: "🥚", color: "#fde68a", type: "allergen" },
  denizUrunu:   { label: "Deniz Ürünü",    emoji: "🦐", color: "#38bdf8", type: "allergen" },
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: string;
  tags: ProductTag[];
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
    tags: (p as any).tags ?? [],
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
