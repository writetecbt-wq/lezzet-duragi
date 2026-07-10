import { useState } from "react";
import { Plus, Minus, Trash2, Search, CheckCircle2 } from "lucide-react";
import { MockOrderItem, formatPrice, MOCK_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/product.store";

export function OrderEditor({
  initialItems,
  products,
  categories,
  onSave,
  onCancel,
}: {
  initialItems: MockOrderItem[];
  products: ReturnType<typeof useProductStore.getState>["products"];
  categories: ReturnType<typeof useProductStore.getState>["categories"];
  onSave: (items: MockOrderItem[], total: number) => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<MockOrderItem[]>([...initialItems]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const updateItemQty = (index: number, delta: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: copy[index].quantity + delta };
      if (copy[index].quantity <= 0) {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addProduct = (product: { id: string; name: string; price: number }) => {
    const existing = items.findIndex((i) => i.productId === product.id);
    if (existing >= 0) {
      updateItemQty(existing, 1);
    } else {
      setItems((prev) => [
        ...prev,
        { productId: product.id, name: product.name, quantity: 1, unitPrice: product.price },
      ]);
    }
    setShowAddProduct(false);
    setSearchQuery("");
  };

  const availableProducts = (products.length > 0 ? products : MOCK_PRODUCTS).filter(
    (p) => p.isAvailable && p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#16161b] border border-blue-500/20 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-blue-400">Sipariş Düzenleme</h4>
        <button onClick={onCancel} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">İptal</button>
      </div>

      {/* Current items */}
      <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            <span className="flex-1 text-sm text-zinc-300 truncate">{item.name}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => updateItemQty(idx, -1)} className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateItemQty(idx, 1)} className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-zinc-500 w-16 text-right font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
            <button onClick={() => removeItem(idx)} className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add product */}
      {showAddProduct ? (
        <div className="mb-4 border border-white/10 rounded-xl p-3 bg-white/3 animate-fade-in">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {availableProducts.slice(0, 10).map((p) => (
              <button
                key={p.id}
                onClick={() => addProduct(p)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-left transition-colors"
              >
                <span className="text-sm text-zinc-300">{p.name}</span>
                <span className="text-xs text-brand-400 font-semibold">{formatPrice(p.price)}</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setShowAddProduct(false); setSearchQuery(""); }} className="mt-3 w-full text-xs font-semibold text-zinc-500 hover:text-zinc-300 py-1.5 bg-white/5 rounded-lg transition-colors">
            Kapat
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddProduct(true)}
          className="w-full mb-4 py-2 rounded-lg border border-dashed border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Ürün Ekle
        </button>
      )}

      {/* Total & Save */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-sm font-bold text-white">Toplam: {formatPrice(total)}</span>
        <button
          onClick={() => onSave(items, total)}
          disabled={items.length === 0}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg",
            items.length === 0
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none"
              : "bg-green-500 hover:bg-green-600 text-white shadow-green-900/20 active:scale-95"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          Kaydet
        </button>
      </div>
    </div>
  );
}
