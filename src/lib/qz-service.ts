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
  let text = `\n\n`;
  text += `           MASA ${order.tableNumber}\n`;
  text += `   ${new Date().toLocaleTimeString('tr-TR')} - Siparis #${order.id.slice(-4)}\n`;
  text += divider;
  
  order.items.forEach((item: any) => {
    text += `${item.quantity}x  ${item.name}\n`;
  });
  
  if (order.notes) {
    text += divider;
    text += `NOT:\n${order.notes}\n`;
  }
  
  text += divider;
  text += `        Lezzet Duragi\n\n\n\n`;

  const data = [
    {
      type: 'pixel',
      format: 'plain',
      data: text
    }
  ];

  return qz.print(config, data);
};
