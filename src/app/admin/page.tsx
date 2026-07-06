import type { Metadata } from "next";
import { AdminClient } from "./components/AdminClient";

export const metadata: Metadata = {
  title: "Kasa Paneli | Lezzet Durağı",
  description: "Restoran kasa ve sipariş yönetim paneli",
};

export default function AdminPage() {
  return <AdminClient />;
}
