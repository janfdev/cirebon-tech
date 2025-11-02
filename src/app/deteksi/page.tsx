"use client";

import React from "react";
import { ScanSearch } from "lucide-react";
import DiseaseDetection from "@/components/disease-detection";
import HarvestCalculator from "@/components/harvest-calculator";
import PlantingRecomendation from "@/components/planting-recomendation";
import WeatherDetection from "@/components/weather-detection";

export default function DeteksiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <section className="flex sm:flex-row flex-col-reverse items-center justify-center md:gap-40 sm:gap-20 gap-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 md:py-16">
        <div className="lg:px-2 md:px-5 sm:px-10 px-5">
          <h1 className="text-xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Deteksi & Kalkulator Pertanian
          </h1>
          <p className="md:text-lg text-sm opacity-90 max-w-2xl">
            Deteksi cuaca lokal, hitung estimasi panen, dan dapatkan rekomendasi
            tanam yang optimal untuk lahan Anda.
          </p>
        </div>
        <div>
          <ScanSearch className="size-52" />
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weather Detection */}
            <WeatherDetection />
            {/* Planting Recommendation */}
            <PlantingRecomendation />
            {/* Disease Detection */}
            <DiseaseDetection />
            {/* Harvest Calculator */}
            <HarvestCalculator />
          </div>
        </div>
      </section>
    </div>
  );
}
