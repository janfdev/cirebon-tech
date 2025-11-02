import { AlertCircle, Upload } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type Disease = {
  id: number;
  name: string;
  symptoms: string;
  severity: "Tinggi" | "Sedang" | "Rendah" | string;
  treatment: string;
  prevention: string;
};

type CropKey = "padi" | "jagung" | "cabai";

type DiseaseState = {
  image: File | null;
  imagePreview: string | null;
  cropType: CropKey;
  location: string;
  detectionResult: Disease | null;
  isDetecting: boolean;
};

const diseaseDatabase: Record<CropKey, Disease[]> = {
  padi: [
    {
      id: 1,
      name: "Blas Daun",
      symptoms: "Bintik coklat dengan tepi abu-abu pada daun",
      severity: "Tinggi",
      treatment: "Gunakan fungisida berbahan aktif Triazol atau Strobilurin",
      prevention: "Jaga kelembaban, hindari genangan air berlebih",
    },
    {
      id: 2,
      name: "Hawar Daun Bakteri",
      symptoms: "Garis kuning pada tepi daun, meluas ke tengah",
      severity: "Sedang",
      treatment: "Aplikasi bakterisida, buang daun yang terinfeksi",
      prevention: "Gunakan benih sehat, rotasi tanaman",
    },
    {
      id: 3,
      name: "Tungro",
      symptoms: "Daun menguning, tanaman kerdil, produksi menurun",
      severity: "Tinggi",
      treatment:
        "Tidak ada obat, lakukan penyemprotan insektisida untuk vektor",
      prevention: "Gunakan varietas tahan, kontrol wereng",
    },
  ],
  jagung: [
    {
      id: 1,
      name: "Bulai",
      symptoms: "Garis putih pada daun, tanaman kerdil",
      severity: "Tinggi",
      treatment: "Gunakan varietas tahan, tidak ada obat kimia",
      prevention: "Pilih benih berkualitas, kontrol vektor",
    },
    {
      id: 2,
      name: "Bercak Daun Bipolaris",
      symptoms: "Bercak coklat oval pada daun dengan halo kuning",
      severity: "Sedang",
      treatment: "Aplikasi fungisida, buang bagian yang terinfeksi",
      prevention: "Jaga sanitasi lahan, rotasi tanaman",
    },
  ],
  cabai: [
    {
      id: 1,
      name: "Antraknosa",
      symptoms: "Bintik hitam dengan lingkaran kuning pada buah dan daun",
      severity: "Tinggi",
      treatment: "Gunakan fungisida berbahan aktif Benomil atau Karbendazim",
      prevention: "Hindari kelembaban tinggi, jaga drainase",
    },
    {
      id: 2,
      name: "Layu Fusarium",
      symptoms: "Tanaman layu, daun menguning, akar membusuk",
      severity: "Tinggi",
      treatment: "Tidak ada obat, cabut tanaman yang terinfeksi",
      prevention: "Gunakan lahan baru, sterilisasi media tanam",
    },
  ],
};

const DiseaseDetection = () => {
  const [diseaseData, setDiseaseData] = useState<DiseaseState>({
    image: null,
    imagePreview: null,
    cropType: "padi",
    location: "",
    detectionResult: null,
    isDetecting: false,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDiseaseData((prev) => ({
        ...prev,
        image: file,
        imagePreview: typeof reader.result === "string" ? reader.result : null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDetectDisease = () => {
    if (!diseaseData.imagePreview || !diseaseData.cropType) {
      alert("Silakan upload gambar dan pilih jenis tanaman");
      return;
    }

    setDiseaseData((prev) => ({ ...prev, isDetecting: true }));

    // Simulasi proses deteksi (2 detik)
    setTimeout(() => {
      const diseases = diseaseDatabase[diseaseData.cropType] || [];
      const randomDisease =
        diseases[Math.floor(Math.random() * diseases.length)] || null;

      setDiseaseData((prev) => ({
        ...prev,
        detectionResult: randomDisease,
        isDetecting: false,
      }));
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <AlertCircle className="text-accent" />
        Pendeteksi Penyakit Tanaman
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Jenis Tanaman
          </label>
          <select
            value={diseaseData.cropType}
            onChange={(e) =>
              setDiseaseData((prev) => ({
                ...prev,
                cropType: e.target.value as CropKey,
              }))
            }
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="padi">Padi</option>
            <option value="jagung">Jagung</option>
            <option value="cabai">Cabai</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Lokasi Lahan
          </label>
          <input
            type="text"
            placeholder="Masukkan lokasi lahan"
            value={diseaseData.location}
            onChange={(e) =>
              setDiseaseData((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Upload Foto Tanaman
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="disease-image-input"
          />
          <label htmlFor="disease-image-input" className="cursor-pointer">
            <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p className="text-sm font-medium text-foreground">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF (Max 5MB)
            </p>
          </label>
        </div>

        {diseaseData.imagePreview && (
          <div className="mt-4">
            <Image
              width={500}
              height={500}
              src={diseaseData.imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <button
              onClick={() =>
                setDiseaseData((prev) => ({
                  ...prev,
                  image: null,
                  imagePreview: null,
                  detectionResult: null,
                }))
              }
              className="mt-2 text-sm text-accent hover:underline"
            >
              Ganti Gambar
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleDetectDisease}
        disabled={!diseaseData.imagePreview || diseaseData.isDetecting}
        className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {diseaseData.isDetecting ? "Mendeteksi..." : "Deteksi Penyakit"}
      </button>

      {diseaseData.detectionResult && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-accent flex-shrink-0 mt-1"
                size={20}
              />
              <div>
                <h3 className="font-bold text-foreground">
                  {diseaseData.detectionResult.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {diseaseData.detectionResult.symptoms}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                TINGKAT KEPARAHAN
              </p>
              <p className="font-bold text-foreground">
                {diseaseData.detectionResult.severity}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                LOKASI LAHAN
              </p>
              <p className="font-bold text-foreground">
                {diseaseData.location || "Tidak diisi"}
              </p>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs font-semibold text-primary mb-2">
              PENANGANAN
            </p>
            <p className="text-sm text-foreground">
              {diseaseData.detectionResult.treatment}
            </p>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs font-semibold text-green-700 mb-2">
              PENCEGAHAN
            </p>
            <p className="text-sm text-foreground">
              {diseaseData.detectionResult.prevention}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
