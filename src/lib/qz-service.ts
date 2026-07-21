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

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; padding: 0; margin: 0; width: 100%; color: #000; font-size: 14px; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .title { font-size: 26px; margin-bottom: 5px; }
        .subtitle { font-size: 12px; margin: 0 0 15px 0; }
        .divider { border-top: 2px dashed #000; margin: 15px 0; }
        .item-qty { font-weight: bold; font-size: 20px; padding-bottom: 8px; width: 30px; }
        .item-name { font-size: 18px; padding-bottom: 8px; }
        .notes-title { margin: 0 0 5px 0; font-size: 16px; }
        .notes-content { font-size: 18px; font-weight: bold; margin: 0; }
      </style>
    </head>
    <body>
      <h2 class="text-center title">Masa ${order.tableNumber}</h2>
      <p class="text-center subtitle">${new Date().toLocaleTimeString('tr-TR')} - Siparis #${order.id.slice(-4)}</p>
      
      <div class="divider"></div>
      
      <table style="width: 100%; text-align: left;">
        ${order.items.map((item: any) => `
            <tr>
              <td class="item-qty" valign="top">${item.quantity}x</td>
              <td class="item-name">${item.name}</td>
            </tr>
        `).join("")}
      </table>
      
      ${order.notes ? `
        <div class="divider"></div>
        <h3 class="notes-title">Not:</h3>
        <p class="notes-content">${order.notes}</p>
      ` : ''}
      
      <div class="divider"></div>
      <p class="text-center" style="font-size: 12px; margin-top: 20px;">Lezzet Duragi</p>
    </body>
    </html>
  `;

  const config = qz.configs.create(printerName, {
    margins: 0,
    size: { width: 3, height: 10 },
    units: 'in',
  });

  const data = [
    {
      type: 'pixel',
      format: 'html',
      flavor: 'plain',
      data: htmlContent
    }
  ];

  return qz.print(config, data);
};
