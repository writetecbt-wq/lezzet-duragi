"use client";

import { AlertTriangle, X } from "lucide-react";

type Props = {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmModal({ productName, onConfirm, onCancel }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#16161b] border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Ürünü Sil</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <span className="font-semibold text-white">&quot;{productName}&quot;</span> ürününü
              silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              id="cancel-delete-btn"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Vazgeç
            </button>
            <button
              id="confirm-delete-btn"
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all btn-press shadow-lg shadow-red-900/30"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
