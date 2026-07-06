import type { Metadata } from "next";
import { ProductManagement } from "./components/ProductManagement";

export const metadata: Metadata = {
  title: "Ürün Yönetimi | Lezzet Durağı",
};

export default function ProductsPage() {
  return <ProductManagement />;
}
