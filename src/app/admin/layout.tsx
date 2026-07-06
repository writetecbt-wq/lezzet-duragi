import type { Metadata } from "next";
import { AdminNav } from "./components/AdminNav";

export const metadata: Metadata = {
  title: "Kasa Paneli | Lezzet Durağı",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0f0f12] text-white flex flex-col">
      <AdminNav />
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
