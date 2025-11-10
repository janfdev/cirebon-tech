import { NextResponse } from "next/server";

// Enum untuk mencegah typo
export enum CropType {
  TOMAT = "tomat",
  CABAI = "cabai",
  SELADA = "selada",
  WORTEL = "wortel",
  BAYAM = "bayam",
  BAWANG_MERAH = "bawang-merah",
  BAWANG_PUTIH = "bawang-putih",
  KENTANG = "kentang",
  TERONG = "terong",
  MENTIMUN = "mentimun",
  KANGKUNG = "kangkung",
  SAWI = "sawi",
  SEMANGKA = "semangka",
  MELON = "melon",
  PADI = "padi",
  JAGUNG = "jagung",
  KEDELAI = "kedelai",
  // Perennial crops - butuh model berbeda
  JERUK = "jeruk",
  MANGGA = "mangga",
}

// Interface lebih detail
interface AnnualCropData {
  category: "annual";
  yield_per_m2: number; // kg per m² (konversi: 1 kg/m² = 10 ton/hektare)
  price_per_kg: number; // Rp
  days_to_harvest: number; // hari
  notes: string;
}

interface PerennialCropData {
  category: "perennial";
  yield_per_tree: number; // kg per pohon per tahun
  trees_per_m2: number; // kepadatan tanam
  price_per_kg: number; // Rp
  first_harvest_days: number; // hari sampai panen pertama
  annual_harvest_days: number; // hari untuk panen berikutnya
  notes: string;
}

type CropData = AnnualCropData | PerennialCropData;

// Database tanaman dengan data realistis
const CROP_DATABASE: Record<string, CropData> = {
  // === Tanaman Semusim (Annual) ===
  [CropType.TOMAT]: {
    category: "annual",
    yield_per_m2: 0.6, // 6 ton/ha (realistis sistem drip)
    price_per_kg: 5000,
    days_to_harvest: 75,
    notes: "Dapat panen bertahap selama 30 hari",
  },
  [CropType.CABAI]: {
    category: "annual",
    yield_per_m2: 0.5, // 5 ton/ha
    price_per_kg: 12000,
    days_to_harvest: 90,
    notes: "Panen berkala tiap 3-5 hari",
  },
  [CropType.SELADA]: {
    category: "annual",
    yield_per_m2: 0.4, // 4 ton/ha
    price_per_kg: 3000,
    days_to_harvest: 45,
    notes: "Tanam rapat, hidroponik lebih tinggi hasil",
  },
  [CropType.WORTEL]: {
    category: "annual",
    yield_per_m2: 0.4, // 4 ton/ha
    price_per_kg: 4000,
    days_to_harvest: 70, // Diperpanjang karena butuh waktu lebih lama
    notes: "Butuh tanah dalam, bebatu mengurangi hasil",
  },
  [CropType.BAYAM]: {
    category: "annual",
    yield_per_m2: 0.6, // 6 ton/ha (PRIBADI SEBELUMNYA 1.5 kg/m² TERLALU TINGGI)
    price_per_kg: 2500,
    days_to_harvest: 30,
    notes: "Dapat dipanen muda (20 hari) atau dewasa",
  },
  [CropType.BAWANG_MERAH]: {
    category: "annual",
    yield_per_m2: 0.5, // 5 ton/ha
    price_per_kg: 14000,
    days_to_harvest: 65, // Diperpendek dari 100
    notes: "Butuh penyimpanan kering post-panen",
  },
  [CropType.BAWANG_PUTIH]: {
    category: "annual",
    yield_per_m2: 0.4, // 4 ton/ha
    price_per_kg: 30000,
    days_to_harvest: 90, // Diperpendek dari 120
    notes: "Butuh musim dingin, sulit di dataran rendah",
  },
  [CropType.KENTANG]: {
    category: "annual",
    yield_per_m2: 1.0, // 10 ton/ha (SEBELUMNYA 2.5 kg/m² = 25 ton/ha FANTASTIS)
    price_per_kg: 6000,
    days_to_harvest: 90,
    notes: "Butuh tanah gembur subur",
  },
  [CropType.TERONG]: {
    category: "annual",
    yield_per_m2: 0.5, // 5 ton/ha
    price_per_kg: 4500,
    days_to_harvest: 70,
    notes: "Panen bertahap selama 30 hari",
  },
  [CropType.MENTIMUN]: {
    category: "annual",
    yield_per_m2: 0.7, // 7 ton/ha
    price_per_kg: 3500,
    days_to_harvest: 45,
    notes: "Panen tiap 2-3 hari setelah mulai berbuah",
  },
  [CropType.KANGKUNG]: {
    category: "annual",
    yield_per_m2: 0.8, // 8 ton/ha (SEBELUMNYA 2.0 kg/m² = 20 ton/ha TIDAK MASUK AKAL)
    price_per_kg: 2000,
    days_to_harvest: 25,
    notes: "Tumbuh cepat, dapat dipanen muda",
  },
  [CropType.SAWI]: {
    category: "annual",
    yield_per_m2: 0.7, // 7 ton/ha
    price_per_kg: 2200,
    days_to_harvest: 30,
    notes: "Sensitif panas, musim hujan lebih baik",
  },
  [CropType.SEMANGKA]: {
    category: "annual",
    yield_per_m2: 0.8, // 8 ton/ha (SEBELUMNYA 4.0 kg/m² = 40 ton/ha MUSTAHIL)
    price_per_kg: 4000,
    days_to_harvest: 80,
    notes: "Butuh banyak ruang, 1 tanaman per 2-3 m²",
  },
  [CropType.MELON]: {
    category: "annual",
    yield_per_m2: 0.6, // 6 ton/ha (SEBELUMNYA 3.5 kg/m² = 35 ton/ha TIDAK REALISTIS)
    price_per_kg: 5000,
    days_to_harvest: 75,
    notes: "Perlu dukungan tali, 1 tanaman per 1 m²",
  },
  [CropType.PADI]: {
    category: "annual",
    yield_per_m2: 0.6, // 6 ton/ha (standar sawah irigasi)
    price_per_kg: 7000,
    days_to_harvest: 120,
    notes: "Sawah irigasi, tanam-tebang 3x setahun",
  },
  [CropType.JAGUNG]: {
    category: "annual",
    yield_per_m2: 0.5, // 5 ton/ha
    price_per_kg: 4000,
    days_to_harvest: 90,
    notes: "Butuh pollinasi, tanam 2-3 tanaman/m²",
  },
  [CropType.KEDELAI]: {
    category: "annual",
    yield_per_m2: 0.3, // 3 ton/ha (SEBELUMNYA 0.4 masih OK tapi sedikit diturunkan)
    price_per_kg: 10000,
    days_to_harvest: 85,
    notes: "Fix nitrogen, baik untuk rotasi",
  },

  // === Tanaman Tahunan (Perennial) ===
  [CropType.JERUK]: {
    category: "perennial",
    yield_per_tree: 80, // kg per pohon per tahun (peak production)
    trees_per_m2: 0.05, // 500 pohon/hektare = 1 pohon per 20 m²
    price_per_kg: 8000,
    first_harvest_days: 1095, // 3 tahun pertama
    annual_harvest_days: 365, // Setelah itu panen tahunan
    notes: "Pohon, panen pertama 3 tahun. Hasil meningkat tiap tahun",
  },
  [CropType.MANGGA]: {
    category: "perennial",
    yield_per_tree: 100, // kg per pohon per tahun
    trees_per_m2: 0.04, // 400 pohon/hektare = 1 pohon per 25 m²
    price_per_kg: 12000,
    first_harvest_days: 1825, // 5 tahun (lebih realistis)
    annual_harvest_days: 365,
    notes: "Pohon, panen pertama 5-7 tahun",
  },
};

