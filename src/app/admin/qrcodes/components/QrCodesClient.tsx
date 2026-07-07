"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, QrCode, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableStore, MIN_TABLES, MAX_TABLES } from "@/store/table.store";

export function QrCodesClient() {
  const [baseUrl, setBaseUrl] = useState("");
  const { totalTables, addTable, removeTable } = useTableStore();

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const tables = Array.from({ length: totalTables }, (_, i) => i + 1);

  const handlePrint = () => window.print();

  const handleDownload = (tableNum: number) => {
    const canvas = document.getElementById(
      `qr-canvas-${tableNum}`
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `Masa-${tableNum}-Karekod.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-full print:p-0 print:bg-white print:text-black">
      {/* Header — hidden in print */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-brand-500" /> Masa Karekodları
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Masalara yapıştırmak için QR kodları indirebilir veya yazdırabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table Count Controls (mirrored from TableMapClient) */}
          <div className="flex items-center gap-2 bg-[#16161b] border border-white/10 rounded-xl px-3 py-2 shadow-md">
            <span className="text-xs text-zinc-500 font-semibold mr-1">
              Masa Sayısı
            </span>
            <button
              onClick={removeTable}
              disabled={totalTables <= MIN_TABLES}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                totalTables <= MIN_TABLES
                  ? "border-white/5 text-zinc-700 cursor-not-allowed"
                  : "border-white/15 text-zinc-300 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
              )}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-white font-black text-base w-8 text-center tabular-nums">
              {totalTables}
            </span>
            <button
              onClick={addTable}
              disabled={totalTables >= MAX_TABLES}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                totalTables >= MAX_TABLES
                  ? "border-white/5 text-zinc-700 cursor-not-allowed"
                  : "border-white/15 text-zinc-300 hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm transition-colors border border-white/10 shadow"
          >
            <Printer className="w-4 h-4" />
            Tümünü Yazdır
          </button>
        </div>
      </div>

      {/* Grid of QR Codes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 print:grid-cols-3 print:gap-10">
        {tables.map((tableNum) => {
          const menuUrl = `${baseUrl}/restoran-1/menu/${tableNum}`;

          return (
            <div
              key={tableNum}
              className="bg-[#16161b] border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg print:border-black/20 print:bg-white print:shadow-none print:break-inside-avoid"
            >
              <h3 className="text-xl font-black text-white mb-4 tracking-tight print:text-black">
                MASA {tableNum}
              </h3>

              <div className="bg-white p-3 rounded-xl shadow-inner print:p-0 print:shadow-none">
                {baseUrl ? (
                  <QRCodeCanvas
                    id={`qr-canvas-${tableNum}`}
                    value={menuUrl}
                    size={160}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    marginSize={1}
                    imageSettings={{
                      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSI1MCUiIHgtPSI1MCUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjcwIj7wn42tPC90ZXh0Pjwvc3ZnPg==",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="w-[160px] h-[160px] bg-zinc-800 animate-pulse rounded-lg" />
                )}
              </div>

              <p className="text-[10px] text-zinc-500 mt-4 text-center break-all font-mono print:text-black/60 print:mt-2">
                {menuUrl}
              </p>

              <button
                onClick={() => handleDownload(tableNum)}
                className="mt-5 flex items-center justify-center gap-2 w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-lg transition-colors print:hidden"
              >
                <Download className="w-4 h-4" />
                PNG Olarak İndir
              </button>
            </div>
          );
        })}
      </div>

      {/* Print-specific global styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:text-black { color: black !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:p-0, .print\\:p-0 * { visibility: visible; }
          .print\\:p-0 { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `,
        }}
      />
    </div>
  );
}
