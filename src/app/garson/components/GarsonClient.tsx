"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrderStore, FirestoreOrder } from "@/store/order.store";
import { useProductStore } from "@/store/product.store";
import { useTableStore } from "@/store/table.store";
import { cn } from "@/lib/utils";
import {
  HandPlatter, CreditCard, AlertCircle, Plus, Minus, Trash2,
  Send, Search, ArrowRightLeft, Clock, Utensils, LogOut,
  Bell, X, CheckCircle2, TrendingUp, Trophy, Star
} from "lucide-react";
import { formatPrice, timeAgo, formatTime, getOrderDuration, MockOrderItem } from "@/lib/mock-data";
import { OrderEditor } from "@/components/shared/OrderEditor";

// ─── Garsonlar ────────────────────────────────────────────────────────────────

const WAITERS = [
  { id: "ahmet",  name: "Ahmet",  initials: "AH", color: "#f97316", image: "/avatars/waiter_ahmet_1784281554408.jpg" },
  { id: "mehmet", name: "Mehmet", initials: "ME", color: "#3b82f6", image: "/avatars/waiter_mehmet_1784281562453.jpg" },
  { id: "ayse",   name: "Ayşe",   initials: "AY", color: "#a855f7", image: "/avatars/waiter_ayse_1784281571557.jpg" },
  { id: "ali",    name: "Ali",    initials: "AL", color: "#22c55e", image: "/avatars/waiter_ali_1784281579636.jpg" },
  { id: "zeynep", name: "Zeynep", initials: "ZE", color: "#ec4899", image: "/avatars/waiter_zeynep_1784281589065.jpg" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

import { KasaBillModal } from "../../admin/kasa/components/KasaBillModal";

export function GarsonClient() {
  const {
    orders, placeOrder, serviceRequests, resolveServiceRequest,
    listenToOrders, listenToServiceRequests,
    updateOrderItems, changeOrderTable, updateOrderStatus,
  } = useOrderStore();
  const { products, fetchProductsAndCategories, categories } = useProductStore();
  const { totalTables } = useTableStore();

  const savedWaiterId = typeof window !== "undefined" ? localStorage.getItem("activeWaiterId") : null;
  const [activeWaiter, setActiveWaiter]     = useState(WAITERS.find(w => w.id === savedWaiterId) ?? WAITERS[0]);
  const [showWaiterMenu, setShowWaiterMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTable, setSelectedTable]   = useState<number | null>(null);
  const [selectedCat, setSelectedCat]       = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [cart, setCart]                     = useState<MockOrderItem[]>([]);
  const [note, setNote]                     = useState("");
  const [sending, setSending]               = useState(false);
  const [detailTable, setDetailTable]       = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<number | null>(null);
  const [editingOrder, setEditingOrder]     = useState<string | null>(null);
  const [changingTable, setChangingTable]   = useState<string | null>(null);

  useEffect(() => {
    fetchProductsAndCategories();
    const u1 = listenToOrders();
    const u2 = listenToServiceRequests();
    return () => { u1(); u2(); };
  }, [listenToOrders, listenToServiceRequests, fetchProductsAndCategories]);

  useEffect(() => { setCart([]); setNote(""); }, [selectedTable]);

  const tables = Array.from({ length: totalTables }, (_, i) => i + 1);

  const getTableMeta = (n: number) => {
    const tOrders = orders.filter(o => o.tableNumber === n && o.status !== "PAID" && o.status !== "CANCELLED");
    const hasReq  = serviceRequests.some(r => r.tableNumber === n && r.status === "PENDING");
    const wName   = tOrders[0]?.waiterName;
    const waiter  = WAITERS.find(w => w.id === wName);
    return { tOrders, hasReq, waiter, occupied: tOrders.length > 0 };
  };

  // Categories
  const cats = categories.length > 0 ? categories : [];
  const activeCat = selectedCat ?? cats[0]?.id ?? null;

  const displayProducts = useMemo(() => {
    let list = products.filter(p => p.isAvailable);
    if (activeCat) list = list.filter(p => p.categoryId === activeCat);
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, activeCat, search]);

  // Cart
  const addToCart = (pid: string) => {
    const p = products.find(x => x.id === pid);
    if (!p) return;
    setCart(prev => {
      const ex = prev.find(i => i.productId === pid);
      return ex
        ? prev.map(i => i.productId === pid ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { productId: pid, name: p.name, quantity: 1, unitPrice: p.price }];
    });
  };
  const updateQty = (pid: string, delta: number) =>
    setCart(prev => prev.map(i => i.productId === pid ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));

  const cartTotal     = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleSend = async () => {
    if (!selectedTable || cart.length === 0 || sending) return;
    setSending(true);
    try {
      await placeOrder(selectedTable, cart, cartTotal, note || undefined, activeWaiter.name);
      setCart([]); setNote("");
    } finally { setSending(false); }
  };

  return (
    <div
      className="flex h-full overflow-hidden font-sans"
      style={{ background: "#131319", color: "#e4e1ea" }}
    >
      {/* ─── LEFT PANEL ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col h-full z-10 flex-shrink-0"
        style={{
          width: "30%",
          background: "#1f1f25",
          borderRight: "1px solid #584237",
          boxShadow: "4px 0 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Brand Header */}
        <div
          className="flex items-center justify-between px-6 flex-shrink-0"
          style={{
            height: 72,
            background: "#2a2930",
            borderBottom: "1px solid #584237",
          }}
        >
          <h1 className="font-bold text-xl flex items-center gap-2" style={{ color: "#ffb690" }}>
            <span>🍽️</span> Lezzet Durağı
          </h1>
          <div className="flex items-center gap-1" style={{ color: "#ffb690" }}>
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Waiter Selector */}
        <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #34343b" }}>
          <h2 className="text-xl font-bold mb-4">Garson Paneli</h2>
          <div className="relative">
            <button
              onClick={() => setShowWaiterMenu(v => !v)}
              className="w-full flex items-center justify-between px-4 rounded-lg transition-colors"
              style={{
                height: 48,
                background: "#34343b",
                border: "1px solid #584237",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#f97316", color: "#552100" }}
                >
                  {activeWaiter.initials}
                </div>
                <span className="text-sm font-medium">{activeWaiter.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: "#00b954", color: "#004119" }}
                >
                  Aktif
                </span>
                <span style={{ color: "#e0c0b1" }}>▾</span>
              </div>
            </button>

            {showWaiterMenu && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-20"
                style={{ background: "#2a2930", border: "1px solid #584237", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
              >
                {WAITERS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => { setActiveWaiter(w); setShowWaiterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background: activeWaiter.id === w.id ? "#34343b" : "transparent",
                      color: "#e4e1ea",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "#f97316", color: "#552100" }}
                    >
                      {w.initials}
                    </div>
                    <span className="text-sm">{w.name}</span>
                    {activeWaiter.id === w.id && (
                      <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: "#4ae176" }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all active:scale-95"
            style={{
              height: 40,
              background: `${activeWaiter.color}15`,
              color: activeWaiter.color,
              border: `1px solid ${activeWaiter.color}40`,
            }}
          >
            <TrendingUp className="w-4 h-4" />
            Performansımı Gör
          </button>
        </div>

        {/* Table Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "#e0c0b1" }}>
              <span>⊞</span> Masalar
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {WAITERS.map(w => (
                <div key={w.id} className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded" style={{ background: `${w.color}15`, color: w.color, border: `1px solid ${w.color}40` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: w.color }} />
                  {w.name}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {tables.map(n => {
              const { tOrders, hasReq, waiter, occupied } = getTableMeta(n);
              const isSelected = selectedTable === n;
              const isMine = waiter?.id === activeWaiter.id;

              let bg = "#34343b", border = "1px solid #584237", textC = "#a78b7d";
              let shadow = "none";
              
              if (occupied && waiter) {
                if (isMine) {
                  bg = waiter.color;
                  border = `2px solid ${waiter.color}`;
                  textC = "#fff";
                  shadow = `0px 4px 20px ${waiter.color}66`;
                } else {
                  bg = `${waiter.color}15`;
                  border = `1px solid ${waiter.color}80`;
                  textC = waiter.color;
                }
              } else if (occupied && !waiter) {
                bg = "#ef4444"; // Red for unassigned customer orders
                border = "2px solid #ef4444";
                textC = "#fff";
                shadow = "0px 4px 20px rgba(239,68,68,0.6)";
              }

              if (hasReq) {
                // If there's a request, override the border to red and pulse
                border = "2px solid #ef4444";
                shadow = "0 0 10px rgba(239,68,68,0.5)";
              }
              if (isSelected) border = `2px solid ${activeWaiter.color}`;

              return (
                <button
                  key={n}
                  onClick={() => { setSelectedTable(n); setDetailTable(null); }}
                  className={`relative flex flex-col items-center justify-center rounded-lg transition-all active:scale-95 h-20 ${hasReq ? 'animate-[pulse_2s_infinite]' : ''}`}
                  style={{ background: bg, border, color: textC, boxShadow: shadow }}
                >
                  {hasReq && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center animate-bounce">
                      <AlertCircle className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <span className="text-2xl font-black">{n}</span>
                  {occupied && !isMine && waiter && (
                    <span className="text-[9px] font-bold mt-0.5 opacity-90">{waiter.name}</span>
                  )}
                  {isMine && (
                    <span className="text-[9px] font-bold mt-0.5">Sizin</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift End */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #584237", background: "#1f1f25" }}>
          <button
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors"
            style={{ border: "1px solid #584237", color: "#e4e1ea" }}
          >
            <LogOut className="w-4 h-4" />
            VARDİYA BİTİR
          </button>
        </div>
      </aside>

      {/* ─── CENTER PANEL ────────────────────────────────────────────────── */}
      <main
        className="flex flex-col h-full flex-1 overflow-hidden"
        style={{ background: "#131319" }}
      >
        {/* Category Tabs */}
        <div
          className="flex items-end gap-0 overflow-x-auto flex-shrink-0 sticky top-0 z-10"
          style={{
            borderBottom: "1px solid #34343b",
            background: "rgba(19,19,25,0.85)",
            backdropFilter: "blur(12px)",
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 16,
          }}
        >
          {cats.map(cat => {
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="flex items-center gap-2 px-6 text-sm font-semibold transition-colors relative flex-shrink-0"
                style={{
                  height: 48,
                  borderRadius: "8px 8px 0 0",
                  background: active ? "#ffb690" : "#1f1f25",
                  color: active ? "#552100" : "#e0c0b1",
                }}
              >
                {(cat as any).emoji && <span>{(cat as any).emoji}</span>}
                {cat.name}
                {active && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "#f97316" }}
                  />
                )}
              </button>
            );
          })}

          {/* Search + Detail btn */}
          <div className="ml-auto flex items-center gap-2 pb-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#a78b7d" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ürün ara..."
                className="rounded-lg pl-9 pr-3 text-sm"
                style={{
                  height: 40,
                  background: "#34343b",
                  border: "1px solid #584237",
                  color: "#e4e1ea",
                  outline: "none",
                  width: 180,
                }}
              />
            </div>
            {selectedTable && (
              <button
                onClick={() => setDetailTable(selectedTable)}
                className="flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  height: 40,
                  background: "#34343b",
                  border: "1px solid #584237",
                  color: "#e0c0b1",
                }}
              >
                <Utensils className="w-4 h-4" />
                Masa {selectedTable}
              </button>
            )}
          </div>
        </div>

        {/* Products */}
        {!selectedTable ? (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: "#584237" }}>
            <span className="text-6xl mb-4">🍽️</span>
            <p className="text-lg font-semibold" style={{ color: "#a78b7d" }}>Sol panelden bir masa seçin</p>
            <p className="text-sm mt-1" style={{ color: "#584237" }}>Sipariş girebilmek için önce masa seçmelisiniz</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {displayProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full" style={{ color: "#584237" }}>
                <p className="text-sm">Ürün bulunamadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {displayProducts.map(product => {
                  const inCart = cart.find(i => i.productId === product.id);
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col overflow-hidden rounded-xl transition-all cursor-pointer group"
                      style={{
                        background: "#1f1f25",
                        border: inCart ? "1px solid #f97316" : "1px solid #584237",
                      }}
                    >
                      {/* Image */}
                      <div className="h-32 overflow-hidden relative" style={{ background: "#34343b" }}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-3xl">🍽️</div>
                        )}
                        {inCart && (
                          <div
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                            style={{ background: "#f97316", color: "#552100" }}
                          >
                            {inCart.quantity}
                          </div>
                        )}
                      </div>

                      {/* Info + Actions */}
                      <div className="p-4 flex justify-between items-end flex-1">
                        <div>
                          <h4 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: "#e4e1ea" }}>
                            {product.name}
                          </h4>
                          <p className="text-sm font-bold mt-1 font-mono" style={{ color: "#ffb690" }}>
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {inCart ? (
                          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid #584237" }}>
                            <button
                              onClick={() => updateQty(product.id, -1)}
                              className="w-8 h-8 flex items-center justify-center transition-colors"
                              style={{ background: "#34343b", color: "#e4e1ea" }}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold" style={{ color: "#e4e1ea" }}>
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(product.id, 1)}
                              className="w-8 h-8 flex items-center justify-center transition-colors"
                              style={{ background: "#f97316", color: "#552100" }}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: "#34343b", color: "#e4e1ea" }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "#f97316";
                              (e.currentTarget as HTMLButtonElement).style.color = "#552100";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "#34343b";
                              (e.currentTarget as HTMLButtonElement).style.color = "#e4e1ea";
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col h-full flex-shrink-0 z-10"
        style={{
          width: "25%",
          background: "#1f1f25",
          borderLeft: "1px solid #584237",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Order Header */}
        <div
          className="px-6 py-5 flex-shrink-0"
          style={{ background: "#2a2930", borderBottom: "1px solid #34343b" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#e4e1ea" }}>
                {selectedTable ? `Masa ${selectedTable}` : "Masa Seç"}
              </h2>
              <span className="text-sm" style={{ color: "#e0c0b1" }}>Garson: {activeWaiter.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedTable && (
                <button
                  onClick={() => setDetailTable(selectedTable)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                  style={{ border: "1px solid #584237", color: "#e0c0b1" }}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  Detay
                </button>
              )}
              {selectedTable && (
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm"
                  style={{ background: "#f97316", color: "#552100" }}
                >
                  M{selectedTable}
                </div>
              )}
            </div>
          </div>
          {cartItemCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f97316" }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#f97316" }}>
                {cartItemCount} Ürün Seçildi
              </p>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12" style={{ color: "#584237" }}>
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-sm text-center" style={{ color: "#a78b7d" }}>Menüden ürün seçin</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.productId}
                className="rounded-lg p-3 flex flex-col gap-2 relative"
                style={{ background: "#34343b", border: "1px solid #584237" }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm w-2/3 line-clamp-2" style={{ color: "#e4e1ea" }}>
                    {item.name}
                  </span>
                  <span className="text-sm font-bold font-mono" style={{ color: "#ffb690" }}>
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center rounded-lg overflow-hidden"
                    style={{ background: "#1f1f25", border: "1px solid #584237", height: 32 }}
                  >
                    <button
                      onClick={() => updateQty(item.productId, -1)}
                      className="w-8 h-full flex items-center justify-center transition-colors"
                      style={{ color: "#e4e1ea" }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold" style={{ color: "#e4e1ea" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, 1)}
                      className="w-8 h-full flex items-center justify-center transition-colors"
                      style={{ color: "#ffb690" }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCart(prev => prev.filter(i => i.productId !== item.productId))}
                    className="w-7 h-7 flex items-center justify-center rounded"
                    style={{ color: "#ffb4ab" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Note + Total + Actions */}
        <div
          className="px-6 py-5 flex-shrink-0 flex flex-col gap-4"
          style={{ background: "#2a2930", borderTop: "1px solid #34343b" }}
        >
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Sipariş notu ekle..."
            rows={3}
            className="w-full rounded-lg p-3 text-sm resize-none"
            style={{
              background: "#131319",
              border: "1px solid #584237",
              color: "#e4e1ea",
              outline: "none",
            }}
          />

          <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px dashed #584237" }}>
            <span className="text-sm" style={{ color: "#e0c0b1" }}>Ara Toplam</span>
            <span className="text-sm font-mono">{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg" style={{ color: "#ffb690" }}>
            <span>Toplam</span>
            <span className="font-mono">{formatPrice(cartTotal)}</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSend}
              disabled={!selectedTable || cart.length === 0 || sending}
              className="w-full h-14 flex items-center justify-center gap-2 rounded-lg text-base font-bold transition-all active:scale-[0.98]"
              style={{
                background: selectedTable && cart.length > 0 && !sending ? "#00b954" : "#34343b",
                color: selectedTable && cart.length > 0 && !sending ? "#004119" : "#584237",
              }}
            >
              <Send className="w-5 h-5" />
              {sending ? "GÖNDERİLİYOR..." : "SİPARİŞİ GÖNDER"}
            </button>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors"
                style={{ border: "1px solid #ffb4ab", color: "#ffb4ab" }}
              >
                <Trash2 className="w-4 h-4" />
                Siparişi Temizle
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── TABLE DETAIL MODAL ──────────────────────────────────────────── */}
      {showProfileModal && (
        <WaiterProfileModal
          activeWaiter={activeWaiter}
          orders={orders}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {detailTable !== null && (
        <TableDetailModal
          tableNumber={detailTable}
          onClose={() => { setDetailTable(null); setEditingOrder(null); setChangingTable(null); }}
          orders={orders}
          serviceRequests={serviceRequests}
          resolveServiceRequest={resolveServiceRequest}
          editingOrder={editingOrder}
          setEditingOrder={setEditingOrder}
          changingTable={changingTable}
          setChangingTable={setChangingTable}
          updateOrderItems={updateOrderItems}
          changeOrderTable={changeOrderTable}
          updateOrderStatus={updateOrderStatus}
          products={products}
          categories={categories}
          totalTables={totalTables}
          getTableState={n => {
            const { occupied, hasReq } = getTableMeta(n);
            return {
              statusLabel: hasReq ? "İstek Var" : occupied ? "Dolu" : "Boş",
              textColor: hasReq ? "text-red-400" : occupied ? "text-amber-400" : "text-zinc-500",
            };
          }}
          onOpenPayment={() => {
            setShowPaymentModal(detailTable);
          }}
        />
      )}

      {showPaymentModal !== null && (
        <KasaBillModal
          tableNumber={showPaymentModal}
          onClose={() => setShowPaymentModal(null)}
        />
      )}
    </div>
  );
}

// ─── Table Detail Modal ───────────────────────────────────────────────────────

function TableDetailModal({
  tableNumber, onClose, orders, serviceRequests, resolveServiceRequest,
  editingOrder, setEditingOrder, changingTable, setChangingTable,
  updateOrderItems, changeOrderTable, updateOrderStatus,
  products, categories, totalTables, getTableState, onOpenPayment
}: {
  tableNumber: number;
  onClose: () => void;
  orders: FirestoreOrder[];
  serviceRequests: ReturnType<typeof useOrderStore.getState>["serviceRequests"];
  resolveServiceRequest: (id: string) => void;
  editingOrder: string | null;
  setEditingOrder: (id: string | null) => void;
  changingTable: string | null;
  setChangingTable: (id: string | null) => void;
  updateOrderItems: (id: string, items: MockOrderItem[], total: number) => void;
  changeOrderTable: (id: string, table: number) => void;
  updateOrderStatus: (id: string, s: import("@/store/order.store").OrderStatus, w?: string) => void;
  products: ReturnType<typeof useProductStore.getState>["products"];
  categories: ReturnType<typeof useProductStore.getState>["categories"];
  totalTables: number;
  getTableState: (n: number) => { statusLabel: string; textColor: string };
  onOpenPayment: () => void;
}) {
  const tOrders    = orders.filter(o => o.tableNumber === tableNumber && o.status !== "PAID" && o.status !== "CANCELLED");
  const activeReqs = serviceRequests.filter(r => r.tableNumber === tableNumber && r.status === "PENDING");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="h-full flex flex-col animate-slide-in-right" style={{ width: 420, background: "#1c1c22", borderLeft: "1px solid #584237", boxShadow: "-8px 0 40px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid #34343b" }}>
          <div>
            <h3 className="text-xl font-bold" style={{ color: "#e4e1ea" }}>Masa {tableNumber}</h3>
            <p className="text-sm" style={{ color: "#a78b7d" }}>{tOrders.length} aktif sipariş</p>
          </div>
          <div className="flex items-center gap-2">
            {tOrders.length > 0 && (
              <>
                <button
                  onClick={onOpenPayment}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                  style={{ background: "#f59e0b", color: "#fff" }}
                >
                  Ödeme Al
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Tüm siparişleri ödendi olarak işaretlemek istediğinize emin misiniz?")) {
                      tOrders.forEach(o => updateOrderStatus(o.id, "PAID"));
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                  style={{ background: "#22c55e", color: "#fff" }}
                >
                  Hesabı Kapat
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: "#a78b7d" }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeReqs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#a78b7d" }}>
                <AlertCircle className="w-4 h-4 text-red-500" /> Servis İstekleri
              </h4>
              {activeReqs.map(req => {
                const isWaiter = req.type === "WAITER";
                const bgColors = isWaiter 
                  ? { outer: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", iconBg: "rgba(59,130,246,0.2)", text: "#60a5fa", btn: "#3b82f6" }
                  : { outer: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", iconBg: "rgba(34,197,94,0.2)", text: "#4ade80", btn: "#22c55e" };
                
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-xl animate-pulse" style={{ background: bgColors.outer, border: bgColors.border }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWaiter ? 'animate-bounce' : 'animate-[spin_3s_linear_infinite]'}`} style={{ background: bgColors.iconBg, color: bgColors.text }}>
                        {isWaiter ? <Bell className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#e4e1ea" }}>{isWaiter ? "Garson Çağrısı" : "Hesap İstendi"}</p>
                        <p className="text-xs" style={{ color: bgColors.text }}>{timeAgo(req.createdAt)}</p>
                      </div>
                    </div>
                    <button onClick={() => resolveServiceRequest(req.id)} className="px-4 py-2 text-xs font-bold rounded-lg transition-transform active:scale-95" style={{ background: bgColors.btn, color: "#fff" }}>Tamamla</button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#a78b7d" }}>Siparişler</h4>
            {tOrders.length === 0 ? (
              <p className="text-sm p-4 rounded-xl" style={{ color: "#a78b7d", background: "rgba(255,255,255,0.03)" }}>Bu masada aktif sipariş yok.</p>
            ) : (
              tOrders.map(order => (
                <div key={order.id}>
                  {editingOrder === order.id ? (
                    <OrderEditor initialItems={order.items} products={products} categories={categories}
                      onSave={(items, total) => { updateOrderItems(order.id, items, total); setEditingOrder(null); }}
                      onCancel={() => setEditingOrder(null)} />
                  ) : changingTable === order.id ? (
                    <TableChanger order={order} totalTables={totalTables} getTableState={getTableState}
                      onConfirm={t => { changeOrderTable(order.id, t); setChangingTable(null); }}
                      onCancel={() => setChangingTable(null)} />
                  ) : (
                    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #34343b" }}>
                      <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: "1px solid #34343b" }}>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{
                          background: order.status === "PENDING" ? "rgba(249,115,22,0.2)" : order.status === "PREPARING" ? "rgba(59,130,246,0.2)" : "rgba(34,197,94,0.2)",
                          color: order.status === "PENDING" ? "#fb923c" : order.status === "PREPARING" ? "#60a5fa" : "#4ade80",
                        }}>
                          {order.status === "PENDING" ? "YENİ SİPARİŞ" : order.status === "PREPARING" ? "HAZIRLANIYOR" : "TAMAMLANDI"}
                        </span>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "#a78b7d" }}>
                          {order.waiterName && <span>{WAITERS.find(w => w.name === order.waiterName || w.id === order.waiterName)?.name || order.waiterName}</span>}
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(order.createdAt)} · {getOrderDuration(order.createdAt)}
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span style={{ color: "#e0c0b1" }}><span className="font-bold mr-1" style={{ color: "#f97316" }}>{item.quantity}x</span>{item.name}</span>
                            <span style={{ color: "#a78b7d" }}>{formatPrice(item.unitPrice * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-3 mb-3" style={{ borderTop: "1px solid #34343b" }}>
                        <span className="text-xs" style={{ color: "#a78b7d" }}>Toplam</span>
                        <span className="font-bold" style={{ color: "#ffb690" }}>{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {order.status === "PENDING" && (
                          <button onClick={() => updateOrderStatus(order.id, "PREPARING")} className="flex-1 py-2 rounded-xl text-xs font-bold" style={{ background: "#f97316", color: "#552100" }}>Hazırlanıyor İşaretle</button>
                        )}
                        {order.status === "PREPARING" && (
                          <button onClick={() => updateOrderStatus(order.id, "COMPLETED")} className="flex-1 py-2 rounded-xl text-xs font-bold" style={{ background: "#22c55e", color: "#fff" }}>Tamamlandı İşaretle</button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingOrder(order.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>
                          <Utensils className="w-3.5 h-3.5" />Düzenle
                        </button>
                        <button onClick={() => setChangingTable(order.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc" }}>
                          <ArrowRightLeft className="w-3.5 h-3.5" />Masa Değiştir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table Changer ────────────────────────────────────────────────────────────

function TableChanger({ order, totalTables, getTableState, onConfirm, onCancel }: {
  order: FirestoreOrder;
  totalTables: number;
  getTableState: (n: number) => { statusLabel: string; textColor: string };
  onConfirm: (t: number) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const tables = Array.from({ length: totalTables }, (_, i) => i + 1).filter(t => t !== order.tableNumber);

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)" }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold" style={{ color: "#c084fc" }}>Masa {order.tableNumber} → ?</h4>
        <button onClick={onCancel} className="text-xs" style={{ color: "#a78b7d" }}>İptal</button>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4 max-h-48 overflow-y-auto">
        {tables.map(t => {
          const s = getTableState(t);
          return (
            <button key={t} onClick={() => setSelected(t)}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: selected === t ? "#a855f7" : "rgba(255,255,255,0.04)",
                border: selected === t ? "1px solid #a855f7" : "1px solid #34343b",
                color: selected === t ? "#fff" : "#a78b7d",
              }}
            >
              {t}
              <span className="text-[8px] font-medium mt-0.5">{s.statusLabel}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => selected && onConfirm(selected)}
        disabled={!selected}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
        style={{
          background: selected ? "#a855f7" : "#34343b",
          color: selected ? "#fff" : "#584237",
        }}
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
        Masa {selected || "?"}&apos;ye Taşı
      </button>
    </div>
  );
}

// ─── Waiter Profile Modal ───────────────────────────────────────────────────

function WaiterProfileModal({
  activeWaiter,
  orders,
  onClose,
}: {
  activeWaiter: typeof WAITERS[0];
  orders: FirestoreOrder[];
  onClose: () => void;
}) {
  const DAILY_GOAL = 5000;

  // Compute Stats
  const paidOrders = orders.filter(o => o.status === "PAID" || o.status === "COMPLETED");
  
  // My Stats
  let myRevenue = 0;
  let myOrderCount = 0;
  const productCountMap = new Map<string, { name: string; count: number; revenue: number }>();

  // All waiters revenue map to find rank
  const allRevenues = new Map<string, number>();

  paidOrders.forEach(order => {
    if (order.waiterName) {
      allRevenues.set(order.waiterName, (allRevenues.get(order.waiterName) || 0) + order.totalAmount);
      
      if (order.waiterName === activeWaiter.id) {
        myRevenue += order.totalAmount;
        myOrderCount++;
        order.items.forEach(item => {
          const existing = productCountMap.get(item.productId) || { name: item.name, count: 0, revenue: 0 };
          existing.count += item.quantity;
          existing.revenue += (item.quantity * item.unitPrice);
          productCountMap.set(item.productId, existing);
        });
      }
    }
  });

  const topProducts = Array.from(productCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Calculate Rank
  const leaderboard = Array.from(allRevenues.entries())
    .sort((a, b) => b[1] - a[1]);
  const myRank = leaderboard.findIndex(w => w[0] === activeWaiter.id) + 1;

  const progressPercent = Math.min(100, Math.round((myRevenue / DAILY_GOAL) * 100));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden animate-slide-up" style={{ background: "#1c1c22", border: `1px solid ${activeWaiter.color}40`, boxShadow: `0 20px 60px ${activeWaiter.color}20` }}>
        
        {/* Header */}
        <div className="px-6 py-8 flex flex-col items-center relative" style={{ background: `linear-gradient(to bottom, ${activeWaiter.color}15, transparent)` }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-24 h-24 rounded-full border-4 shadow-xl mb-4" style={{ borderColor: activeWaiter.color, overflow: "hidden" }}>
            {activeWaiter.image ? (
              <img src={activeWaiter.image} alt={activeWaiter.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black" style={{ background: activeWaiter.color, color: "#fff" }}>
                {activeWaiter.initials}
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-white">{activeWaiter.name}</h2>
          <p className="text-sm font-medium mt-1" style={{ color: activeWaiter.color }}>Günlük Performans Özeti</p>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 space-y-6">
          
          {/* Main KPI */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Bugünkü Cirom</p>
              <p className="text-2xl font-black text-white">{formatPrice(myRevenue)}</p>
            </div>
            <div className="flex-1 rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Satış Sıralamam</p>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: myRank === 1 ? "#fbbf24" : activeWaiter.color }} />
                <p className="text-2xl font-black text-white">{myRank > 0 ? `${myRank}.` : "-"}</p>
              </div>
            </div>
          </div>

          {/* Goal Progress */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-zinc-300">Günlük Satış Hedefi</span>
              <span className="text-xs font-bold" style={{ color: activeWaiter.color }}>% {progressPercent}</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%`, background: activeWaiter.color, boxShadow: `0 0 10px ${activeWaiter.color}` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] font-bold text-zinc-500">
              <span>0 ₺</span>
              <span>{formatPrice(DAILY_GOAL)}</span>
            </div>
          </div>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: activeWaiter.color }}>
                <Star className="w-4 h-4" /> En Çok Sattıklarım
              </h4>
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${activeWaiter.color}30`, color: activeWaiter.color }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">{p.count} porsiyon</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
        
        {/* Footer */}
        <div className="p-6">
          <button onClick={onClose} className="w-full h-14 rounded-xl text-sm font-bold transition-transform active:scale-95" style={{ background: activeWaiter.color, color: "#fff", boxShadow: `0 4px 15px ${activeWaiter.color}50` }}>
            Sipariş Almaya Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