// Helper: Validasi input
function validateInput(data: any) {
  const errors: string[] = [];

  if (!data.crop_type || typeof data.crop_type !== "string") {
    errors.push("crop_type harus string valid");
  }

  if (!data.area || typeof data.area !== "number" || data.area <= 0) {
    errors.push("area harus number positif (dalam m²)");
  }

  if (!data.planting_date || isNaN(Date.parse(data.planting_date))) {
    errors.push("planting_date harus format ISO date valid (YYYY-MM-DD)");
  }

  if (data.price_per_kg !== undefined && (typeof data.price_per_kg !== "number" || data.price_per_kg < 0)) {
    errors.push("price_per_kg harus number positif atau undefined");
  }

  return errors;
}

// Helper: Format rupiah
function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Input received:", body);

    // Validasi input
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validationErrors,
          received: body,
        },
        { status: 400 }
      );
    }

    const { crop_type, area, planting_date, price_per_kg } = body;

    // Cari tanaman (case-insensitive, replace space with dash)
    const normalizedCrop = crop_type.toLowerCase().trim().replace(/\s+/g, "-");
    const crop = CROP_DATABASE[normalizedCrop];

    if (!crop) {
      return NextResponse.json(
        {
          error: "Crop not found",
          message: `Tanaman '${crop_type}' tidak ditemukan. Coba: ${Object.keys(CROP_DATABASE).join(", ")}`,
        },
        { status: 404 }
      );
    }

    // Hitung estimasi panen
    const plantingDate = new Date(planting_date);
    const harvestDate = new Date(plantingDate);

    let yieldKg: number;
    let harvestDurationDays: number;

    if (crop.category === "annual") {
      // Tanaman semusim
      harvestDate.setDate(harvestDate.getDate() + crop.days_to_harvest);
      yieldKg = crop.yield_per_m2 * area;
      harvestDurationDays = crop.days_to_harvest;
    } else {
      // Tanaman tahunan
      const isFirstHarvest = harvestDate.getFullYear() - plantingDate.getFullYear() < 3;
      harvestDate.setDate(harvestDate.getDate() + crop.first_harvest_days);
      yieldKg = crop.yield_per_tree * crop.trees_per_m2 * area;
      harvestDurationDays = crop.first_harvest_days;
    }

    // Hitung pendapatan
    const effectivePrice = price_per_kg || crop.price_per_kg;
    const income = yieldKg * effectivePrice;

    const response = {
      success: true,
      data: {
        crop_type: normalizedCrop,
        area_m2: area,
        price_per_kg: effectivePrice,
        estimated_yield_kg: +yieldKg.toFixed(2),
        estimated_yield_ton_per_hectare: +(yieldKg / area * 10000).toFixed(1),
        estimated_income: Math.round(income),
        formatted_income: formatRupiah(Math.round(income)),
        planting_date: plantingDate.toISOString().split("T")[0],
        estimated_harvest_date: harvestDate.toISOString().split("T")[0],
        harvest_duration_days: harvestDurationDays,
        category: crop.category,
        notes: crop.notes,
      },
    };

    console.log("Calculation result:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}