"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Delete } from "lucide-react";

// ─── Garsonlar (PIN ile) ─────────────────────────────────────────────────────
const WAITERS = [
  { id: "ahmet",  name: "Ahmet",  pin: "1234", initials: "AH", color: "#f97316", image: "/avatars/waiter_ahmet_1784281554408.jpg" },
  { id: "mehmet", name: "Mehmet", pin: "2345", initials: "ME", color: "#3b82f6", image: "/avatars/waiter_mehmet_1784281562453.jpg" },
  { id: "ayse",   name: "Ayşe",   pin: "3456", initials: "AY", color: "#a855f7", image: "/avatars/waiter_ayse_1784281571557.jpg" },
  { id: "ali",    name: "Ali",    pin: "4567", initials: "AL", color: "#22c55e", image: "/avatars/waiter_ali_1784281579636.jpg" },
  { id: "zeynep", name: "Zeynep", pin: "5678", initials: "ZE", color: "#ec4899", image: "/avatars/waiter_zeynep_1784281589065.jpg" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();

  const [isMounted, setIsMounted]           = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<typeof WAITERS[0] | null>(null);
  const [pin, setPin]                       = useState("");
  const [error, setError]                   = useState("");
  const [shake, setShake]                   = useState(false);

  // Admin login state (hidden)
  const [adminMode, setAdminMode]   = useState(false);
  const [adminUser, setAdminUser]   = useState("");
  const [adminPass, setAdminPass]   = useState("");
  const [adminErr, setAdminErr]     = useState("");

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === "admin" ? "/admin" : "/garson");
    }
  }, [isAuthenticated, user, router]);

  if (!isMounted) return null;

  const handlePinPress = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");

    if (newPin.length === 4 && selectedWaiter) {
      if (newPin === selectedWaiter.pin) {
        // PIN doğru — garson girişi
        const result = login("admin", "garson123");
        if (result.success) {
          // Garson ID'sini localStorage'a kaydet (GarsonClient'ta kullanmak için)
          localStorage.setItem("activeWaiterId", selectedWaiter.id);
          router.push("/garson");
        }
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setPin(""); setError("Hatalı PIN"); }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError("");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(adminUser, adminPass);
    if (result.success) {
      router.push(result.role === "admin" ? "/admin" : "/garson");
    } else {
      setAdminErr("Kullanıcı adı veya şifre hatalı");
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-8"
      style={{
        background: "rgba(19,19,25,0.97)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <h1
        className="font-bold flex items-center gap-3 mb-12"
        style={{ fontSize: 40, color: "#ffb690" }}
      >
        <span style={{ fontSize: 48 }}>🍽️</span>
        Lezzet Durağı
      </h1>

      <div className="flex gap-16 w-full max-w-5xl justify-center items-stretch">

        {/* ─── Garson Seçimi ─── */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#e4e1ea" }}>
            Garson Seçimi
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {WAITERS.map(w => {
              const isSelected = selectedWaiter?.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => { setSelectedWaiter(w); setPin(""); setError(""); }}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl p-4 transition-all active:scale-95 h-32"
                  style={{
                    background: isSelected ? `${w.color}22` : "#34343b",
                    border: isSelected ? `2px solid ${w.color}` : "1px solid #584237",
                    boxShadow: isSelected ? `0 4px 20px ${w.color}33` : "none",
                    opacity: isSelected ? 1 : 0.75,
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                >
                  {/* Avatar */}
                  {w.image ? (
                    <img src={w.image} alt={w.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
                      style={{ background: w.color, color: "#fff" }}
                    >
                      {w.initials}
                    </div>
                  )}
                  <span className="font-semibold text-sm" style={{ color: "#e4e1ea" }}>{w.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div style={{ width: 1, background: "#584237", alignSelf: "stretch" }} />

        {/* ─── PIN Pad ─── */}
        <div className="flex flex-col items-center" style={{ width: 280, paddingLeft: 0 }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#e4e1ea" }}>
            {selectedWaiter ? `${selectedWaiter.name} — PIN` : "PIN Girin"}
          </h2>

          {/* PIN dots */}
          <div
            className={`flex gap-4 mb-8 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
            style={{ animation: shake ? "shake 0.4s ease-in-out" : "none" }}
          >
            {[0,1,2,3].map(i => (
              <div
                key={i}
                className="w-4 h-4 rounded-full transition-all"
                style={{
                  background: pin.length > i
                    ? (selectedWaiter?.color ?? "#f97316")
                    : "#34343b",
                  transform: pin.length > i ? "scale(1.1)" : "scale(1)",
                  boxShadow: pin.length > i ? `0 0 8px ${selectedWaiter?.color ?? "#f97316"}88` : "none",
                }}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs mb-4 font-semibold" style={{ color: "#ffb4ab" }}>{error}</p>
          )}

          {/* Number Grid */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                onClick={() => handlePinPress(String(n))}
                disabled={!selectedWaiter}
                className="h-16 rounded-full text-xl font-bold transition-all active:scale-95"
                style={{
                  background: "#34343b",
                  color: "#e4e1ea",
                  border: "none",
                  cursor: selectedWaiter ? "pointer" : "not-allowed",
                  opacity: selectedWaiter ? 1 : 0.4,
                }}
                onMouseEnter={e => { if (selectedWaiter) { (e.currentTarget as HTMLButtonElement).style.background = "#f97316"; (e.currentTarget as HTMLButtonElement).style.color = "#552100"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#34343b"; (e.currentTarget as HTMLButtonElement).style.color = "#e4e1ea"; }}
              >
                {n}
              </button>
            ))}
            {/* Empty, 0, Delete */}
            <div />
            <button
              onClick={() => handlePinPress("0")}
              disabled={!selectedWaiter}
              className="h-16 rounded-full text-xl font-bold transition-all active:scale-95"
              style={{ background: "#34343b", color: "#e4e1ea", border: "none", cursor: selectedWaiter ? "pointer" : "not-allowed", opacity: selectedWaiter ? 1 : 0.4 }}
              onMouseEnter={e => { if (selectedWaiter) { (e.currentTarget as HTMLButtonElement).style.background = "#f97316"; (e.currentTarget as HTMLButtonElement).style.color = "#552100"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#34343b"; (e.currentTarget as HTMLButtonElement).style.color = "#e4e1ea"; }}
            >
              0
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedWaiter || pin.length === 0}
              className="h-16 rounded-full text-xl font-bold transition-all active:scale-95 flex items-center justify-center"
              style={{
                background: "rgba(255,180,171,0.15)",
                color: "#ffb4ab",
                border: "none",
                cursor: (selectedWaiter && pin.length > 0) ? "pointer" : "not-allowed",
                opacity: (selectedWaiter && pin.length > 0) ? 1 : 0.4,
              }}
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* GİRİŞ YAP butonu */}
          <button
            onClick={() => { if (pin.length === 4 && selectedWaiter) handlePinPress(""); }}
            disabled={!selectedWaiter || pin.length < 4}
            className="w-full mt-8 font-bold text-lg rounded-lg transition-all active:scale-95"
            style={{
              height: 56,
              background: selectedWaiter && pin.length === 4 ? "#ffb690" : "#34343b",
              color: selectedWaiter && pin.length === 4 ? "#552100" : "#584237",
              border: "none",
              boxShadow: selectedWaiter && pin.length === 4 ? "0 4px 16px rgba(255,182,144,0.3)" : "none",
              cursor: selectedWaiter && pin.length === 4 ? "pointer" : "not-allowed",
            }}
          >
            GİRİŞ YAP
          </button>
        </div>
      </div>

      {/* ─── Admin Giriş (gizli) ─── */}
      <div className="mt-12">
        {!adminMode ? (
          <button
            onClick={() => setAdminMode(true)}
            className="text-xs transition-colors"
            style={{ color: "#584237" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#a78b7d"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#584237"; }}
          >
            Yönetici Girişi
          </button>
        ) : (
          <form onSubmit={handleAdminLogin} className="flex flex-col items-center gap-3">
            <p className="text-xs mb-1" style={{ color: "#a78b7d" }}>Yönetici Paneli</p>
            <div className="flex gap-2">
              <input
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                placeholder="Kullanıcı adı"
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: "#1f1f25", border: "1px solid #584237", color: "#e4e1ea", outline: "none", width: 140 }}
              />
              <input
                type="password"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                placeholder="Şifre"
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: "#1f1f25", border: "1px solid #584237", color: "#e4e1ea", outline: "none", width: 120 }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#34343b", color: "#e4e1ea", border: "1px solid #584237" }}
              >
                Giriş
              </button>
            </div>
            {adminErr && <p className="text-xs" style={{ color: "#ffb4ab" }}>{adminErr}</p>}
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
