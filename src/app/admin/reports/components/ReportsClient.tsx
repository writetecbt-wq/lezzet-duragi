"use client";

import { useOrderStore } from "@/store/order.store";
import { formatPrice } from "@/lib/mock-data";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

export function ReportsClient() {
  const { orders } = useOrderStore();

  const { totalRevenue, completedCount, popularItems, hourlyData } = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    
    // Total Revenue
    const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Popular Items
    const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemMap.get(item.productId) || { name: item.name, count: 0, revenue: 0 };
        existing.count += item.quantity;
        existing.revenue += item.quantity * item.unitPrice;
        itemMap.set(item.productId, existing);
      });
    });

    const popular = Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    // Hourly Data (mocking today's timeline based on orders)
    // To make it look good for the prototype even with few orders, we'll bucket them roughly.
    const hourMap = new Map<number, number>();
    completedOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + order.totalAmount);
    });

    const hourly = Array.from(hourMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, amount]) => ({
        time: `${hour}:00`,
        Ciro: amount,
      }));

    return {
      totalRevenue: revenue,
      completedCount: completedOrders.length,
      popularItems: popular,
      hourlyData: hourly.length > 0 ? hourly : [{ time: "Henüz Veri Yok", Ciro: 0 }],
    };
  }, [orders]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Kapsamlı Raporlama</h2>
        <p className="text-sm text-zinc-400 mt-1">Günlük satış, yoğunluk ve ürün performans analizleri.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Toplam Ciro" value={formatPrice(totalRevenue)} icon={DollarSign} color="text-brand-400" />
        <StatCard title="Tamamlanan Sipariş" value={completedCount} icon={ShoppingBag} color="text-blue-400" />
        <StatCard title="Ortalama Sepet Tutarı" value={completedCount ? formatPrice(totalRevenue / completedCount) : formatPrice(0)} icon={TrendingUp} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Revenue Chart */}
        <div className="bg-[#16161b] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Saatlik Ciro Dağılımı</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1c1c22', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="Ciro" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Items Pie Chart */}
        <div className="bg-[#16161b] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">En Çok Satan Ürünler (Adet)</h3>
          {popularItems.length > 0 ? (
            <div className="h-72 w-full flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={popularItems}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    stroke="none"
                  >
                    {popularItems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c22', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-50% flex flex-col gap-3 justify-center pl-4">
                {popularItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-zinc-300 truncate">{item.name}</span>
                    <span className="text-white font-bold ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center border border-dashed border-white/10 rounded-xl">
              <p className="text-sm text-zinc-500">Yeterli veri yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-[#16161b] border border-white/10 rounded-2xl p-5 shadow-lg flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
        <p className={cn("text-2xl font-bold tracking-tight", color)}>{value}</p>
      </div>
    </div>
  );
}
