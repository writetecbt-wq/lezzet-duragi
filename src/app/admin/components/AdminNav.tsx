"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ExternalLink, Map, BarChart3, Wallet, LogOut, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Ana Pano",
    icon: BarChart3,
  },
  {
    href: "/admin",
    label: "Siparişler",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/tables",
    label: "Masa Haritası",
    icon: Map,
  },
  {
    href: "/admin/kasa",
    label: "Kasa & Muhasebe",
    icon: Wallet,
  },
  {
    href: "/admin/products",
    label: "Ürün Yönetimi",
    icon: Package,
  },
  {
    href: "/admin/integrations",
    label: "Entegrasyonlar",
    icon: Plug,
  },
];

export function AdminNav({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();

  return (
    <>
    <header className="border-b border-white/8 px-6 py-0 flex items-center justify-between bg-[#0f0f12]/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 py-3 pr-6 border-r border-white/8 mr-4">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-base shadow-lg shadow-orange-900/40">
          🍽️
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">Lezzet Durağı</p>
          <p className="text-[10px] text-zinc-500 font-medium">Kasa Paneli</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all",
                isActive
                  ? "border-brand-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="hidden md:inline">Canlı</span>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Müşteri Görünümü</span>
        </Link>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Çıkış</span>
          </button>
        )}
      </div>
    </header>

    {/* Global Notifications (Outside header to prevent backdrop-filter fixed positioning bug) */}
    <ServiceNotificationListener />
    </>
  );
}

import { useEffect, useState, useRef } from "react";
import { useOrderStore } from "@/store/order.store";
import { useProductStore } from "@/store/product.store";
import { Bell, CreditCard, HandPlatter, X } from "lucide-react";

function ServiceNotificationListener() {
  const { serviceRequests, resolveServiceRequest, listenToOrders, listenToServiceRequests } = useOrderStore();
  const { fetchProductsAndCategories } = useProductStore();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    tableNumber: number;
    type: "WAITER" | "BILL";
  } | null>(null);

  // Start real-time Firestore listeners and fetch initial product data on mount
  useEffect(() => {
    fetchProductsAndCategories();
    const unsubOrders = listenToOrders();
    const unsubRequests = listenToServiceRequests();
    
    return () => {
      unsubOrders();
      unsubRequests();
    };
  }, [listenToOrders, listenToServiceRequests, fetchProductsAndCategories]);

  useEffect(() => {
    // Initialize seenIds on first load
    if (!initializedRef.current && serviceRequests.length > 0) {
      serviceRequests.forEach(r => seenIdsRef.current.add(r.id));
      initializedRef.current = true;
      return;
    }

    // Find any PENDING request that we haven't seen yet
    const unseenPending = serviceRequests.find(r => r.status === "PENDING" && !seenIdsRef.current.has(r.id));
    
    if (unseenPending) {
      seenIdsRef.current.add(unseenPending.id);

      setActiveToast({
        id: unseenPending.id,
        tableNumber: unseenPending.tableNumber,
        type: unseenPending.type,
      });

      return;
    }
    
    // Also add all current IDs to seen to prevent notifying for resolved/old ones
    serviceRequests.forEach(r => seenIdsRef.current.add(r.id));
  }, [serviceRequests]);

  // Handle notification auto-hide separately so it doesn't get cancelled when requests update
  useEffect(() => {
    if (activeToast) {
      const id = setTimeout(() => setActiveToast(null), 8000);
      return () => clearTimeout(id);
    }
  }, [activeToast]);

  if (!activeToast) return null;

  const isBill = activeToast.type === "BILL";

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-in-right">
      <div className="flex items-center gap-4 bg-[#1c1c22] border border-brand-500/40 rounded-2xl px-5 py-4 shadow-2xl shadow-brand-500/20">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
            {isBill ? <CreditCard className="w-5 h-5" /> : <HandPlatter className="w-5 h-5" />}
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        </div>
        <div>
          <p className="text-xs text-zinc-400 font-medium">Yeni İstek</p>
          <p className="text-sm font-semibold text-white">
            Masa {activeToast.tableNumber} {isBill ? "hesap istiyor" : "garson çağırıyor"}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => {
              resolveServiceRequest(activeToast.id);
              setActiveToast(null);
            }}
            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Tamamlandı
          </button>
          <button
            onClick={() => setActiveToast(null)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
