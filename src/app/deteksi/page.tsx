"use client"

import type React from "react"
import { useState } from "react"
import { MapPin, Calculator, ScanSearch, AlertCircle, Cloud, Sprout } from "lucide-react"
import AuthGuard from "@/components/AuthGuard"
import { CameraCapture } from "@/components/camera-capture"
import { ImageUploader } from "@/components/image-uploader"
import { ImagePreview } from "@/components/image-preview"

type Disease = {
  id: number
  name: string
  confidence: number
  prevention: string[]
  treatment: string[]
}

type CropKey =
  | "tomat"
  | "cabai"
  | "selada"
  | "wortel"
  | "bayam"
  | "bawang-merah"
  | "bawang-putih"
  | "kentang"
  | "terong"
  | "mentimun"
  | "kangkung"
  | "sawi"
  | "semangka"
  | "melon"
  | "jeruk"
  | "mangga"
  | "padi"
  | "jagung"
  | "kedelai"

type DiseaseState = {
  image: File | null
  imagePreview: string | null
  cropType: CropKey
  location: string
  detectionResult: Disease | null
  isDetecting: boolean
}

type HarvestState = {
  cropType: CropKey
  plantingDate: string
  landArea: string // dalam hektar (input user)
  pricePerKg: string
  // Field untuk hasil dari API
  estimatedYieldKg?: string
  estimatedIncome?: string
  harvestDate?: string
  notes?: string
  category?: string
}

type RecommendationResult = {
  crop: string
  recommended_date: string
  confidence: number
  advice: string
  recommendation: {
    status: string
    statusText: string
    recommendation: string
    bestDates?: string[]
    avgTemp?: number
    totalRainfall?: number
    avgHumidity?: number
  }
}

type PlantingState = {
  selectedCrop: CropKey
  locationName: string
  isGettingRecommendation: boolean
  recommendationResult: RecommendationResult | null
}

