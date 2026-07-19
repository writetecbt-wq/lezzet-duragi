"use client";

import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/order.store";
import { useTableStore, MIN_TABLES, MAX_TABLES } from "@/store/table.store";
import { cn } from "@/lib/utils";
import {
  HandPlatter,
  CreditCard,
  Clock,
  Utensils,
  AlertCircle,
  Plus,
  Minus,
  QrCode,
  X,
  Download,
} from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/mock-data";
import { QRCodeCanvas } from "qrcode.react";

const WAITERS = [
  { id: "ahmet",  name: "Ahmet",  color: "#f97316" },
  { id: "mehmet", name: "Mehmet", color: "#3b82f6" },
  { id: "ayse",   name: "Ayşe",   color: "#a855f7" },
  { id: "ali",    name: "Ali",    color: "#22c55e" },
  { id: "zeynep", name: "Zeynep", color: "#ec4899" },
];

export function TableMapClient() {
  const { orders, serviceRequests, resolveServiceRequest } = useOrderStore();
  const { totalTables, addTable, removeTable } = useTableStore();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [qrModalTable, setQrModalTable] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

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
    const waiterName = tableOrders[0]?.waiterName;
    const waiter = WAITERS.find((w) => w.name === waiterName || w.id === waiterName);

    let bgColor = "bg-green-500/10 border-green-500/30";
    let textColor = "text-green-500";
    let statusLabel = "Boş";
    let customStyle = {};

    if (hasRequest) {
      bgColor = "bg-red-500/15 border-red-500/50 animate-[pulse_2s_infinite]";
      textColor = "text-red-400";
      statusLabel = "İstek Var";
    } else if (isOccupied) {
      if (waiter) {
        bgColor = "";
        textColor = "";
        statusLabel = waiter.name;
        customStyle = {
          background: `${waiter.color}15`,
          border: `1px solid ${waiter.color}80`,
          color: waiter.color,
        };
      } else {
        bgColor = "bg-red-500/20 border-red-500/50";
        textColor = "text-red-500";
        statusLabel = "Müşteri Siparişi";
      }
    }

    return {
      tableOrders,
      activeRequests,
      isOccupied,
      hasRequest,
      waiter,
      bgColor,
      textColor,
      statusLabel,
      customStyle,
    };
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Masa Haritası
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Restoranın anlık doluluk ve servis durumu.
          </p>
        </div>

        {/* ── Table Count Control ── */}
        <div className="flex-shrink-0 bg-[#16161b] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 min-w-[220px] shadow-xl">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Toplam Masa
          </p>

          <div className="flex items-center gap-3">
            {/* Decrease */}
            <button
              onClick={() => {
                if (window.confirm("En son masayı silmek istediğinize emin misiniz? Yanlışlıkla silinmesin.")) {
                  removeTable();
                }
              }}
              disabled={totalTables <= MIN_TABLES}
              className={cn(
                "w-11 h-11 rounded-xl border font-bold text-xl flex items-center justify-center transition-all active:scale-95",
                totalTables <= MIN_TABLES
                  ? "border-white/5 text-zinc-700 cursor-not-allowed"
                  : "border-white/15 text-white hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
              )}
            >
              <Minus className="w-5 h-5" />
            </button>

            {/* Count Display */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-4xl font-black text-white leading-none tabular-nums">
                {totalTables}
              </span>
            </div>

            {/* Increase */}
            <button
              onClick={() => {
                if (window.confirm("Yeni bir masa eklemek istediğinize emin misiniz?")) {
                  addTable();
                }
              }}
              disabled={totalTables >= MAX_TABLES}
              className={cn(
                "w-11 h-11 rounded-xl border font-bold text-xl flex items-center justify-center transition-all active:scale-95",
                totalTables >= MAX_TABLES
                  ? "border-white/5 text-zinc-700 cursor-not-allowed"
                  : "border-white/15 text-white hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick set buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (window.confirm(`Masa sayısını topluca ${n} olarak ayarlamak istediğinize emin misiniz?`)) {
                    useTableStore.getState().setTotalTables(n);
                  }
                }}
                className={cn(
                  "flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all",
                  totalTables === n
                    ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                    : "border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table Sections ── */}
      <div className="flex flex-col gap-8">
        {[
          { name: "İç Salon", icon: "🏛️", start: 1, end: 5, bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-400" },
          { name: "Teras", icon: "🌇", start: 6, end: 10, bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-400" },
          { name: "Bahçe", icon: "🌳", start: 11, end: 999, bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400" },
        ].map(section => {
          const sectionTables = tables.filter(t => t >= section.start && t <= section.end);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section.name} className={cn("rounded-3xl border p-6", section.bg, section.border)}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{section.icon}</span>
                <h3 className={cn("text-xl font-black", section.text)}>{section.name}</h3>
                <div className="flex-1 border-b border-white/5 mx-4"></div>
                <span className="text-sm font-bold text-zinc-500">{sectionTables.length} Masa</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sectionTables.map((tableNum) => {
          const {
            tableOrders,
            activeRequests,
            hasRequest,
            waiter,
            bgColor,
            textColor,
            statusLabel,
            customStyle,
          } = getTableState(tableNum);

          return (
            <div
              key={tableNum}
              className={cn(
                "relative group flex flex-col items-center justify-center aspect-square rounded-3xl border transition-all",
                bgColor
              )}
              style={customStyle}
            >
              {/* Badges for active requests */}
              {hasRequest && (
                <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                  {activeRequests.map((req) => (
                    <div
                      key={req.id}
                      className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-bounce"
                    >
                      {req.type === "WAITER" ? (
                        <HandPlatter className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Table Number — click to open details */}
              <button
                onClick={() => setSelectedTable(tableNum)}
                className="flex flex-col items-center justify-center flex-1 w-full"
              >
                <div className="text-4xl font-black text-white/90 mb-2">
                  {tableNum}
                </div>
                <div
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40",
                    textColor
                  )}
                  style={waiter ? { color: waiter.color } : {}}
                >
                  {waiter ? waiter.name : statusLabel}
                </div>

                {tableOrders.length > 0 && (
                  <div className="mt-3 text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5" />
                    {tableOrders.length} aktif sipariş
                  </div>
                )}
              </button>

              {/* QR Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQrModalTable(tableNum);
                }}
                title="QR Kodu Görüntüle"
                className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/40 border border-white/10 text-zinc-500 hover:text-brand-400 hover:border-brand-500/40 hover:bg-brand-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Panel for Selected Table Details */}
      {selectedTable && (
        <TableDetailsPanel
          tableNumber={selectedTable}
          onClose={() => setSelectedTable(null)}
          state={getTableState(selectedTable)}
          onResolveRequest={resolveServiceRequest}
          onShowQr={() => setQrModalTable(selectedTable)}
        />
      )}

      {/* QR Modal */}
      {qrModalTable && (
        <QrModal
          tableNumber={qrModalTable}
          baseUrl={baseUrl}
          onClose={() => setQrModalTable(null)}
        />
      )}
    </div>
  );
}

// ─── Table Details Panel ─────────────────────────────────────────────────────
type TableState = {
  tableOrders: import("@/lib/mock-data").MockOrder[];
  activeRequests: import("@/store/order.store").ServiceRequest[];
  isOccupied: boolean;
  hasRequest: boolean;
  bgColor: string;
  textColor: string;
  statusLabel: string;
};

function TableDetailsPanel({
  tableNumber,
  onClose,
  state,
  onResolveRequest,
  onShowQr,
}: {
  tableNumber: number;
  onClose: () => void;
  state: TableState;
  onResolveRequest: (id: string) => void;
  onShowQr: () => void;
}) {
  const { tableOrders, activeRequests, isOccupied } = state;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#16161b] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div>
          <h3 className="text-xl font-bold text-white">Masa {tableNumber}</h3>
          <p className={cn("text-sm font-semibold", state.textColor)}>
            {state.statusLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowQr}
            title="QR Kodu Göster"
            className="p-2 hover:bg-white/10 rounded-full text-brand-400 hover:text-brand-300 transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Active Requests Section */}
        {activeRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Servis İstekleri
            </h4>
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    {req.type === "WAITER" ? (
                      <HandPlatter className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {req.type === "WAITER" ? "Garson Çağrısı" : "Hesap İstendi"}
                    </p>
                    <p className="text-xs text-red-400/80">{timeAgo(req.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onResolveRequest(req.id)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Tamamla
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active Orders Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Aktif Siparişler
          </h4>
          {!isOccupied ? (
            <p className="text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/5">
              Bu masada aktif sipariş bulunmuyor.
            </p>
          ) : (
            tableOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-md",
                      order.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-400"
                        : order.status === "PREPARING"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {order.status === "PENDING" ? "YENİ SİPARİŞ" : order.status === "PREPARING" ? "HAZIRLANIYOR" : "TAMAMLANDI"}
                  </span>
                  <div className="flex items-center text-xs text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {timeAgo(order.createdAt)}
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-zinc-300">
                        <span className="text-brand-500 font-bold mr-1">
                          {item.quantity}x
                        </span>
                        {item.name}
                      </span>
                      <span className="text-zinc-500">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs text-zinc-500 font-medium">Toplam</span>
                  <span className="font-bold text-brand-400">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QrModal({
  tableNumber,
  baseUrl,
  onClose,
}: {
  tableNumber: number;
  baseUrl: string;
  onClose: () => void;
}) {
  const menuUrl = `${baseUrl}/restoran-1/menu/${tableNumber}`;

  const handleDownload = () => {
    const canvas = document.getElementById(
      `qr-modal-canvas-${tableNumber}`
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `Masa-${tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          className="bg-[#16161b] border border-white/12 rounded-3xl shadow-2xl w-full max-w-xs flex flex-col animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div>
              <h3 className="text-base font-bold text-white">
                Masa {tableNumber} — QR Kod
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Masaya yapıştırın veya indirin
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/8 text-zinc-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              {baseUrl ? (
                <QRCodeCanvas
                  id={`qr-modal-canvas-${tableNumber}`}
                  value={menuUrl}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  marginSize={1}
                  imageSettings={{
                    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSI1MCUiIHgtPSI1MCUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjcwIj7wn42tPC90ZXh0Pjwvc3ZnPg==",
                    x: undefined,
                    y: undefined,
                    height: 45,
                    width: 45,
                    excavate: true,
                  }}
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-zinc-200 animate-pulse rounded-lg" />
              )}
            </div>

            {/* Restaurant name badge */}
            <div className="text-center">
              <p className="text-lg font-black text-white tracking-tight">
                🍽️ Lezzet Durağı
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Masa {tableNumber} — Menüyü görmek için okutun
              </p>
            </div>

            {/* URL */}
            <div className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2">
              <p className="text-[10px] text-zinc-500 font-mono break-all leading-relaxed">
                {menuUrl}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-900/30"
            >
              <Download className="w-4 h-4" />
              PNG Olarak İndir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
