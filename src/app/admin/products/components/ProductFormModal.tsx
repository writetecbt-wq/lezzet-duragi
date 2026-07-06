"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Check, AlertCircle, ImageOff } from "lucide-react";
import { useProductStore, Product } from "@/store/product.store";
import { cn } from "@/lib/utils";

type Props = {
  product: Product | null; // null = add mode
  onClose: () => void;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FieldErrors {
  const errs: FieldErrors = {};
  if (!data.name.trim()) errs.name = "Ürün adı zorunludur";
  else if (data.name.trim().length < 2) errs.name = "En az 2 karakter olmalı";

  if (!data.price) errs.price = "Fiyat zorunludur";
  else if (isNaN(Number(data.price)) || Number(data.price) <= 0)
    errs.price = "Geçerli bir fiyat girin";

  if (!data.categoryId) errs.categoryId = "Kategori seçin";

  if (data.imageUrl.trim() && !/^https?:\/\/.+\..+/.test(data.imageUrl.trim()))
    errs.imageUrl = "Geçerli bir URL girin (https://...)";

  return errs;
}

export function ProductFormModal({ product, onClose }: Props) {
  const { categories, addProduct, updateProduct } = useProductStore();
  const isEdit = product !== null;

  const [form, setForm] = useState<FormData>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    imageUrl: product?.imageUrl ?? "",
    categoryId: product?.categoryId ?? (categories[0]?.id ?? ""),
    isAvailable: product?.isAvailable ?? true,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormData>>(new Set());
  const [imgPreview, setImgPreview] = useState(product?.imageUrl ?? "");
  const [imgLoadError, setImgLoadError] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced image preview
  useEffect(() => {
    setImgLoadError(false);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setImgPreview(form.imageUrl.trim());
    }, 600);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [form.imageUrl]);

  function touch(name: keyof FormData) {
    setTouched((prev) => new Set([...prev, name]));
  }

  function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    touch(key);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Touch all fields to show errors
    const allKeys = Object.keys(form) as (keyof FormData)[];
    setTouched(new Set(allKeys));

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitState("error");
      setTimeout(() => setSubmitState("idle"), 800);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      categoryId: form.categoryId,
      isAvailable: form.isAvailable,
    };

    if (isEdit && product) {
      updateProduct(product.id, payload);
    } else {
      addProduct(payload);
    }

    setSubmitState("success");
    setTimeout(() => onClose(), 600);
  }

  // ─── Reusable field wrapper ─────────────────────────────────────────────
  function FieldWrapper({
    label,
    name,
    required,
    children,
  }: {
    label: string;
    name: keyof FormData;
    required?: boolean;
    children: React.ReactNode;
  }) {
    const err = errors[name];
    const isTouched = touched.has(name);
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-400">
          {label}
          {required && <span className="text-brand-500 ml-0.5">*</span>}
        </label>
        {children}
        {err && isTouched && (
          <p className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {err}
          </p>
        )}
      </div>
    );
  }

  function inputCls(name: keyof FormData) {
    return cn(
      "w-full px-3 py-2.5 bg-white/5 border rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600",
      "focus:outline-none focus:ring-2 transition-all",
      touched.has(name) && errors[name]
        ? "border-red-500/50 focus:ring-red-500/30"
        : "border-white/10 focus:ring-brand-500/40 focus:border-brand-500/50"
    );
  }

  const saveBtnClass = cn(
    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all btn-press shadow-lg min-w-[160px] justify-center",
    submitState === "success"
      ? "bg-green-500 shadow-green-900/30"
      : submitState === "error"
      ? "bg-red-500/80 shadow-red-900/20"
      : "bg-brand-500 hover:bg-brand-600 shadow-orange-900/30"
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="bg-[#16161b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-scale-in"
          style={{ maxHeight: "min(90dvh, 780px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal Header ── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
            <div>
              <h2 className="text-base font-bold text-white">
                {isEdit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isEdit
                  ? `"${product?.name}" ürününü düzenliyorsunuz`
                  : "Menüye yeni bir ürün ekleyin"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/8 text-zinc-500 hover:text-white transition-all flex-shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Form (wraps everything including footer) ── */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col overflow-hidden"
            noValidate
          >
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/8">
                {/* ── Left: Fields ── */}
                <div className="flex-1 p-6 space-y-5">
                  {/* Name */}
                  <FieldWrapper label="Ürün Adı" name="name" required>
                    <input
                      id="field-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => touch("name")}
                      placeholder="Örn: Izgara Köfte"
                      className={inputCls("name")}
                      maxLength={100}
                      autoFocus
                    />
                  </FieldWrapper>

                  {/* Description */}
                  <FieldWrapper label="Açıklama" name="description">
                    <textarea
                      id="field-description"
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      onBlur={() => touch("description")}
                      placeholder="Ürün hakkında kısa bir açıklama yazın..."
                      rows={3}
                      maxLength={300}
                      className={cn(inputCls("description"), "resize-none")}
                    />
                    <p className="text-right text-[10px] text-zinc-700 -mt-1">
                      {form.description.length}/300
                    </p>
                  </FieldWrapper>

                  {/* Price + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrapper label="Fiyat (₺)" name="price" required>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm pointer-events-none">
                          ₺
                        </span>
                        <input
                          id="field-price"
                          type="number"
                          min="1"
                          step="1"
                          value={form.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                          onBlur={() => touch("price")}
                          placeholder="0"
                          className={cn(inputCls("price"), "pl-7")}
                        />
                      </div>
                    </FieldWrapper>

                    <FieldWrapper label="Kategori" name="categoryId" required>
                      <select
                        id="field-category"
                        value={form.categoryId}
                        onChange={(e) => handleChange("categoryId", e.target.value)}
                        onBlur={() => touch("categoryId")}
                        className={cn(inputCls("categoryId"), "cursor-pointer")}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#1a1a20]">
                            {c.emoji} {c.name}
                          </option>
                        ))}
                      </select>
                    </FieldWrapper>
                  </div>

                  {/* Image URL */}
                  <FieldWrapper label="Görsel URL" name="imageUrl">
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      <input
                        id="field-image"
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => handleChange("imageUrl", e.target.value)}
                        onBlur={() => touch("imageUrl")}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={cn(inputCls("imageUrl"), "pl-9")}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-600">
                      Unsplash, CDN veya başka bir görsel URL&apos;i kullanabilirsiniz
                    </p>
                  </FieldWrapper>

                  {/* Availability */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-white/3 rounded-xl border border-white/8">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Satışa Açık</p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Kapalıysa ürün menüde görünmez
                      </p>
                    </div>
                    <button
                      type="button"
                      id="toggle-availability"
                      onClick={() => handleChange("isAvailable", !form.isAvailable)}
                      aria-label={form.isAvailable ? "Pasife al" : "Aktif et"}
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#16161b]",
                        form.isAvailable
                          ? "bg-green-500 focus:ring-green-500"
                          : "bg-zinc-700 focus:ring-zinc-500"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300",
                          form.isAvailable ? "left-6" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* ── Right: Live Preview ── */}
                <div className="lg:w-60 xl:w-64 p-5 flex flex-col gap-4 flex-shrink-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Canlı Önizleme
                  </p>

                  {/* Product card preview */}
                  <div className="bg-[#1e1e26] rounded-2xl border border-white/8 overflow-hidden">
                    <div className="relative h-32 bg-zinc-900">
                      {imgPreview && !imgLoadError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={imgPreview}
                          src={imgPreview}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                          onError={() => setImgLoadError(true)}
                          onLoad={() => setImgLoadError(false)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                          <ImageOff className="w-7 h-7 text-zinc-700" />
                          <span className="text-[10px] text-zinc-700">Görsel yok</span>
                        </div>
                      )}

                      {/* Category badge */}
                      {form.categoryId && (
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-semibold bg-black/60 backdrop-blur-sm text-white rounded-md px-1.5 py-0.5">
                            {categories.find((c) => c.id === form.categoryId)?.emoji}{" "}
                            {categories.find((c) => c.id === form.categoryId)?.name}
                          </span>
                        </div>
                      )}

                      {!form.isAvailable && (
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-red-500/80 rounded-lg px-2.5 py-1">
                            Pasif
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-sm font-bold text-white leading-tight truncate">
                        {form.name || <span className="text-zinc-600 font-normal italic">Ürün Adı...</span>}
                      </p>
                      {form.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {form.description}
                        </p>
                      )}
                      <p className="text-base font-bold text-brand-400 mt-2">
                        {form.price && Number(form.price) > 0
                          ? `₺${Number(form.price).toLocaleString("tr-TR")}`
                          : <span className="text-zinc-700 font-normal text-sm">Fiyat girilmedi</span>}
                      </p>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-brand-400 mb-1">💡 Görsel İpucu</p>
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                      Ücretsiz görseller için:{" "}
                      <span className="text-brand-500 break-all">
                        unsplash.com/photos
                      </span>{" "}
                      sitesini kullanabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Form Footer (inside form!) ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/8 transition-all"
              >
                İptal
              </button>

              <button
                type="submit"
                id="save-product-btn"
                className={saveBtnClass}
              >
                {submitState === "success" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Kaydedildi!
                  </>
                ) : submitState === "error" ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Kontrol Et
                  </>
                ) : isEdit ? (
                  "Değişiklikleri Kaydet"
                ) : (
                  "Ürünü Ekle"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
