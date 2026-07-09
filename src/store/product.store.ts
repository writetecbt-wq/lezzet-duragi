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

// ─── Store ─────────────────────────────────────────────────────────────────

type ProductStore = {
  products: Product[];
  categories: Category[];
  isLoading: boolean;

  // Actions
  fetchProductsAndCategories: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "sortOrder">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
};

import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,

  fetchProductsAndCategories: async () => {
    set({ isLoading: true });
    try {
      const [productsSnap, categoriesSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories"))
      ]);

      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

      // Sort by sortOrder
      products.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      set({ products, categories, isLoading: false });
    } catch (error) {
      console.error("Error fetching data:", error);
      set({ isLoading: false });
    }
  },

  addProduct: async (data) => {
    try {
      const newId = `prod_custom_${Date.now()}`;
      const sortOrder = get().products.filter((p) => p.categoryId === data.categoryId).length + 1;
      const newProduct: Product = {
        ...data,
        id: newId,
        sortOrder,
      };
      
      await setDoc(doc(db, "products", newId), newProduct);
      set((state) => ({ products: [...state.products, newProduct] }));
    } catch (error) {
      console.error("Error adding product:", error);
    }
  },

  updateProduct: async (id, data) => {
    try {
      await updateDoc(doc(db, "products", id), data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    } catch (error) {
      console.error("Error updating product:", error);
    }
  },

  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  },

  toggleAvailability: async (id) => {
    const product = get().products.find(p => p.id === id);
    if (!product) return;
    
    try {
      const newAvailability = !product.isAvailable;
      await updateDoc(doc(db, "products", id), { isAvailable: newAvailability });
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, isAvailable: newAvailability } : p
        ),
      }));
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  },
}));