export default function DeteksiPage() {
  const [loading, setLoading] = useState(false)
  const [diseaseData, setDiseaseData] = useState<DiseaseState>({
    image: null,
    imagePreview: null,
    cropType: "padi",
    location: "",
    detectionResult: null,
    isDetecting: false,
  })

  const [harvestData, setHarvestData] = useState<HarvestState>({
    cropType: "padi",
    plantingDate: "",
    landArea: "",
    pricePerKg: "",
  })

  const [plantingData, setPlantingData] = useState<PlantingState>({
    selectedCrop: "padi",
    locationName: "",
    isGettingRecommendation: false,
    recommendationResult: null,
  })

  // Konversi hektar ke m²
  const hectareToSquareMeter = (hectare: number) => hectare * 10000

  const calculateHarvest = async () => {
    if (!harvestData.plantingDate || !harvestData.landArea) {
      alert("Silakan isi Tanggal Tanam dan Luas Lahan")
      return
    }

    try {
      setLoading(true)

      // Convert hektare to m²
      const areaInM2 = hectareToSquareMeter(Number.parseFloat(harvestData.landArea))

      const requestBody = {
        crop_type: harvestData.cropType,
        area: areaInM2,
        planting_date: harvestData.plantingDate,
        price_per_kg: harvestData.pricePerKg ? Number.parseFloat(harvestData.pricePerKg) : undefined,
      }

      console.log("Request body:", requestBody) // Debug

      const response = await fetch("/api/harvest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        setHarvestData((prev) => ({
          ...prev,
          estimatedYieldKg: data.data.estimated_yield_kg,
          estimatedIncome: data.data.estimated_income,
          harvestDate: data.data.estimated_harvest_date,
          notes: data.data.notes,
          category: data.data.category,
        }))
      } else {
        alert(data.error || data.message || "Gagal menghitung estimasi panen")
      }
    } catch (error) {
      console.error("Error calculating harvest:", error)
      alert(`Gagal menghitung estimasi panen: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageCapture = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setDiseaseData((prev) => ({
        ...prev,
        image: file,
        imagePreview: typeof reader.result === "string" ? reader.result : null,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setDiseaseData((prev) => ({
        ...prev,
        image: file,
        imagePreview: typeof reader.result === "string" ? reader.result : null,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleDetectDisease = async () => {
    if (!diseaseData.image || !diseaseData.cropType) {
      alert("Silakan upload gambar dan pilih jenis tanaman")
      return
    }

    setDiseaseData((prev) => ({ ...prev, isDetecting: true }))

    try {
      const formData = new FormData()
      formData.append("image", diseaseData.image)

      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.disease) {
        setDiseaseData((prev) => ({
          ...prev,
          detectionResult: {
            id: 1,
            name: data.disease,
            confidence: data.confidence,
            prevention: data.prevention,
            treatment: data.treatment,
          },
          isDetecting: false,
        }))
      } else {
        alert(data.error || "Gagal mendeteksi penyakit")
        setDiseaseData((prev) => ({ ...prev, isDetecting: false }))
      }
    } catch (error) {
      console.error("Error detecting disease:", error)
      alert(`Gagal mendeteksi penyakit: ${error instanceof Error ? error.message : "Unknown error"}`)
      setDiseaseData((prev) => ({ ...prev, isDetecting: false }))
    }
  }

  const handlePlantingRecommendation = async () => {
    setPlantingData((prev) => ({
      ...prev,
      isGettingRecommendation: true,
      recommendationResult: null,
    }))

    if (!plantingData.locationName) {
      alert("Silakan masukkan nama daerah atau gunakan lokasi saat ini.")
      setPlantingData((prev) => ({ ...prev, isGettingRecommendation: false }))
      return
    }

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          plantingData.locationName
        )}&limit=1`
      )
      const geoData = await geoResponse.json()

      if (geoData.length === 0) {
        alert("Nama daerah tidak ditemukan. Mohon periksa kembali ejaan.")
        setPlantingData((prev) => ({
          ...prev,
          isGettingRecommendation: false,
        }))
        return
      }

      const lat = geoData[0].lat
      const lon = geoData[0].lon

      const params = new URLSearchParams({
        crop_id: plantingData.selectedCrop,
        lat,
        lon,
      })

      const response = await fetch(`/api/planting/search?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPlantingData((prev) => ({
          ...prev,
          recommendationResult: data,
          isGettingRecommendation: false,
        }))
      } else {
        alert(data.error || "Gagal mendapatkan rekomendasi. Terjadi kesalahan pada server.")
        setPlantingData((prev) => ({
          ...prev,
          isGettingRecommendation: false,
        }))
      }
    } catch (error) {
      console.error("Recommendation error:", error)
      alert("Terjadi kesalahan saat mendapatkan rekomendasi. Mohon coba lagi.")
      setPlantingData((prev) => ({ ...prev, isGettingRecommendation: false }))
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toString()
          const lon = position.coords.longitude.toString()

          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          )
          const geoData = await geoResponse.json()

          if (geoData.address) {
            const locationNameFromGeo =
              geoData.address.city ||
              geoData.address.county ||
              geoData.address.town ||
              geoData.address.village ||
              geoData.display_name
            setPlantingData((prev) => ({
              ...prev,
              locationName: locationNameFromGeo,
            }))
            alert("Lokasi berhasil didapat!")
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.")
        }
      )
    } else {
      alert("Geolocation tidak didukung browser Anda.")
    }
  }

  // Daftar tanaman yang tersedia (sesuai backend)
  const cropOptions: { value: CropKey; label: string }[] = [
    { value: "padi", label: "Padi" },
    { value: "jagung", label: "Jagung" },
    { value: "kedelai", label: "Kedelai" },
    { value: "cabai", label: "Cabai" },
    { value: "tomat", label: "Tomat" },
    { value: "selada", label: "Selada" },
    { value: "wortel", label: "Wortel" },
    { value: "bayam", label: "Bayam" },
    { value: "bawang-merah", label: "Bawang Merah" },
    { value: "bawang-putih", label: "Bawang Putih" },
    { value: "kentang", label: "Kentang" },
    { value: "terong", label: "Terong" },
    { value: "mentimun", label: "Mentimun" },
    { value: "kangkung", label: "Kangkung" },
    { value: "sawi", label: "Sawi" },
    { value: "semangka", label: "Semangka" },
    { value: "melon", label: "Melon" },
    { value: "jeruk", label: "Jeruk (Pohon)" },
    { value: "mangga", label: "Mangga (Pohon)" },
  ]

  // Format rupiah
  const formatRupiah = (angka: string) => {
    const num = Number.parseFloat(angka)
    if (isNaN(num)) return "Rp 0"
    return `Rp ${num.toLocaleString("id-ID")}`
  }

  // Format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        {/* Header Section */}
        <section className="flex sm:flex-row flex-col-reverse items-center justify-center md:gap-40 sm:gap-20 gap-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 md:py-16">
          <div className="lg:px-2 md:px-5 sm:px-10 px-5">
            <h1 className="text-xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
              Deteksi & Kalkulator Pertanian
            </h1>
            <p className="md:text-lg text-sm opacity-90 max-w-2xl">
              Hitung estimasi panen, dapatkan rekomendasi tanam yang optimal, dan deteksi penyakit tanaman untuk lahan
              Anda.
            </p>
          </div>
          <div>
            <Sprout className="size-52" />
          </div>
        </section>

        {/* Main Content */}
        <section className="flex-1 py-12 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Planting Recommendation */}
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="text-primary" />
                    Rekomendasi Tanam Optimal
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Jenis Tanaman</label>
                        <select
                          value={plantingData.selectedCrop}
                          onChange={(e) =>
                            setPlantingData((prev) => ({
                              ...prev,
                              selectedCrop: e.target.value as CropKey,
                            }))
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                          {cropOptions.map((crop) => (
                            <option key={crop.value} value={crop.value}>
                              {crop.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Nama Daerah</label>
                        <input
                          type="text"
                          placeholder="Contoh: Jakarta"
                          value={plantingData.locationName}
                          onChange={(e) =>
                            setPlantingData((prev) => ({
                              ...prev,
                              locationName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={getCurrentLocation}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors duration-200"
                      >
                        <MapPin size={16} />
                        Gunakan Lokasi Saat Ini
                      </button>

                      <button
                        onClick={handlePlantingRecommendation}
                        disabled={plantingData.isGettingRecommendation}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Cloud size={16} />
                        {plantingData.isGettingRecommendation ? "Menganalisis..." : "Dapatkan Rekomendasi"}
                      </button>
                    </div>

                    {plantingData.recommendationResult && (
                      <div className="mt-4 p-4 bg-muted rounded-lg space-y-4 animate-in fade-in-50">
                        <h4 className="font-semibold text-foreground">Rekomendasi Tanam:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm">
                              <strong>Status:</strong>
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                  plantingData.recommendationResult.recommendation.status === "optimal"
                                    ? "bg-green-100 text-green-800"
                                    : plantingData.recommendationResult.recommendation.status === "good"
                                      ? "bg-blue-100 text-blue-800"
                                      : plantingData.recommendationResult.recommendation.status === "poor"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {plantingData.recommendationResult.recommendation.statusText}
                              </span>
                            </p>
                            <p className="text-sm">
                              <strong>Rekomendasi:</strong>{" "}
                              {plantingData.recommendationResult.recommendation.recommendation}
                            </p>
                            {Array.isArray(plantingData.recommendationResult.recommendation.bestDates) &&
                              plantingData.recommendationResult.recommendation.bestDates.length > 0 && (
                                <p className="text-sm">
                                  <strong>Tanggal Terbaik:</strong>{" "}
                                  {plantingData.recommendationResult.recommendation.bestDates.join(", ")}
                                </p>
                              )}
                          </div>
                          <div className="space-y-1">
                            {plantingData.recommendationResult.recommendation.avgTemp && (
                              <p className="text-sm">
                                <strong>Suhu Rata-rata:</strong>{" "}
                                {plantingData.recommendationResult.recommendation.avgTemp}
                                °C
                              </p>
                            )}
                            {plantingData.recommendationResult.recommendation.totalRainfall && (
                              <p className="text-sm">
                                <strong>Total Curah Hujan:</strong>{" "}
                                {plantingData.recommendationResult.recommendation.totalRainfall}
                                mm
                              </p>
                            )}
                            {plantingData.recommendationResult.recommendation.avgHumidity && (
                              <p className="text-sm">
                                <strong>Kelembaban Rata-rata:</strong>{" "}
                                {plantingData.recommendationResult.recommendation.avgHumidity}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Harvest Calculator */}
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Kalkulator Estimasi Panen
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Jenis Tanaman</label>
                      <select
                        value={harvestData.cropType}
                        onChange={(e) =>
                          setHarvestData((prev) => ({
                            ...prev,
                            cropType: e.target.value as CropKey,
                          }))
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      >
                        {cropOptions.map((crop) => (
                          <option key={crop.value} value={crop.value}>
                            {crop.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Tanggal Tanam</label>
                      <input
                        type="date"
                        value={harvestData.plantingDate}
                        onChange={(e) =>
                          setHarvestData((prev) => ({
                            ...prev,
                            plantingDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Luas Lahan (Hektar)</label>
                      <input
                        type="number"
                        placeholder="Contoh: 2.5"
                        step="0.1"
                        value={harvestData.landArea}
                        onChange={(e) =>
                          setHarvestData((prev) => ({
                            ...prev,
                            landArea: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Harga Jual per Kg (Rp)</label>
                      <input
                        type="number"
                        placeholder="Contoh: 5000"
                        value={harvestData.pricePerKg}
                        onChange={(e) =>
                          setHarvestData((prev) => ({
                            ...prev,
                            pricePerKg: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Estimasi Hasil Panen</label>
                      <input
                        type="text"
                        value={harvestData.estimatedYieldKg ? `${harvestData.estimatedYieldKg} kg` : "-"}
                        disabled
                        className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Total Harga Penjualan</label>
                      <input
                        type="text"
                        value={harvestData.estimatedIncome ? formatRupiah(harvestData.estimatedIncome) : "-"}
                        disabled
                        className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground font-bold"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    onClick={calculateHarvest}
                    className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                        Menghitung...
                      </span>
                    ) : (
                      "Hitung Estimasi Panen"
                    )}
                  </button>

                  {harvestData.estimatedYieldKg && (
                    <div className="mt-6 space-y-3 animate-in fade-in-50">
                      <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg">
                        <p className="text-sm text-foreground">
                          <strong>Hasil Estimasi:</strong> Berdasarkan data Anda, estimasi hasil panen adalah{" "}
                          <span className="text-primary font-bold">
                            {harvestData.estimatedYieldKg} kg
                          </span>{" "}
                          (≈{" "}
                          <span className="text-primary font-bold">
                            {(Number(harvestData.estimatedYieldKg) / 1000).toFixed(2)} ton
                          </span>
                          )
                        </p>
                        {harvestData.harvestDate && (
                          <p className="text-sm text-foreground mt-2">
                            <strong>Tanggal Panen:</strong> {formatDate(harvestData.harvestDate)}
                          </p>
                        )}
                        {harvestData.notes && (
                          <p className="text-sm text-foreground mt-2">
                            <strong>Catatan:</strong> {harvestData.notes}
                          </p>
                        )}
                      </div>

                      {harvestData.estimatedIncome && (
                        <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-lg">
                          <p className="text-sm text-foreground">
                            <strong>Total Harga Penjualan:</strong> Dengan harga jual{" "}
                            {formatRupiah(harvestData.pricePerKg || "0")}
                            /kg, total pendapatan Anda adalah{" "}
                            <span className="text-accent font-bold">
                              {formatRupiah(harvestData.estimatedIncome)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Disease Detection */}
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <ScanSearch className="text-accent" />
                  Pendeteksi Penyakit Tanaman
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Pilih Tanaman untuk Deteksi</label>
                    <select
                      value={diseaseData.cropType}
                      onChange={(e) =>
                        setDiseaseData((prev) => ({
                          ...prev,
                          cropType: e.target.value as CropKey,
                        }))
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all mb-4"
                    >
                      {cropOptions.map((crop) => (
                        <option key={crop.value} value={crop.value}>
                          {crop.label}
                        </option>
                      ))}
                    </select>

                    <label className="block text-sm font-semibold text-foreground mb-3">Ambil atau Unggah Gambar</label>
                    <div className="space-y-3">
                      <CameraCapture onCapture={handleImageCapture} disabled={diseaseData.imagePreview !== null} />
                      <ImageUploader onImageSelect={handleImageCapture} disabled={diseaseData.imagePreview !== null} />
                    </div>
                  </div>

                  {diseaseData.imagePreview && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">Preview Gambar</label>
                      <ImagePreview
                        file={diseaseData.image}
                        onRemove={() =>
                          setDiseaseData((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: null,
                            detectionResult: null,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDetectDisease}
                  disabled={!diseaseData.imagePreview || diseaseData.isDetecting}
                  className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {diseaseData.isDetecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                      Mendeteksi...
                    </span>
                  ) : (
                    "Deteksi Penyakit"
                  )}
                </button>

                {diseaseData.detectionResult && (
                  <div className="mt-6 space-y-4 animate-in fade-in-50">
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-lg">{diseaseData.detectionResult.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tingkat Kepercayaan:{" "}
                            <span className="font-semibold text-foreground">
                              {diseaseData.detectionResult.confidence.toFixed(2)}%
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-500/10 border-l-4 border-green-500 rounded-lg">
                      <p className="text-xs font-semibold text-green-700 mb-3">PENCEGAHAN</p>
                      <ul className="space-y-2">
                        {diseaseData.detectionResult.prevention.map((item, index) => (
                          <li key={index} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg">
                      <p className="text-xs font-semibold text-primary mb-3">PENANGANAN</p>
                      <ul className="space-y-2">
                        {diseaseData.detectionResult.treatment.map((item, index) => (
                          <li key={index} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  )
}