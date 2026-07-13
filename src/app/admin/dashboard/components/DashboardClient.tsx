"use client";

import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/order.store";
import { useProductStore } from "@/store/product.store";
import { formatPrice } from "@/lib/mock-data";
import { TrendingUp, ShoppingCart, Clock, Utensils } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

export function DashboardClient() {
  const { orders } = useOrderStore();
  const { products, categories, fetchProductsAndCategories } = useProductStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fetchProductsAndCategories().then(() => setIsMounted(true));
  }, [fetchProductsAndCategories]);

  if (!isMounted) return null;

  // Basic Stats
  const completedOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "PAID");
  const todayRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrdersCount = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;

  // Popular Products Calculation
  const productCountMap = new Map<string, { name: string; count: number; revenue: number }>();
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = productCountMap.get(item.productId) || { name: item.name, count: 0, revenue: 0 };
      existing.count += item.quantity;
      existing.revenue += (item.quantity * item.unitPrice);
      productCountMap.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hourly Revenue Data Calculation (Mock based on created times of completed orders)
  const hourlyDataMap = new Map<number, number>();
  // Initialize standard hours 10:00 to 22:00
  for (let i = 10; i <= 22; i++) hourlyDataMap.set(i, 0);

  completedOrders.forEach(order => {
    let hour = order.createdAt.getHours();
    // Round to standard hours for display purposes if out of bounds
    if (hour < 10) hour = 10;
    if (hour > 22) hour = 22;
    hourlyDataMap.set(hour, (hourlyDataMap.get(hour) || 0) + order.totalAmount);
  });

  const hourlyData = Array.from(hourlyDataMap.entries())
    .map(([hour, total]) => ({
      time: `${hour}:00`,
      ciro: total
    }));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f0f12] p-6 text-white space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold mb-1">Ana Pano (Dashboard)</h1>
        <p className="text-sm text-zinc-400">İşletmenizin anlık genel durumu ve analizleri.</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Bugünkü Ciro" value={formatPrice(todayRevenue)} trend="+12%" color="text-brand-400" bg="bg-brand-500/10" border="border-brand-500/20" />
        <StatCard icon={ShoppingCart} label="Tamamlanan Sipariş" value={completedOrders.length} color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
        <StatCard icon={Clock} label="Aktif Siparişler" value={activeOrdersCount} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard icon={Utensils} label="Hizmet Verilen Masa" value={new Set(orders.map(o => o.tableNumber)).size} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Hourly Chart ── */}
        <div className="lg:col-span-2 bg-[#16161b] border border-white/5 rounded-2xl p-5 shadow-lg">
          <h3 className="font-semibold mb-4 text-zinc-200">Saatlik Ciro Dağılımı</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
                <RechartsTooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar dataKey="ciro" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Top Selling Products ── */}
        <div className="bg-[#16161b] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
          <h3 className="font-semibold mb-4 text-zinc-200 flex items-center justify-between">
            <span>En Çok Satanlar</span>
            <span className="text-xs text-brand-400 font-medium px-2 py-1 bg-brand-500/10 rounded-lg">Bugün</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                Henüz yeterli veri yok
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                    <p className="text-xs text-zinc-400">{product.count} adet satıldı</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg, border }: any) {
  return (
    <div className={cn("rounded-2xl border p-5 transition-all bg-[#16161b]", border)}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl", bg, color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}
