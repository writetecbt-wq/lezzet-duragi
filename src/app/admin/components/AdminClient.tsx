"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  ChefHat,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  Bike,
  MapPin,
} from "lucide-react";
import {
  MockOrder,
  MockOrderItem,
  formatPrice,
  timeAgo,
  formatTime,
  getOrderDuration,
} from "@/lib/mock-data";
import { useOrderStore, FirestoreOrder } from "@/store/order.store";
import { cn } from "@/lib/utils";
import { OrderEditor } from "@/components/shared/OrderEditor";
import { useProductStore } from "@/store/product.store";

type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "PAID" | "CANCELLED";

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgDark: string;
    borderColor: string;
    headerGlow: string;
    icon: React.ElementType;
    next?: OrderStatus;
    nextLabel?: string;
  }
> = {
  PENDING: {
    label: "Yeni Siparişler",
    color: "text-amber-400",
    bgDark: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    headerGlow: "shadow-amber-500/20",
    icon: Bell,
    next: "PREPARING",
    nextLabel: "Hazırlamaya Başla",
  },
  PREPARING: {
    label: "Hazırlanıyor",
    color: "text-blue-400",
    bgDark: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    headerGlow: "shadow-blue-500/20",
    icon: ChefHat,
    next: "COMPLETED",
    nextLabel: "Tamamlandı ✓",
  },
  COMPLETED: {
    label: "Tamamlandı",
    color: "text-green-400",
    bgDark: "bg-green-500/10",
    borderColor: "border-green-500/25",
    headerGlow: "shadow-green-500/20",
    icon: CheckCircle2,
    next: "PAID",
    nextLabel: "Ödendi İşaretle",
  },
  ON_THE_WAY: {
    label: "Yola Çıktı",
    color: "text-purple-400",
    bgDark: "bg-purple-500/10",
    borderColor: "border-purple-500/25",
    headerGlow: "shadow-purple-500/20",
    icon: Bike,
    next: "DELIVERED",
    nextLabel: "Teslim Edildi",
  },
  DELIVERED: {
    label: "Teslim Edildi",
    color: "text-teal-400",
    bgDark: "bg-teal-500/10",
    borderColor: "border-teal-500/25",
    headerGlow: "shadow-teal-500/20",
    icon: CheckCircle2,
    next: "PAID",
    nextLabel: "Ödendi İşaretle",
  },
  PAID: {
    label: "Ödendi",
    color: "text-brand-400",
    bgDark: "bg-brand-500/10",
    borderColor: "border-brand-500/25",
    headerGlow: "shadow-brand-500/20",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "İptal",
    color: "text-red-400",
    bgDark: "bg-red-500/10",
    borderColor: "border-red-500/20",
    headerGlow: "",
    icon: XCircle,
  },
};

// ─── Mock order generator ─────────────────────────────────────────────────

let orderCounter = 100;

function generateMockOrder(): MockOrder {
  const tableNum = Math.floor(Math.random() * 10) + 1;
  const SAMPLE_ITEMS: Array<{ name: string; price: number }> = [
    { name: "Izgara Köfte", price: 180 },
    { name: "Tavuk Şiş", price: 160 },
    { name: "Mercimek Çorbası", price: 60 },
    { name: "Türk Çayı", price: 25 },
    { name: "Baklava", price: 120 },
    { name: "Caesar Salata", price: 90 },
    { name: "Karışık Pizza", price: 220 },
    { name: "Limonata", price: 50 },
  ];
  const count = Math.floor(Math.random() * 3) + 1;
  const items: MockOrderItem[] = Array.from({ length: count }, () => {
    const sample = SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)];
    return {
      productId: `prod_${Math.random()}`,
      name: sample.name,
      quantity: Math.floor(Math.random() * 2) + 1,
      unitPrice: sample.price,
    };
  });
  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  orderCounter++;
  return {
    id: `order_${orderCounter}`,
    tableNumber: tableNum,
    status: "PENDING",
    totalAmount,
    createdAt: new Date(),
    items,
  };
}

// ─── Main Component ────────────────────────────────────────────────────────

