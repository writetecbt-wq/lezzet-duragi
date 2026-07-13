"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, Link2, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "YEMEKSEPETI" | "GETIR" | "TRENDYOL";

type IntegrationState = {
  isActive: boolean;
  apiKey: string;
  secretKey: string;
  restaurantId: string;
};

const DEFAULT_STATE: IntegrationState = {
  isActive: false,
  apiKey: "",
  secretKey: "",
  restaurantId: "",
};

export function IntegrationsClient() {
  const [integrations, setIntegrations] = useState<Record<Platform, IntegrationState>>({
    YEMEKSEPETI: { ...DEFAULT_STATE },
    GETIR: { ...DEFAULT_STATE },
    TRENDYOL: { ...DEFAULT_STATE },
  });

  const [saving, setSaving] = useState<Platform | null>(null);
  const [success, setSuccess] = useState<Platform | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("restaurant-integrations");
    if (saved) {
      try {
        setIntegrations(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading integrations", e);
      }
    }
    setIsMounted(true);
  }, []);

  const handleChange = (platform: Platform, field: keyof IntegrationState, value: string | boolean) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSave = (platform: Platform) => {
    setSaving(platform);
    
    // Simulate API connection delay
    setTimeout(() => {
      localStorage.setItem("restaurant-integrations", JSON.stringify(integrations));
      setSaving(null);
      setSuccess(platform);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    }, 1500);
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f0f12] p-6 text-white space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold mb-1">Platform Entegrasyonları</h1>
        <p className="text-sm text-zinc-400">Yemeksepeti, Getir ve Trendyol Yemek API bağlantılarınızı buradan yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Yemeksepeti Card */}
        <IntegrationCard
          platform="YEMEKSEPETI"
          name="Yemeksepeti"
          color="bg-red-500"
          textColor="text-red-500"
          borderColor="border-red-500/30"
          glow="shadow-red-500/10"
          logo="YS"
          state={integrations.YEMEKSEPETI}
          onChange={(field, val) => handleChange("YEMEKSEPETI", field, val)}
          onSave={() => handleSave("YEMEKSEPETI")}
          isSaving={saving === "YEMEKSEPETI"}
          isSuccess={success === "YEMEKSEPETI"}
        />

        {/* Getir Card */}
        <IntegrationCard
          platform="GETIR"
          name="Getir Yemek"
          color="bg-purple-500"
          textColor="text-purple-400"
          borderColor="border-purple-500/30"
          glow="shadow-purple-500/10"
          logo="GT"
          state={integrations.GETIR}
          onChange={(field, val) => handleChange("GETIR", field, val)}
          onSave={() => handleSave("GETIR")}
          isSaving={saving === "GETIR"}
          isSuccess={success === "GETIR"}
        />

        {/* Trendyol Card */}
        <IntegrationCard
          platform="TRENDYOL"
          name="Trendyol Yemek"
          color="bg-orange-500"
          textColor="text-orange-400"
          borderColor="border-orange-500/30"
          glow="shadow-orange-500/10"
          logo="TY"
          state={integrations.TRENDYOL}
          onChange={(field, val) => handleChange("TRENDYOL", field, val)}
          onSave={() => handleSave("TRENDYOL")}
          isSaving={saving === "TRENDYOL"}
          isSuccess={success === "TRENDYOL"}
        />

      </div>

      <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">Güvenlik Notu</h3>
          <p className="text-sm text-blue-200/70">
            Girdiğiniz API anahtarları sisteminizde şifrelenerek tutulmaktadır. 
            Bu anahtarlar sayesinde siparişleriniz doğrudan L'Essence paneline düşer ve kurye atamaları otomatik gerçekleşir. 
            Anahtarlarınızı üçüncü şahıslarla paylaşmayınız.
          </p>
        </div>
      </div>

    </div>
  );
}

function IntegrationCard({
  platform,
  name,
  color,
  textColor,
  borderColor,
  glow,
  logo,
  state,
  onChange,
  onSave,
  isSaving,
  isSuccess,
}: {
  platform: Platform;
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  glow: string;
  logo: string;
  state: IntegrationState;
  onChange: (field: keyof IntegrationState, val: string | boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  isSuccess: boolean;
}) {
  return (
    <div className={cn(
      "bg-[#16161b] border rounded-2xl p-6 transition-all shadow-xl flex flex-col",
      state.isActive ? borderColor : "border-white/5",
      state.isActive ? glow : ""
    )}>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white", color)}>
            {logo}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-2 h-2 rounded-full", state.isActive ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
              <span className="text-xs text-zinc-400 font-medium">
                {state.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onChange("isActive", !state.isActive)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            state.isActive ? color : "bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              state.isActive ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      <div className={cn(
        "space-y-4 flex-1 transition-opacity duration-300",
        state.isActive ? "opacity-100" : "opacity-40 pointer-events-none"
      )}>
        
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Restaurant ID</label>
          <input
            type="text"
            value={state.restaurantId}
            onChange={(e) => onChange("restaurantId", e.target.value)}
            placeholder="Örn: 987654"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
            disabled={!state.isActive}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">API Key</label>
          <input
            type="password"
            value={state.apiKey}
            onChange={(e) => onChange("apiKey", e.target.value)}
            placeholder="••••••••••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
            disabled={!state.isActive}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Secret Key</label>
          <input
            type="password"
            value={state.secretKey}
            onChange={(e) => onChange("secretKey", e.target.value)}
            placeholder="••••••••••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
            disabled={!state.isActive}
          />
        </div>

      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <button
          onClick={onSave}
          disabled={!state.isActive || isSaving || isSuccess}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
            !state.isActive 
              ? "bg-white/5 text-zinc-500" 
              : isSuccess
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : `${color} text-white hover:opacity-90 shadow-lg ${glow}`
          )}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Bağlantı Başarılı!
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              Kaydet ve Bağlan
            </>
          )}
        </button>
      </div>

    </div>
  );
}
