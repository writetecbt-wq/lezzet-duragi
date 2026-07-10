import { KitchenClient } from "./components/KitchenClient";

export default function KitchenPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0c] text-white overflow-hidden">
      <header className="bg-[#16161b] border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-500 tracking-tight">Mutfak Ekranı</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">Aktif Sipariş Yönetimi</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
            <span className="text-amber-400">Yeni Sipariş</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            <span className="text-blue-400">Hazırlanıyor</span>
          </div>
        </div>
      </header>
      <main className="h-[calc(100dvh-88px)] overflow-hidden">
        <KitchenClient />
      </main>
    </div>
  );
}
