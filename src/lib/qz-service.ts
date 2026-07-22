import { FirestoreOrder } from "@/store/order.store";

// We keep a reference to QZ to load it dynamically since it requires window (client-side only)
let qzInstance: any = null;

const getQZ = async () => {
  if (typeof window === "undefined") throw new Error("QZ Tray can only run in the browser.");
  if (!qzInstance) {
    const qz = await import("qz-tray");
    qzInstance = qz.default || qz;
  }
  return qzInstance;
};

export const connectQZ = async () => {
  const qz = await getQZ();
  if (qz.websocket.isActive()) {
    return true;
  }
  try {
    await qz.websocket.connect();
    return true;
  } catch (err) {
    console.error("QZ Tray connection failed:", err);
    return false;
  }
};

export const getPrinters = async (): Promise<string[]> => {
  const qz = await getQZ();
  if (!qz.websocket.isActive()) {
    await connectQZ();
  }
  try {
    return await qz.printers.find();
  } catch (err) {
    console.error("Failed to get printers:", err);
    return [];
  }
};

export const printKitchenReceipt = async (printerName: string, order: FirestoreOrder) => {
  const qz = await getQZ();
  if (!qz.websocket.isActive()) {
    const connected = await connectQZ();
    if (!connected) throw new Error("QZ Tray is not connected.");
  }

  const config = qz.configs.create(printerName, {
    margins: 0
  });

  const divider = "--------------------------------\n";
  const thickDivider = "================================\n";
  
  // Format Date and Time
  const orderDate = new Date(order.createdAt || Date.now());
  const dateStr = orderDate.toLocaleDateString('tr-TR');
  const timeStr = orderDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // Determine Source (Garson vs Müşteri)
  let sourceText = "MUSTERI (QR Menu)";
  if (order.waiterName) {
    sourceText = `GARSON (${order.waiterName})`;
  } else if (order.source && order.source !== "QR") {
    sourceText = `PAKET (${order.source})`;
  }

  // Determine Table/Takeaway
  const tableText = order.tableNumber === 0 ? "PAKET SERVIS" : `MASA ${order.tableNumber}`;

  let text = `\n`;
  text += thickDivider;
  text += `         LEZZET DURAGI\n`;
  text += thickDivider;
  text += `       *** YENI SIPARIS ***\n\n`;
  
  text += `Tarih : ${dateStr} - ${timeStr}\n`;
  text += `Yer   : ${tableText}\n`;
  text += `Kaynak: ${sourceText}\n`;
  text += divider;
  
  text += `ADET    URUN ADI\n`;
  text += divider;
  
  let totalItems = 0;
  order.items.forEach((item: any) => {
    totalItems += item.quantity;
    // Pad quantity for better alignment
    const qtyStr = `${item.quantity}x`.padEnd(8, ' ');
    text += `${qtyStr}${item.name}\n`;
  });
  
  if (order.notes) {
    text += divider;
    text += `NOT:\n${order.notes}\n`;
  }
  
  text += divider;
  text += `Toplam Urun: ${totalItems} adet\n`;
  text += `Siparis No : #${order.id.slice(-4)}\n`;
  text += thickDivider;
  text += `\n\n\n\n`;

  const data = [
    {
      type: 'pixel',
      format: 'plain',
      data: text
    }
  ];

  return qz.print(config, data);
};
