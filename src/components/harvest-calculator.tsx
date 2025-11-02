"use client";
import React, { useState, useRef } from "react";
import { Calculator, Sprout, CalendarDays, Weight, Wallet } from "lucide-react";

type ApiResponse = {
  crop_type: string;
  area: number; // m2
  price_per_kg: number;
  estimated_yield: number; // kg
  estimated_income: number; // Rp
  harvest_duration_days: number;
  estimated_harvest_date: string; // YYYY-MM-DD
};

const ENDPOINT = "/api/harvest"; // sesuaikan dengan route kamu

const CROP_OPTIONS = [
  "tomat",
  "cabai",
  "selada",
  "wortel",
  "bayam",
  "bawang-merah",
  "bawang-putih",
  "kentang",
  "terong",
  "mentimun",
  "kangkung",
  "sawi",
  "semangka",
  "melon",
  "jeruk",
  "mangga",
  "padi",
  "jagung",
  "kedelai",
] as const;
type CropKey = (typeof CROP_OPTIONS)[number];

const idr = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export default function HarvestCalculator() {
  const [cropType, setCropType] = useState<CropKey>("padi");
  const [plantingDate, setPlantingDate] = useState<string>("");
  const [landAreaHa, setLandAreaHa] = useState<string>(""); // input dalam hektar
  const [pricePerKg, setPricePerKg] = useState<string>(""); // opsional
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    if (!plantingDate || !landAreaHa) {
      setError("Silakan isi Tanggal Tanam dan Luas Lahan.");
      return;
    }

    const ha = Number(landAreaHa);
    if (Number.isNaN(ha) || ha <= 0) {
      setError("Luas lahan harus angka > 0 (dalam hektar).");
      return;
    }

    const areaM2 = Math.round(ha * 10_000); // konversi ha → m² (API butuh m²)

    const price = pricePerKg.trim() ? Number(pricePerKg) : undefined;
    if (pricePerKg.trim() && (Number.isNaN(price) || (price as number) <= 0)) {
      setError("Harga per Kg harus angka > 0.");
      return;
    }

    // Batalkan request sebelumnya (jika ada)
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_type: cropType, // harus sesuai key CROP_DATA
          area: areaM2, // m²
          planting_date: plantingDate, // YYYY-MM-DD
          price_per_kg: price, // opsional
        }),
      });

      const data = (await res.json()) as ApiResponse | { error: string };
      if (!res.ok) throw new Error(data.error || `Gagal (${res.status})`);

      setResult(data as ApiResponse);
    } catch (e: Error<unknown>) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Terjadi kesalahan tak terduga.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setCropType("padi");
    setPlantingDate("");
    setLandAreaHa("");
    setPricePerKg("");
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <div className="w-full h-full col-span-2 bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Calculator className="text-primary" />
          Kalkulator Estimasi Panen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Jenis Tanaman
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value as CropKey)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CROP_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tanggal Tanam
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Luas Lahan (Hektar)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Contoh: 2.5"
              value={landAreaHa}
              onChange={(e) => setLandAreaHa(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Harga Jual per Kg (Rp){" "}
              <span className="text-xs text-muted-foreground">(opsional)</span>
            </label>
            <input
              type="number"
              min={0}
              step="100"
              placeholder="Contoh: 7000"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="flex-1 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Menghitung..." : "Hitung Estimasi"}
          </button>
          <button
            onClick={resetAll}
            className="px-6 py-3 rounded-lg border font-semibold hover:bg-muted transition"
          >
            Reset
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded border border-red-300 bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="p-3 flex items-center gap-2 border-b">
                <Sprout className="opacity-80" />
                <p className="font-semibold">Ringkasan Estimasi</p>
              </div>
              <div className="p-4 text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Tanaman:</span>{" "}
                  <b className="capitalize">
                    {result.crop_type.replace("-", " ")}
                  </b>
                </p>
                <p>
                  <span className="text-muted-foreground">Luas (m²):</span>{" "}
                  <b>{idr(result.area)}</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Harga/Kg:</span>{" "}
                  <b>Rp {idr(result.price_per_kg)}</b>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="p-3 flex items-center gap-2 border-b">
                <CalendarDays className="opacity-80" />
                <p className="font-semibold">Jadwal Panen</p>
              </div>
              <div className="p-4 text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Durasi:</span>{" "}
                  <b>{result.harvest_duration_days} hari</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Tanggal Panen:</span>{" "}
                  <b>{result.estimated_harvest_date}</b>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="p-3 flex items-center gap-2 border-b">
                <Weight className="opacity-80" />
                <p className="font-semibold">Hasil Panen</p>
              </div>
              <div className="p-4 text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Estimasi Hasil:</span>{" "}
                  <b>{idr(result.estimated_yield)} kg</b>
                </p>
                <p className="text-xs text-muted-foreground">
                  *Jika ingin ditampilkan dalam ton, bagi nilai di atas dengan
                  1000.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="p-3 flex items-center gap-2 border-b">
                <Wallet className="opacity-80" />
                <p className="font-semibold">Estimasi Pendapatan</p>
              </div>
              <div className="p-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Pendapatan:</span>{" "}
                  <b>Rp {idr(result.estimated_income)}</b>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
