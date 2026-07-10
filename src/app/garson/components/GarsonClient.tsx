"use client";

import { useState, useEffect, useRef } from "react";
import { useOrderStore, FirestoreOrder } from "@/store/order.store";
import { useProductStore } from "@/store/product.store";
import { useTableStore } from "@/store/table.store";
import { cn } from "@/lib/utils";
import {
  HandPlatter,
  CreditCard,
  Clock,
  Utensils,
  AlertCircle,
  X,
  ArrowRightLeft,
  Minus,
  Plus,
  Trash2,
  Check,
  Search,
} from "lucide-react";
import { formatPrice, timeAgo, formatTime, getOrderDuration, MockOrderItem, MOCK_PRODUCTS } from "@/lib/mock-data";
import { OrderEditor } from "@/components/shared/OrderEditor";

export function GarsonClient() {
  const { orders, placeOrder, serviceRequests, resolveServiceRequest, listenToOrders, listenToServiceRequests, updateOrderItems, changeOrderTable, updateOrderStatus } = useOrderStore();
  const { products, fetchProductsAndCategories, categories } = useProductStore();
  const { totalTables } = useTableStore();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [changingTable, setChangingTable] = useState<string | null>(null);

  useEffect(() => {
    fetchProductsAndCategories();
    const unsubOrders = listenToOrders();
    const unsubRequests = listenToServiceRequests();
    return () => {
      unsubOrders();
      unsubRequests();
    };
  }, [listenToOrders, listenToServiceRequests, fetchProductsAndCategories]);

  const tables = Array.from({ length: totalTables }, (_, i) => i + 1);

  const getTableState = (tableNumber: number) => {
    const tableOrders = orders.filter(
      (o) =>
        o.tableNumber === tableNumber &&
        o.status !== "PAID" &&
        o.status !== "CANCELLED"
    );
    const activeRequests = serviceRequests.filter(
      (r) => r.tableNumber === tableNumber && r.status === "PENDING"
    );

    const isOccupied = tableOrders.length > 0;
    const hasRequest = activeRequests.length > 0;

    let bgColor = "bg-green-500/10 border-green-500/30";
    let textColor = "text-green-500";
    let statusLabel = "Boş";

    if (hasRequest) {
      bgColor = "bg-red-500/15 border-red-500/50";
      textColor = "text-red-400";
      statusLabel = "İstek Var";
    } else if (isOccupied) {
      const isPreparing = tableOrders.some((o) => o.status === "PREPARING");
      if (isPreparing) {
        bgColor = "bg-blue-500/10 border-blue-500/30";
        textColor = "text-blue-400";
        statusLabel = "Hazırlanıyor";
      } else {
        bgColor = "bg-amber-500/10 border-amber-500/30";
        textColor = "text-amber-400";
        statusLabel = "Bekliyor";
      }
    }

    return { tableOrders, activeRequests, isOccupied, hasRequest, bgColor, textColor, statusLabel };
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Masalar</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Masa seçerek sipariş detaylarını görün ve düzenleyin.
        </p>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {tables.map((tableNum) => {
          const { hasRequest, bgColor, textColor, statusLabel, tableOrders } = getTableState(tableNum);
          return (
            <button
              key={tableNum}
              onClick={() => setSelectedTable(tableNum)}
              className={cn(
                "relative flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all hover:scale-[1.02] active:scale-95",
                bgColor,
                selectedTable === tableNum && "ring-2 ring-brand-500 ring-offset-2 ring-offset-[#0f0f12]"
              )}
            >
              {hasRequest && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center animate-bounce shadow-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="text-3xl font-black text-white/90 mb-1">{tableNum}</div>
              <div className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40", textColor)}>
                {statusLabel}
              </div>
              {tableOrders.length > 0 && (
                <div className="mt-1.5 text-[10px] text-zinc-500 flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  {tableOrders.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Table Detail Panel */}
      {selectedTable && (
        <TableDetailPanel
          tableNumber={selectedTable}
          onClose={() => { setSelectedTable(null); setEditingOrder(null); }}
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
          placeOrder={placeOrder}
          products={products}
          categories={categories}
          totalTables={totalTables}
          getTableState={getTableState}
        />
      )}
    </div>
  );
}

// ─── Table Detail Panel ─────────────────────────────────────────────────────

function TableDetailPanel({
  tableNumber,
  onClose,
  orders,
  serviceRequests,
  resolveServiceRequest,
  editingOrder,
  setEditingOrder,
  changingTable,
  setChangingTable,
  updateOrderItems,
  changeOrderTable,
  updateOrderStatus,
  placeOrder,
  products,
  categories,
  totalTables,
  getTableState,
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
  updateOrderItems: (orderId: string, items: MockOrderItem[], total: number) => void;
  changeOrderTable: (orderId: string, newTable: number) => void;
  updateOrderStatus: (orderId: string, status: "PENDING" | "PREPARING" | "COMPLETED" | "PAID" | "CANCELLED", waiterName?: string) => void;
  placeOrder: (tableNumber: number, items: MockOrderItem[], totalAmount: number, notes?: string) => Promise<void>;
  products: ReturnType<typeof useProductStore.getState>["products"];
  categories: ReturnType<typeof useProductStore.getState>["categories"];
  totalTables: number;
  getTableState: (n: number) => { statusLabel: string; textColor: string };
}) {
  const tableOrders = orders.filter(
    (o) => o.tableNumber === tableNumber && o.status !== "PAID" && o.status !== "CANCELLED"
  );
  const activeRequests = serviceRequests.filter(
    (r) => r.tableNumber === tableNumber && r.status === "PENDING"
  );
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#16161b] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div>
          <h3 className="text-xl font-bold text-white">Masa {tableNumber}</h3>
          <p className="text-sm text-zinc-500">{tableOrders.length} aktif sipariş</p>
        </div>
        <div className="flex items-center gap-2">
          {tableOrders.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Tüm siparişleri ödendi olarak işaretlemek istediğinize emin misiniz?")) {
                  tableOrders.forEach(o => updateOrderStatus(o.id, "PAID"));
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-xs font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-lg shadow-green-900/20"
            >
              Hesabı Kapat
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Service Requests */}
        {activeRequests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Servis İstekleri
            </h4>
            {activeRequests.map((req) => (
              <div key={req.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    {req.type === "WAITER" ? <HandPlatter className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {req.type === "WAITER" ? "Garson Çağrısı" : "Hesap İstendi"}
                    </p>
                    <p className="text-xs text-red-400/80">{timeAgo(req.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => resolveServiceRequest(req.id)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Tamamla
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Siparişler</h4>
            {!isCreatingOrder && (
              <button
                onClick={() => setIsCreatingOrder(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 text-xs font-semibold rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Sipariş
              </button>
            )}
          </div>

          {isCreatingOrder && (
            <OrderEditor
              initialItems={[]}
              products={products}
              categories={categories}
              onSave={(items, total) => {
                placeOrder(tableNumber, items, total);
                setIsCreatingOrder(false);
              }}
              onCancel={() => setIsCreatingOrder(false)}
            />
          )}

          {tableOrders.length === 0 && !isCreatingOrder ? (
            <p className="text-sm text-zinc-500 bg-white/5 p-4 rounded-xl border border-white/5">
              Bu masada aktif sipariş yok.
            </p>
          ) : (
            tableOrders.map((order) => (
              <div key={order.id}>
                {editingOrder === order.id ? (
                  <OrderEditor
                    initialItems={order.items}
                    products={products}
                    categories={categories}
                    onSave={(items, total) => {
                      updateOrderItems(order.id, items, total);
                      setEditingOrder(null);
                    }}
                    onCancel={() => setEditingOrder(null)}
                  />
                ) : changingTable === order.id ? (
                  <TableChanger
                    order={order}
                    totalTables={totalTables}
                    getTableState={getTableState}
                    onConfirm={(newTable) => {
                      changeOrderTable(order.id, newTable);
                      setChangingTable(null);
                    }}
                    onCancel={() => setChangingTable(null)}
                  />
                ) : (
                  <OrderCard
                    order={order}
                    onEdit={() => setEditingOrder(order.id)}
                    onChangeTable={() => setChangingTable(order.id)}
                    onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus, newStatus === "PREPARING" ? "garson1" : undefined)}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Order Card (read-only view) ────────────────────────────────────────────

function OrderCard({
  order,
  onEdit,
  onChangeTable,
  onStatusChange,
}: {
  order: FirestoreOrder;
  onEdit: () => void;
  onChangeTable: () => void;
  onStatusChange: (status: "PREPARING" | "COMPLETED") => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-md",
            order.status === "PENDING"
              ? "bg-amber-500/20 text-amber-400"
              : order.status === "PREPARING"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-green-500/20 text-green-400"
          )}
        >
          {order.status === "PENDING" ? "YENİ SİPARİŞ" : order.status === "PREPARING" ? "HAZIRLANIYOR" : "TAMAMLANDI"}
        </span>
        <div className="flex items-center text-xs text-zinc-400 font-medium gap-2">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(order.createdAt)} · {getOrderDuration(order.createdAt)}
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-zinc-300">
              <span className="text-brand-500 font-bold mr-1">{item.quantity}x</span>
              {item.name}
            </span>
            <span className="text-zinc-500">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-white/5 mb-3">
        <span className="text-xs text-zinc-500 font-medium">Toplam</span>
        <span className="font-bold text-brand-400">{formatPrice(order.totalAmount)}</span>
      </div>

      <div className="flex gap-2 mb-2">
        {order.status === "PENDING" && (
          <button
            onClick={() => onStatusChange("PREPARING")}
            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all btn-press shadow-lg shadow-amber-900/20"
          >
            Hazırlanıyor İşaretle
          </button>
        )}
        {order.status === "PREPARING" && (
          <button
            onClick={() => onStatusChange("COMPLETED")}
            className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all btn-press shadow-lg shadow-green-900/20"
          >
            Tamamlandı İşaretle
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 text-xs font-semibold transition-all"
        >
          <Utensils className="w-3.5 h-3.5" />
          Düzenle
        </button>
        <button
          onClick={onChangeTable}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 text-xs font-semibold transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Masa Değiştir
        </button>
      </div>
    </div>
  );
}

// ─── Table Changer ──────────────────────────────────────────────────────────

function TableChanger({
  order,
  totalTables,
  getTableState,
  onConfirm,
  onCancel,
}: {
  order: FirestoreOrder;
  totalTables: number;
  getTableState: (n: number) => { statusLabel: string; textColor: string };
  onConfirm: (newTable: number) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const tables = Array.from({ length: totalTables }, (_, i) => i + 1).filter(
    (t) => t !== order.tableNumber
  );

  return (
    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-purple-400">
          Masa {order.tableNumber} → ?
        </h4>
        <button onClick={onCancel} className="text-xs text-zinc-500 hover:text-zinc-300">İptal</button>
      </div>

      <p className="text-xs text-zinc-500 mb-3">Yeni masayı seçin:</p>

      <div className="grid grid-cols-5 gap-2 mb-4 max-h-48 overflow-y-auto">
        {tables.map((t) => {
          const state = getTableState(t);
          return (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 rounded-xl border text-sm font-bold transition-all",
                selected === t
                  ? "bg-purple-500 border-purple-500 text-white"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/8 hover:text-white"
              )}
            >
              {t}
              <span className={cn("text-[8px] font-medium mt-0.5", selected === t ? "text-purple-200" : state.textColor)}>
                {state.statusLabel}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selected && onConfirm(selected)}
        disabled={!selected}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
          selected
            ? "bg-purple-500 hover:bg-purple-600 text-white"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        )}
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
        Masa {selected || "?"} &apos;ye Taşı
      </button>
    </div>
  );
}
