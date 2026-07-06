import type { Metadata } from "next";
import { MOCK_RESTAURANT } from "@/lib/mock-data";
import { MenuClient } from "./components/MenuClient";
import { CartDrawer } from "./components/CartDrawer";

// params is a Promise in Next.js v15+
type Props = {
  params: Promise<{ restaurantId: string; tableId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tableId } = await params;
  return {
    title: `Menü — Masa ${tableId} | ${MOCK_RESTAURANT.name}`,
    description: "Menüyü keşfedin ve sipariş verin",
  };
}

export default async function MenuPage({ params }: Props) {
  const { restaurantId, tableId } = await params;

  return (
    <>
      <MenuClient tableNumber={tableId} />
      <CartDrawer tableId={tableId} restaurantId={restaurantId} />
    </>
  );
}
