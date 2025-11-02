import React, { useState } from "react";

type PlantingState = {
  region: "jawa-tengah" | "jawa-barat" | "jawa-timur";
  season: "musim-hujan" | "musim-kemarau";
  soilType: "lempung" | "pasir" | "gambut";
};

const PlantingRecomendation = () => {
  // Planting Recommendation State
  const [plantingData, setPlantingData] = useState<PlantingState>({
    region: "jawa-tengah",
    season: "musim-hujan",
    soilType: "lempung",
  });
  const plantingRecommendations = {
    "jawa-tengah": {
      "musim-hujan": {
        crops: ["Padi", "Jagung", "Kacang Tanah"],
        bestMonth: "Oktober - November",
      },
      "musim-kemarau": {
        crops: ["Jagung", "Kacang Hijau", "Bawang Merah"],
        bestMonth: "Mei - Juni",
      },
    },
    "jawa-barat": {
      "musim-hujan": {
        crops: ["Padi", "Cabai", "Tomat"],
        bestMonth: "September - Oktober",
      },
      "musim-kemarau": {
        crops: ["Jagung", "Bawang Merah", "Cabai"],
        bestMonth: "April - Mei",
      },
    },
    "jawa-timur": {
      "musim-hujan": {
        crops: ["Padi", "Tembakau", "Kacang Tanah"],
        bestMonth: "November - Desember",
      },
      "musim-kemarau": {
        crops: ["Jagung", "Kacang Hijau", "Bawang Merah"],
        bestMonth: "Juni - Juli",
      },
    },
  } as const;

  const currentRecommendation =
    plantingRecommendations[plantingData.region]?.[plantingData.season] || null;

  return (
    <div className="col-span-1 bg-card border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Rekomendasi Tanam Optimal
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Wilayah
          </label>
          <select
            value={plantingData.region}
            onChange={(e) =>
              setPlantingData((prev) => ({
                ...prev,
                region: e.target.value as PlantingState["region"],
              }))
            }
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="jawa-tengah">Jawa Tengah</option>
            <option value="jawa-barat">Jawa Barat</option>
            <option value="jawa-timur">Jawa Timur</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Musim
          </label>
          <select
            value={plantingData.season}
            onChange={(e) =>
              setPlantingData((prev) => ({
                ...prev,
                season: e.target.value as PlantingState["season"],
              }))
            }
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="musim-hujan">Musim Hujan</option>
            <option value="musim-kemarau">Musim Kemarau</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Jenis Tanah
          </label>
          <select
            value={plantingData.soilType}
            onChange={(e) =>
              setPlantingData((prev) => ({
                ...prev,
                soilType: e.target.value as PlantingState["soilType"],
              }))
            }
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="lempung">Lempung</option>
            <option value="pasir">Pasir</option>
            <option value="gambut">Gambut</option>
          </select>
        </div>
      </div>

      {currentRecommendation && (
        <div className="space-y-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-foreground mb-2">
              <strong>Waktu Tanam Terbaik:</strong>{" "}
              {currentRecommendation.bestMonth}
            </p>
            <p className="text-sm text-muted-foreground">
              Berdasarkan pola cuaca dan musim di wilayah Anda.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Tanaman yang Direkomendasikan:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentRecommendation.crops.map((crop, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg border border-border"
                >
                  <p className="font-medium text-foreground">{crop}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cocok untuk musim ini
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground">
              <strong>Tips:</strong> Pastikan lahan sudah disiapkan 2 minggu
              sebelum waktu tanam optimal. Gunakan benih berkualitas dan lakukan
              pengairan yang cukup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantingRecomendation;
