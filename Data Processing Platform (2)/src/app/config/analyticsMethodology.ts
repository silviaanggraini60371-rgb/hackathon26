/**
 * ANALYTICS METHODOLOGY REGISTRY
 * 
 * Dokumentasi fixed methodology untuk setiap dataset.
 * Setiap dataset memiliki 3 analisis tetap yang didefinisikan secara eksplisit.
 */

export interface AnalyticsMethodology {
  datasetId: string;
  datasetName: string;
  analyses: {
    id: string;
    name: string;
    description: string;
    formula: string;
    interpretation: {
      good: string;
      medium: string;
      bad: string;
    };
    thresholds?: {
      good: number;
      medium: number;
    };
    unit?: string;
  }[];
  compositeScoring: {
    formula: string;
    weights: { metric: string; weight: number }[];
    normalization: string;
  };
  clustering: {
    method: string;
    clusters: string[];
    criteria: string;
  };
}

export const ANALYTICS_METHODOLOGIES: Record<string, AnalyticsMethodology> = {
  // 1. ANGKA PARTISIPASI SEKOLAH (APS)
  "bps-edu-001": {
    datasetId: "bps-edu-001",
    datasetName: "Angka Partisipasi Sekolah (APS)",
    analyses: [
      {
        id: "gpi",
        name: "Gender Parity Index (GPI)",
        description: "Indeks kesetaraan gender dalam partisipasi pendidikan",
        formula: "GPI = APS Perempuan / APS Laki-laki",
        interpretation: {
          good: "GPI antara 0.97-1.03 menunjukkan paritas gender tercapai (standar UNESCO)",
          medium: "GPI antara 0.90-0.97 atau 1.03-1.10 menunjukkan disparitas minor",
          bad: "GPI < 0.90 atau > 1.10 menunjukkan disparitas gender signifikan"
        },
        thresholds: {
          good: 0.97,
          medium: 0.90
        }
      },
      {
        id: "growth_rate",
        name: "Year-over-Year Growth Rate",
        description: "Laju pertumbuhan tahunan partisipasi sekolah",
        formula: "Growth Rate = ((APS_t - APS_t-1) / APS_t-1) × 100%",
        interpretation: {
          good: "Growth rate > 2% per tahun menunjukkan peningkatan signifikan",
          medium: "Growth rate 0-2% menunjukkan peningkatan moderat",
          bad: "Growth rate < 0% menunjukkan penurunan partisipasi"
        },
        thresholds: {
          good: 2.0,
          medium: 0.0
        },
        unit: "%"
      },
      {
        id: "composite_performance",
        name: "Provincial Performance Index",
        description: "Indeks kinerja komprehensif berdasarkan achievement, momentum, dan equity",
        formula: "Score = (0.50 × Norm_APS) + (0.30 × Norm_Growth) + (0.20 × Norm_GPI)",
        interpretation: {
          good: "High Performer: Score ≥ 67th percentile",
          medium: "Medium Performer: 33rd ≤ Score < 67th percentile",
          bad: "Low Performer: Score < 33rd percentile"
        }
      }
    ],
    compositeScoring: {
      formula: "Weighted sum of normalized metrics",
      weights: [
        { metric: "Current APS Level", weight: 0.50 },
        { metric: "Average Growth Rate", weight: 0.30 },
        { metric: "Gender Parity Index", weight: 0.20 }
      ],
      normalization: "Min-Max normalization: (x - min) / (max - min)"
    },
    clustering: {
      method: "Score threshold clustering",
      clusters: ["High Performer", "Medium Performer", "Low Performer"],
      criteria: "Score ≥80: High | 65≤Score<80: Medium | Score<65: Low"
    }
  },

  // 2. RATA-RATA LAMA SEKOLAH (RLS) & HARAPAN LAMA SEKOLAH (HLS)
  "bps-edu-002": {
    datasetId: "bps-edu-002",
    datasetName: "RLS & HLS",
    analyses: [
      {
        id: "education_gap",
        name: "Education Gap (HLS - RLS)",
        description: "Selisih antara harapan dan pencapaian pendidikan aktual",
        formula: "Gap = HLS - RLS",
        interpretation: {
          good: "Gap > 4 tahun menunjukkan ruang ekspansi pendidikan yang tinggi",
          medium: "Gap 2-4 tahun menunjukkan ruang ekspansi moderat",
          bad: "Gap < 2 tahun menunjukkan stagnansi sistem pendidikan"
        },
        thresholds: {
          good: 4.0,
          medium: 2.0
        },
        unit: "tahun"
      },
      {
        id: "gender_gap",
        name: "Gender Gap in Education",
        description: "Disparitas pendidikan antara laki-laki dan perempuan",
        formula: "Gender Gap = RLS Laki-laki - RLS Perempuan",
        interpretation: {
          good: "Gap -0.3 hingga +0.3 tahun menunjukkan kesetaraan gender",
          medium: "Gap 0.3-0.8 tahun menunjukkan disparitas minor",
          bad: "Gap > 0.8 tahun menunjukkan disparitas gender signifikan"
        },
        thresholds: {
          good: 0.3,
          medium: 0.8
        },
        unit: "tahun"
      },
      {
        id: "convergence_rate",
        name: "Educational Convergence Rate",
        description: "Tingkat konvergensi RLS provinsi terhadap rata-rata nasional",
        formula: "Convergence = -β dari regresi: Growth_RLS = α + β × Initial_RLS",
        interpretation: {
          good: "β negatif signifikan menunjukkan provinsi tertinggal mengejar lebih cepat",
          medium: "β mendekati 0 menunjukkan pertumbuhan merata",
          bad: "β positif menunjukkan divergensi (gap melebar)"
        }
      }
    ],
    compositeScoring: {
      formula: "Education Quality Index",
      weights: [
        { metric: "RLS Level", weight: 0.40 },
        { metric: "HLS Level", weight: 0.30 },
        { metric: "Gender Parity (1-abs(gap))", weight: 0.30 }
      ],
      normalization: "Min-Max normalization"
    },
    clustering: {
      method: "K-means inspired percentile clustering",
      clusters: ["Advanced", "Developing", "Lagging"],
      criteria: "Based on composite Education Quality Index"
    }
  },

  // 3. ANGKA HARAPAN HIDUP (AHH)
  "bps-health-001": {
    datasetId: "bps-health-001",
    datasetName: "Angka Harapan Hidup (AHH)",
    analyses: [
      {
        id: "life_expectancy_trend",
        name: "Life Expectancy Growth Trend",
        description: "Tren peningkatan harapan hidup dari waktu ke waktu",
        formula: "Trend = Δ AHH per tahun (linear regression slope)",
        interpretation: {
          good: "Trend > 0.3 tahun/tahun menunjukkan perbaikan kesehatan signifikan",
          medium: "Trend 0.1-0.3 tahun/tahun menunjukkan perbaikan moderat",
          bad: "Trend < 0.1 tahun/tahun menunjukkan stagnansi kesehatan"
        },
        thresholds: {
          good: 0.3,
          medium: 0.1
        },
        unit: "tahun/tahun"
      },
      {
        id: "gender_longevity_gap",
        name: "Gender Longevity Gap",
        description: "Selisih harapan hidup antara perempuan dan laki-laki",
        formula: "Gap = AHH Perempuan - AHH Laki-laki",
        interpretation: {
          good: "Gap 3-5 tahun adalah normal secara biologis",
          medium: "Gap 2-3 atau 5-6 tahun menunjukkan deviasi minor",
          bad: "Gap < 2 atau > 6 tahun menunjukkan anomali kesehatan gender"
        },
        thresholds: {
          good: 3.0,
          medium: 2.0
        },
        unit: "tahun"
      },
      {
        id: "regional_disparity",
        name: "Regional Health Disparity Index",
        description: "Tingkat disparitas AHH antar provinsi",
        formula: "Disparity = (Coefficient of Variation) = (StdDev / Mean) × 100",
        interpretation: {
          good: "CV < 5% menunjukkan disparitas rendah",
          medium: "CV 5-10% menunjukkan disparitas sedang",
          bad: "CV > 10% menunjukkan disparitas tinggi"
        },
        thresholds: {
          good: 5.0,
          medium: 10.0
        },
        unit: "%"
      }
    ],
    compositeScoring: {
      formula: "Health Development Index",
      weights: [
        { metric: "Current AHH Level", weight: 0.50 },
        { metric: "AHH Growth Trend", weight: 0.30 },
        { metric: "Gender Balance (1-abs(gap-4)/4)", weight: 0.20 }
      ],
      normalization: "Min-Max normalization"
    },
    clustering: {
      method: "Percentile-based clustering",
      clusters: ["High Health", "Medium Health", "Low Health"],
      criteria: "33rd and 67th percentile of composite score"
    }
  },

  // 4. STUNTING & MALNUTRISI
  "bps-health-002": {
    datasetId: "bps-health-002",
    datasetName: "Stunting & Gizi Buruk",
    analyses: [
      {
        id: "stunting_prevalence",
        name: "Stunting Prevalence Rate",
        description: "Tingkat prevalensi stunting (berdasarkan TB/U)",
        formula: "Prevalence = (Jumlah balita stunting / Total balita) × 100",
        interpretation: {
          good: "Prevalence < 20% (target WHO: very low)",
          medium: "Prevalence 20-30% (medium)",
          bad: "Prevalence > 30% (high/very high - public health problem)"
        },
        thresholds: {
          good: 20.0,
          medium: 30.0
        },
        unit: "%"
      },
      {
        id: "reduction_rate",
        name: "Annual Reduction Rate",
        description: "Laju penurunan prevalensi stunting per tahun",
        formula: "Reduction Rate = ((Prev_t-1 - Prev_t) / Prev_t-1) × 100",
        interpretation: {
          good: "Reduction > 3% per tahun (mencapai target SDG 2030)",
          medium: "Reduction 1-3% per tahun (progress moderat)",
          bad: "Reduction < 1% atau negatif (lambat/memburuk)"
        },
        thresholds: {
          good: 3.0,
          medium: 1.0
        },
        unit: "%"
      },
      {
        id: "nutrition_severity",
        name: "Malnutrition Severity Index",
        description: "Indeks keparahan malnutrisi komprehensif",
        formula: "Severity = (0.4 × Stunting%) + (0.3 × Wasting%) + (0.3 × Underweight%)",
        interpretation: {
          good: "Severity < 15% (low)",
          medium: "Severity 15-25% (medium)",
          bad: "Severity > 25% (high - critical)"
        },
        thresholds: {
          good: 15.0,
          medium: 25.0
        },
        unit: "%"
      }
    ],
    compositeScoring: {
      formula: "Nutrition Performance Index (inverse - lower is better)",
      weights: [
        { metric: "Stunting Prevalence (inverse)", weight: 0.40 },
        { metric: "Reduction Rate", weight: 0.35 },
        { metric: "Wasting Prevalence (inverse)", weight: 0.25 }
      ],
      normalization: "Min-Max normalization with inversion for prevalence"
    },
    clustering: {
      method: "Percentile-based clustering (inverted)",
      clusters: ["Low Burden", "Medium Burden", "High Burden"],
      criteria: "Lower values = better performance"
    }
  },

  // 5. PRODUK DOMESTIK REGIONAL BRUTO (PDRB)
  "bps-econ-001": {
    datasetId: "bps-econ-001",
    datasetName: "PDRB per Kapita",
    analyses: [
      {
        id: "economic_growth",
        name: "PDRB Growth Rate",
        description: "Laju pertumbuhan ekonomi regional",
        formula: "Growth = ((PDRB_t - PDRB_t-1) / PDRB_t-1) × 100",
        interpretation: {
          good: "Growth > 6% per tahun (high growth)",
          medium: "Growth 4-6% per tahun (moderate growth)",
          bad: "Growth < 4% per tahun (low growth)"
        },
        thresholds: {
          good: 6.0,
          medium: 4.0
        },
        unit: "%"
      },
      {
        id: "sectoral_diversification",
        name: "Economic Diversification Index",
        description: "Tingkat diversifikasi ekonomi sektoral (Herfindahl-Hirschman Index)",
        formula: "HHI = Σ(share_i²) dimana share = kontribusi sektor i terhadap PDRB",
        interpretation: {
          good: "HHI < 0.15 (highly diversified)",
          medium: "HHI 0.15-0.25 (moderately diversified)",
          bad: "HHI > 0.25 (concentrated - risky)"
        },
        thresholds: {
          good: 0.15,
          medium: 0.25
        }
      },
      {
        id: "convergence",
        name: "Economic Convergence",
        description: "Konvergensi PDRB provinsi terhadap rata-rata nasional",
        formula: "Convergence = -β dari regresi: Growth = α + β × Initial_PDRB",
        interpretation: {
          good: "β < -0.02 (strong convergence - catching up)",
          medium: "β antara -0.02 hingga 0 (weak convergence)",
          bad: "β > 0 (divergence - gap widening)"
        }
      }
    ],
    compositeScoring: {
      formula: "Economic Competitiveness Index",
      weights: [
        { metric: "PDRB per Capita Level", weight: 0.40 },
        { metric: "PDRB Growth Rate", weight: 0.35 },
        { metric: "Diversification (1-HHI)", weight: 0.25 }
      ],
      normalization: "Min-Max normalization"
    },
    clustering: {
      method: "Percentile-based clustering",
      clusters: ["Highly Competitive", "Moderately Competitive", "Less Competitive"],
      criteria: "Based on composite economic index"
    }
  },

  // 6. KEMISKINAN
  "bps-econ-004": {
    datasetId: "bps-econ-004",
    datasetName: "Tingkat Kemiskinan",
    analyses: [
      {
        id: "poverty_rate",
        name: "Poverty Headcount Ratio",
        description: "Persentase penduduk di bawah garis kemiskinan",
        formula: "Poverty Rate = (Jumlah penduduk miskin / Total penduduk) × 100",
        interpretation: {
          good: "Poverty < 7% (low poverty - mendekati target 2024)",
          medium: "Poverty 7-12% (medium poverty)",
          bad: "Poverty > 12% (high poverty)"
        },
        thresholds: {
          good: 7.0,
          medium: 12.0
        },
        unit: "%"
      },
      {
        id: "poverty_reduction",
        name: "Annual Poverty Reduction Rate",
        description: "Laju penurunan kemiskinan per tahun",
        formula: "Reduction = ((Poverty_t-1 - Poverty_t) / Poverty_t-1) × 100",
        interpretation: {
          good: "Reduction > 5% per tahun (on track SDG)",
          medium: "Reduction 2-5% per tahun (moderate progress)",
          bad: "Reduction < 2% atau negatif (slow/worsening)"
        },
        thresholds: {
          good: 5.0,
          medium: 2.0
        },
        unit: "%"
      },
      {
        id: "urban_rural_gap",
        name: "Urban-Rural Poverty Gap",
        description: "Disparitas kemiskinan antara urban dan rural",
        formula: "Gap = Poverty_Rural - Poverty_Urban",
        interpretation: {
          good: "Gap < 3% (low disparity)",
          medium: "Gap 3-7% (moderate disparity)",
          bad: "Gap > 7% (high rural disadvantage)"
        },
        thresholds: {
          good: 3.0,
          medium: 7.0
        },
        unit: "percentage points"
      }
    ],
    compositeScoring: {
      formula: "Poverty Alleviation Performance Index (inverse)",
      weights: [
        { metric: "Poverty Rate (inverse)", weight: 0.45 },
        { metric: "Reduction Rate", weight: 0.35 },
        { metric: "Urban-Rural Equity (inverse gap)", weight: 0.20 }
      ],
      normalization: "Min-Max normalization with inversion"
    },
    clustering: {
      method: "Percentile-based clustering (inverted)",
      clusters: ["Low Poverty", "Medium Poverty", "High Poverty"],
      criteria: "Lower poverty = better cluster"
    }
  },

  // 7. TINGKAT PENGANGGURAN TERBUKA (TPT)
  "bps-econ-003": {
    datasetId: "bps-econ-003",
    datasetName: "Tingkat Pengangguran Terbuka (TPT)",
    analyses: [
      {
        id: "unemployment_rate",
        name: "Open Unemployment Rate",
        description: "Persentase angkatan kerja yang menganggur",
        formula: "TPT = (Jumlah penganggur / Angkatan kerja) × 100",
        interpretation: {
          good: "TPT < 4% (full employment - natural rate)",
          medium: "TPT 4-7% (acceptable unemployment)",
          bad: "TPT > 7% (high unemployment)"
        },
        thresholds: {
          good: 4.0,
          medium: 7.0
        },
        unit: "%"
      },
      {
        id: "education_mismatch",
        name: "Education-Employment Mismatch Index",
        description: "Disparitas TPT berdasarkan tingkat pendidikan",
        formula: "Mismatch = TPT_SMA+Diploma+Sarjana / TPT_SD+SMP",
        interpretation: {
          good: "Ratio < 1.2 (low mismatch)",
          medium: "Ratio 1.2-2.0 (moderate mismatch)",
          bad: "Ratio > 2.0 (high educated unemployment paradox)"
        },
        thresholds: {
          good: 1.2,
          medium: 2.0
        }
      },
      {
        id: "youth_unemployment",
        name: "Youth Unemployment Ratio",
        description: "Rasio pengangguran usia muda vs total",
        formula: "Youth Ratio = TPT_15-24 / TPT_Total",
        interpretation: {
          good: "Ratio < 2.0 (manageable youth unemployment)",
          medium: "Ratio 2.0-3.0 (elevated youth unemployment)",
          bad: "Ratio > 3.0 (critical youth unemployment)"
        },
        thresholds: {
          good: 2.0,
          medium: 3.0
        }
      }
    ],
    compositeScoring: {
      formula: "Labor Market Health Index (inverse)",
      weights: [
        { metric: "Unemployment Rate (inverse)", weight: 0.45 },
        { metric: "Education Match (inverse mismatch)", weight: 0.30 },
        { metric: "Youth Employment (inverse ratio)", weight: 0.25 }
      ],
      normalization: "Min-Max normalization with inversion"
    },
    clustering: {
      method: "Percentile-based clustering (inverted)",
      clusters: ["Healthy Labor Market", "Moderate Challenges", "Severe Challenges"],
      criteria: "Lower unemployment = better performance"
    }
  }
};

/**
 * Get methodology for a specific dataset
 */
export function getMethodology(datasetId: string): AnalyticsMethodology | null {
  return ANALYTICS_METHODOLOGIES[datasetId] || null;
}

/**
 * Check if dataset has analytics support
 */
export function hasAnalytics(datasetId: string): boolean {
  return datasetId in ANALYTICS_METHODOLOGIES;
}

/**
 * Get all supported dataset IDs
 */
export function getSupportedDatasets(): string[] {
  return Object.keys(ANALYTICS_METHODOLOGIES);
}