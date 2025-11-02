import React, { useState } from "react";

import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  CloudHail,
} from "lucide-react";

type WeatherData = {
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
};

const WeatherDetection = () => {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const mockWeatherData: WeatherData = {
    temp: 28,
    humidity: 75,
    rainfall: 45,
    windSpeed: 12,
    condition: "Berawan",
  };

  const handleLocationSearch = async () => {
    if (!location.trim()) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWeather(mockWeatherData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="col-span-1 lg:col-span-1">
      <div className="bg-card border border-border rounded-xl p-6 h-full">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Cloud className="text-primary" />
          Deteksi Cuaca
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <MapPin size={16} className="inline mr-2" />
              Lokasi Anda
            </label>
            <input
              type="text"
              placeholder="Masukkan nama kota atau desa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleLocationSearch}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Mencari..." : "Cari Cuaca"}
          </button>

          {weather && (
            <div className="mt-6 space-y-4 bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer size={20} />
                  <span className="text-sm text-muted-foreground">Suhu</span>
                </div>
                <span className="font-bold text-foreground">
                  {weather.temp}°C
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets size={20} />
                  <span className="text-sm text-muted-foreground">
                    Kelembaban
                  </span>
                </div>
                <span className="font-bold text-foreground">
                  {weather.humidity}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud size={20} />
                  <span className="text-sm text-muted-foreground">Cuaca</span>
                </div>
                <span className="font-bold text-foreground">
                  {weather.condition}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind size={20} />
                  <span className="text-sm text-muted-foreground">Angin</span>
                </div>
                <span className="font-bold text-foreground">
                  {weather.windSpeed} km/h
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <CloudHail size={20} />
                  <span className="text-sm text-muted-foreground">
                    Curah Hujan
                  </span>
                </div>
                <span className="font-bold text-foreground">
                  {weather.rainfall} mm
                </span>
              </div>

              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Rekomendasi:</strong> Kondisi cuaca cocok untuk
                  irigasi. Kelembaban optimal untuk pertumbuhan tanaman.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDetection;