export function AdminClient() {
  const { orders, cancelOrder, updateOrderStatus, updateOrderItems, placeOrder, assignCourier } = useOrderStore();
  const { products, categories } = useProductStore();
  const [notification, setNotification] = useState<{ msg: string; key: number } | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [editingOrder, setEditingOrder] = useState<FirestoreOrder | MockOrder | null>(null);
  const [prevOrderCount, setPrevOrderCount] = useState(orders.length);

  // Detect newly added orders from other tabs or store directly
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initializedOrdersRef = useRef(false);

  useEffect(() => {
    // Initialize seenIds on first load
    if (!initializedOrdersRef.current && orders.length > 0) {
      orders.forEach(o => seenOrderIdsRef.current.add(o.id));
      initializedOrdersRef.current = true;
      return;
    }

    // Find any order we haven't seen yet
    const unseenOrder = orders.find(o => !seenOrderIdsRef.current.has(o.id));

    if (unseenOrder) {
      seenOrderIdsRef.current.add(unseenOrder.id);
      setNewOrderIds((prev) => new Set([...prev, unseenOrder.id]));
      setNotification({ msg: `Masa ${unseenOrder.tableNumber} yeni sipariş verdi!`, key: Date.now() });
      
      // Auto-remove new highlight
      setTimeout(() => {
        setNewOrderIds((prev) => { const n = new Set(prev); n.delete(unseenOrder.id); return n; });
      }, 6000);
      
      return;
    }

    // Keep seenIds up to date
    orders.forEach(o => seenOrderIdsRef.current.add(o.id));
  }, [orders]);

  // Handle notification auto-hide separately so it doesn't get cancelled when orders update
  useEffect(() => {
    if (notification) {
      const id = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(id);
    }
  }, [notification]);

  const addSimulatedOrder = useCallback(() => {
    const mock = generateMockOrder();
    placeOrder(mock.tableNumber, mock.items, mock.totalAmount, mock.notes);
  }, [placeOrder]);

  // Stats
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const preparing = orders.filter((o) => o.status === "PREPARING").length;
  const completed = orders.filter((o) => o.status === "COMPLETED").length;
  const revenue = orders.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED" || o.status === "PAID").reduce((s, o) => s + o.totalAmount, 0);

  const COLUMNS: OrderStatus[] = ["PENDING", "PREPARING", "ON_THE_WAY", "COMPLETED"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* ── Notification Toast ── */}
      {notification && (
        <div
          key={notification.key}
          className="fixed top-20 right-5 z-50 animate-slide-in-right"
        >
          <div className="flex items-center gap-3 bg-[#1c1c22] border border-amber-500/40 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/40">
            <div className="relative flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">Yeni Sipariş</p>
              <p className="text-sm font-semibold text-white">{notification.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Bar ── */}
      <div className="px-6 py-4 border-b border-white/8 bg-[#0f0f12]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Bell} label="Bekleyen" value={pending} color="text-amber-400" pulse={pending > 0} />
          <StatCard icon={ChefHat} label="Hazırlanıyor" value={preparing} color="text-blue-400" />
          <StatCard icon={CheckCircle2} label="Tamamlanan" value={completed} color="text-green-400" />
          <StatCard icon={TrendingUp} label="Toplam Ciro" value={formatPrice(revenue)} color="text-brand-400" />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 py-3 border-b border-white/8 flex items-center justify-between gap-4 bg-[#0f0f12]">
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-300">{orders.length}</span> sipariş
        </p>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-white/5 border border-white/8 rounded-xl p-1 gap-0.5">
            {(["kanban", "list"] as const).map((v) => (
              <button
                key={v}
                id={`${v}-view-btn`}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  view === v ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {v === "kanban" ? "Kanban" : "Liste"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addSimulatedOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Masa Siparişi</span>
            </button>
            <button
              onClick={() => useOrderStore.getState().simulateExternalOrder("YEMEKSEPETI")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-all"
            >
              <span className="hidden sm:inline">Yemeksepeti</span>
            </button>
            <button
              onClick={() => useOrderStore.getState().simulateExternalOrder("GETIR")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 text-xs font-semibold transition-all"
            >
              <span className="hidden sm:inline">Getir</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {view === "kanban" ? (
        <div className="flex-1 overflow-auto p-5">
          <div className="flex gap-4 h-full min-w-[768px]">
            {COLUMNS.map((status) => {
              const cfg = STATUS_CONFIG[status];
              const col = orders.filter((o) => o.status === status);
              const Icon = cfg.icon;
              return (
                <div key={status} className="flex-1 flex flex-col gap-3 min-w-[240px] max-w-[400px]">
                  {/* Column header */}
                  <div className={cn("flex items-center justify-between px-4 py-3 rounded-xl border", cfg.bgDark, cfg.borderColor)}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", cfg.color)} />
                      <span className="text-sm font-semibold text-zinc-200">{cfg.label}</span>
                    </div>
                    <div className={cn("text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center", cfg.bgDark, cfg.color)}>
                      {col.length}
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 pb-2">
                    {col.length === 0 ? (
                      <div className="h-28 rounded-xl border border-dashed border-white/8 flex items-center justify-center">
                        <p className="text-xs text-zinc-700">Sipariş yok</p>
                      </div>
                    ) : (
                      (status === "COMPLETED"
                        ? Array.from(
                            col.reduce((map, order) => {
                              const existing = map.get(order.tableNumber);
                              if (existing) {
                                existing.items.push(...order.items);
                                existing.totalAmount += order.totalAmount;
                                existing.id += "," + order.id; // Store comma-separated IDs
                              } else {
                                // Deep copy to avoid mutating original state
                                map.set(order.tableNumber, {
                                  ...order,
                                  items: [...order.items],
                                });
                              }
                              return map;
                            }, new Map<number, typeof orders[0]>()).values()
                          )
                        : col
                      ).map((order) => (
                        <KanbanCard
                          key={order.id}
                          order={order}
                          isNew={newOrderIds.has(order.id)}
                          config={cfg}
                          onAdvance={cfg.next ? () => {
                            order.id.split(",").forEach(id => {
                              // Custom routing for delivery
                              if (status === "PREPARING" && order.source && order.source !== "DINE_IN") {
                                assignCourier(id, "Bölge Kuryesi");
                              } else if (status === "ON_THE_WAY") {
                                updateOrderStatus(id, "DELIVERED");
                              } else {
                                updateOrderStatus(id, cfg.next!);
                              }
                            });
                          } : undefined}
                          onCancel={() => {
                            order.id.split(",").forEach(id => cancelOrder(id))
                          }}
                          onEdit={() => setEditingOrder(order)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2 max-w-5xl mx-auto">
            {orders.filter((o) => o.status !== "CANCELLED" && o.status !== "PAID").map((order) => (
              <ListRow
                key={order.id}
                order={order}
                isNew={newOrderIds.has(order.id)}
                onAdvance={STATUS_CONFIG[order.status].next ? () => updateOrderStatus(order.id, STATUS_CONFIG[order.status].next!) : undefined}
                onCancel={() => cancelOrder(order.id)}
                onEdit={() => setEditingOrder(order)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Order Editor Modal ── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <OrderEditor
              initialItems={editingOrder.items}
              products={products}
              categories={categories}
              onSave={(items, total) => {
                updateOrderItems(editingOrder.id, items, total);
                setEditingOrder(null);
              }}
              onCancel={() => setEditingOrder(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  pulse,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border px-4 py-3 transition-all",
      pulse ? "bg-amber-500/5 border-amber-500/30" : "bg-white/4 border-white/8"
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", color)} />
        <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide truncate">{label}</span>
        {pulse && (
          <span className="relative flex w-2 h-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-amber-500" />
          </span>
        )}
      </div>
      <p className={cn("text-2xl font-bold tracking-tight", color)}>{value}</p>
    </div>
  );
}

// ─── Kanban Card ───────────────────────────────────────────────────────────

function KanbanCard({
  order,
  isNew,
  config,
  onAdvance,
  onCancel,
  onEdit,
}: {
  order: FirestoreOrder;
  isNew: boolean;
  config: (typeof STATUS_CONFIG)[OrderStatus];
  onAdvance?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}) {
  const [expanded, setExpanded] = useState(isNew || order.status === "PENDING");

  return (
    <div className={cn(
      "bg-[#16161b] border rounded-xl overflow-hidden transition-all",
      isNew ? "border-amber-500/50 shadow-lg shadow-amber-500/10 animate-scale-in" : "border-white/8"
    )}>
      {isNew && <div className="h-0.5 bg-gradient-to-r from-amber-400 via-brand-500 to-transparent" />}

      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {order.source === "YEMEKSEPETI" ? (
          <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs flex-shrink-0">YS</div>
        ) : order.source === "GETIR" ? (
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs flex-shrink-0">GT</div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center font-bold text-base text-white flex-shrink-0">
            {order.tableNumber}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">
              {order.source === "YEMEKSEPETI" ? "Yemeksepeti" : order.source === "GETIR" ? "Getir" : `Masa ${order.tableNumber}`}
            </p>
            {isNew && (
              <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">YENİ</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(order.createdAt)}</span>
            <span>·</span>
            <span className={cn(order.status === "COMPLETED" ? "text-green-500/80" : "text-amber-500/80")}>
              {getOrderDuration(order.createdAt, order.completedAt)}
            </span>
            <span>·</span>
            <span>{order.items.length} ürün</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-brand-400">{formatPrice(order.totalAmount)}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-600 flex-shrink-0" />
        )}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          <div className="py-3 space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs gap-3">
                <span className="text-zinc-400 flex-1 min-w-0 truncate">
                  <span className="font-bold text-zinc-300">×{item.quantity}</span> {item.name}
                </span>
                <span className="text-zinc-500 flex-shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="mt-1 mb-3 px-3 py-2 bg-amber-500/8 rounded-lg border border-amber-500/20">
              <p className="text-[10px] text-amber-400 font-semibold mb-0.5">Not</p>
              <p className="text-xs text-amber-200/80">{order.notes}</p>
            </div>
          )}

          {order.customerInfo && (
            <div className="mt-1 mb-3 px-3 py-2 bg-blue-500/8 rounded-lg border border-blue-500/20 flex flex-col gap-1">
              <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1"><MapPin className="w-3 h-3"/> Müşteri Bilgileri</p>
              <p className="text-xs text-blue-100/80 font-medium">{order.customerInfo.name}</p>
              <p className="text-[11px] text-blue-200/60 leading-tight">{order.customerInfo.address}</p>
              <p className="text-[11px] text-blue-200/60">{order.customerInfo.phone}</p>
            </div>
          )}

          {order.courierName && (
            <div className="mt-1 mb-3 px-3 py-2 bg-purple-500/8 rounded-lg border border-purple-500/20 flex flex-col gap-1">
              <p className="text-[10px] text-purple-400 font-semibold flex items-center gap-1"><Bike className="w-3 h-3"/> Kurye</p>
              <p className="text-xs text-purple-100/80 font-medium">{order.courierName}</p>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {onAdvance && (
              <button
                id={`advance-${order.id}`}
                onClick={onAdvance}
                className={cn(
                  "flex-1 py-2 rounded-xl text-white text-xs font-bold transition-all btn-press",
                  order.status === "COMPLETED" ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-900/20" : "bg-brand-500 hover:bg-brand-600"
                )}
              >
                {config.nextLabel}
              </button>
            )}
            {onEdit && order.status !== "PAID" && order.status !== "CANCELLED" && (
              <button
                id={`edit-${order.id}`}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-xs font-bold"
              >
                Düzenle
              </button>
            )}
            {order.status !== "COMPLETED" && order.status !== "PAID" && (
              <button
                id={`cancel-${order.id}`}
                onClick={onCancel}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── List Row ──────────────────────────────────────────────────────────────

function ListRow({
  order,
  isNew,
  onAdvance,
  onCancel,
  onEdit,
}: {
  order: FirestoreOrder;
  isNew: boolean;
  onAdvance?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;

  return (
    <div className={cn(
      "bg-[#16161b] border rounded-xl px-4 py-3 flex items-center gap-4 transition-all",
      isNew ? "border-amber-500/50 animate-scale-in" : "border-white/8"
    )}>
      <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
        {order.source === "YEMEKSEPETI" ? (
          <span className="text-red-500 text-xs">YS</span>
        ) : order.source === "GETIR" ? (
          <span className="text-purple-400 text-xs">GT</span>
        ) : (
          order.tableNumber
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">
            {order.source === "YEMEKSEPETI" ? "Yemeksepeti" : order.source === "GETIR" ? "Getir" : `Masa ${order.tableNumber}`}
          </span>
          {isNew && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">YENİ</span>}
        </div>
        <p className="text-xs text-zinc-500 truncate mt-0.5">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
        </p>
      </div>

      <div className={cn("hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0", cfg.bgDark, cfg.color)}>
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </div>

      <div className="text-xs flex flex-col items-end flex-shrink-0 hidden md:flex w-24 text-right">
        <span className="text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(order.createdAt)}</span>
        <span className={cn("font-medium", order.status === "COMPLETED" ? "text-green-500/80" : "text-amber-500/80")}>
          {getOrderDuration(order.createdAt, order.completedAt)}
        </span>
      </div>

      <p className="text-sm font-bold text-brand-400 flex-shrink-0 w-20 text-right">{formatPrice(order.totalAmount)}</p>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {onAdvance && (
          <button
            id={`list-adv-${order.id}`}
            onClick={onAdvance}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
              order.status === "COMPLETED"
                ? "bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25"
                : "bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25"
            )}
          >
            {cfg.nextLabel}
          </button>
        )}
        {onEdit && order.status !== "PAID" && order.status !== "CANCELLED" && (
          <button
            id={`list-edit-${order.id}`}
            onClick={onEdit}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25"
          >
            Düzenle
          </button>
        )}
        {order.status !== "COMPLETED" && order.status !== "PAID" && (
          <button
            id={`list-cancel-${order.id}`}
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/15"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
