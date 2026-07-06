"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
  ImageOff,
} from "lucide-react";
import { useProductStore, Product } from "@/store/product.store";
import { formatPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ProductFormModal } from "./ProductFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export function ProductManagement() {
  const { products, categories, toggleAvailability, deleteProduct } = useProductStore();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterAvail, setFilterAvail] = useState<"ALL" | "AVAILABLE" | "UNAVAILABLE">("ALL");

  const [formModal, setFormModal] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  const filtered = products.filter((p) => {
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || p.categoryId === filterCategory;
    const matchAvail =
      filterAvail === "ALL" ||
      (filterAvail === "AVAILABLE" && p.isAvailable) ||
      (filterAvail === "UNAVAILABLE" && !p.isAvailable);
    return matchSearch && matchCat && matchAvail;
  });

  // Group by category
  const grouped = categories.map((cat) => ({
    category: cat,
    products: filtered.filter((p) => p.categoryId === cat.id),
  }));

  const handleEdit = useCallback((product: Product) => {
    setFormModal({ open: true, product });
  }, []);

  const handleAdd = useCallback(() => {
    setFormModal({ open: true, product: null });
  }, []);

  const handleDeleteClick = useCallback((product: Product) => {
    setDeleteModal({ open: true, product });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteModal.product) deleteProduct(deleteModal.product.id);
    setDeleteModal({ open: false, product: null });
  }, [deleteModal.product, deleteProduct]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-white/8 bg-[#0f0f12]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Ürün Yönetimi</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {products.length} ürün · {products.filter((p) => p.isAvailable).length} aktif
            </p>
          </div>
          <button
            id="add-product-btn"
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all btn-press shadow-lg shadow-orange-900/30 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Ürün Ekle
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              id="product-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>

          {/* Category filter */}
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>

          {/* Availability filter */}
          <select
            id="avail-filter"
            value={filterAvail}
            onChange={(e) => setFilterAvail(e.target.value as typeof filterAvail)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="AVAILABLE">Aktif</option>
            <option value="UNAVAILABLE">Pasif</option>
          </select>
        </div>
      </div>

      {/* ── Product List ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-3">🔍</div>
            <p className="text-zinc-400 font-medium">Ürün bulunamadı</p>
            <p className="text-zinc-600 text-sm mt-1">Arama veya filtre kriterlerinizi değiştirin</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-7xl mx-auto">
            {grouped
              .filter((g) => g.products.length > 0)
              .map(({ category, products: catProducts }) => (
                <div key={category.id}>
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{category.emoji}</span>
                    <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                      {category.name}
                    </h2>
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-xs text-zinc-600">{catProducts.length} ürün</span>
                  </div>

                  {/* Product grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                    {catProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categoryName={category.name}
                        onEdit={() => handleEdit(product)}
                        onDelete={() => handleDeleteClick(product)}
                        onToggle={() => toggleAvailability(product.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {formModal.open && (
        <ProductFormModal
          product={formModal.product}
          onClose={() => setFormModal({ open: false, product: null })}
        />
      )}
      {deleteModal.open && deleteModal.product && (
        <DeleteConfirmModal
          productName={deleteModal.product.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, product: null })}
        />
      )}
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────

function ProductCard({
  product,
  categoryName,
  onEdit,
  onDelete,
  onToggle,
}: {
  product: Product;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-[#16161b] border border-white/8 rounded-2xl overflow-hidden group hover:border-white/15 transition-all card-hover">
      {/* Image */}
      <div className="relative h-36 bg-zinc-900 overflow-hidden">
        {product.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-900">
            <ImageOff className="w-8 h-8 text-zinc-700" />
            <span className="text-xs text-zinc-700">Görsel yok</span>
          </div>
        )}

        {/* Availability overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-red-500/80 rounded-lg px-2.5 py-1">
              Pasif
            </span>
          </div>
        )}

        {/* Action buttons (top right) */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`edit-${product.id}`}
            onClick={onEdit}
            className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-brand-500 transition-colors flex items-center justify-center"
            title="Düzenle"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`delete-${product.id}`}
            onClick={onDelete}
            className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-red-500 transition-colors flex items-center justify-center"
            title="Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">{product.name}</h3>
          <span className="text-base font-bold text-brand-400 flex-shrink-0 whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        {product.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">{product.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/6">
          <span className="text-[10px] text-zinc-600 font-medium">{categoryName}</span>

          {/* Toggle availability */}
          <button
            id={`toggle-${product.id}`}
            onClick={onToggle}
            title={product.isAvailable ? "Pasife al" : "Aktif et"}
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-1 transition-all",
              product.isAvailable
                ? "text-green-400 bg-green-500/10 hover:bg-green-500/20"
                : "text-zinc-500 bg-white/5 hover:bg-white/10"
            )}
          >
            {product.isAvailable ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {product.isAvailable ? "Aktif" : "Pasif"}
          </button>
        </div>
      </div>
    </div>
  );
}
