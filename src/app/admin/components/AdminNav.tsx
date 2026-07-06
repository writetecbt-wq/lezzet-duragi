"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ExternalLink, Map, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
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
    href: "/admin/reports",
    label: "Raporlar",
    icon: BarChart3,
  },
  {
    href: "/admin/products",
    label: "Ürün Yönetimi",
    icon: Package,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
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
      </div>

      {/* Global Notifications */}
      <ServiceNotificationListener />
    </header>
  );
}

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/order.store";
import { Bell, CreditCard, HandPlatter, X } from "lucide-react";

function ServiceNotificationListener() {
  const { serviceRequests, resolveServiceRequest } = useOrderStore();
  const [prevCount, setPrevCount] = useState(serviceRequests.length);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    tableNumber: number;
    type: "WAITER" | "BILL";
  } | null>(null);

  useEffect(() => {
    if (serviceRequests.length > prevCount) {
      // Find the new pending request
      const latest = serviceRequests[0];
      if (latest && latest.status === "PENDING") {
        setActiveToast({
          id: latest.id,
          tableNumber: latest.tableNumber,
          type: latest.type,
        });

        // Auto-dismiss toast after 8 seconds (does NOT resolve the request, just hides toast)
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 8000);

        setPrevCount(serviceRequests.length);
        return () => clearTimeout(timer);
      }
    } else {
      setPrevCount(serviceRequests.length);
    }
  }, [serviceRequests, prevCount]);

  if (!activeToast) return null;

  const isBill = activeToast.type === "BILL";

  return (
    <div className="fixed top-20 right-5 z-50 animate-slide-in-right">
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
