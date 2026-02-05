// Dataset BPS Indonesia - Pendidikan, Kesehatan, Ekonomi (2015-2025)
import { 
  generateAPSData, 
  generateRLSHLSData, 
  generateAHHData, 
  generateStuntingData,
  generatePDRBData,
  generateKemiskinanData,
  generateTPTData
} from './generateFullData';

export interface Dataset {
  id: string;
  title: string;
  description: string;
  publisher: string;
  published: string;
  lastModified: string;
  license: string;
  language: string;
  keywords: string[];
  category: string;
  geographicCoverage: string;
  dateRange: { start: string; end: string };
  spatialGranularity: string;
  temporalGranularity: string;
  format: string;
  schema: {
    columnName: string;
    dataType: string;
    unit?: string;
    definition: string;
  }[];
  primaryKey: string;
  missingValueIndicator: string;
  sampleData: Record<string, any>[];
  collectionMethod: string;
  samplingMethod: string;
  tools: string;
  contact: { name: string; email: string };
  lineage: string;
  completeness: number;
  accuracy: string;
  timeliness: string;
  consistencyRules: string[];
  endpoint: string;
  authentication: string;
  rateLimit: string;
  fileSize: string;
  storageLocation: string;
  sensitivityClass: string;
  anonymization: string;
  legalConstraints: string;
  useCases: string[];
  recommendedTransforms: string[];
  estimatedCompute: string;
}

export const mockDatasets: Dataset[] = [
  {
    id: "bps-edu-001",
    title: "Angka Partisipasi Sekolah (APS) 2015-2025",
    description: "Data time series angka partisipasi sekolah menurut kelompok umur dan jenis kelamin di 34 provinsi Indonesia periode 2015-2025. Indikator penting untuk mengukur partisipasi penduduk usia sekolah dalam pendidikan formal.",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2015-01-15T00:00:00Z",
    lastModified: "2025-09-20T10:30:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["pendidikan", "partisipasi sekolah", "APS", "SD", "SMP", "SMA", "time series", "provinsi"],
    category: "Pendidikan",
    geographicCoverage: "Indonesia - 34 Provinsi (Nasional s.d. Provinsi)",
    dateRange: { start: "2015-01-01", end: "2025-12-31" },
    spatialGranularity: "Provinsi (34 provinsi)",
    temporalGranularity: "Tahunan",
    format: "CSV, Excel (XLSX), JSON",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun data (2015-2025)" },
      { columnName: "kode_provinsi", dataType: "string", definition: "Kode provinsi (2 digit)" },
      { columnName: "nama_provinsi", dataType: "string", definition: "Nama provinsi" },
      { columnName: "kelompok_umur", dataType: "string", definition: "Kelompok umur (7-12, 13-15, 16-18, 19-24 tahun)" },
      { columnName: "jenis_kelamin", dataType: "string", definition: "Jenis kelamin (Laki-laki/Perempuan/Total)" },
      { columnName: "aps", dataType: "float", unit: "%", definition: "Angka Partisipasi Sekolah" },
      { columnName: "jumlah_siswa", dataType: "int", unit: "orang", definition: "Estimasi jumlah siswa" },
    ],
    primaryKey: "tahun, kode_provinsi, kelompok_umur, jenis_kelamin",
    missingValueIndicator: "-",
    sampleData: generateAPSData(),
    collectionMethod: "Survei Sosial Ekonomi Nasional (Susenas) - wawancara langsung rumah tangga",
    samplingMethod: "Multi-stage stratified random sampling, Two-stage sampling design",
    tools: "Computer Assisted Personal Interview (CAPI), CSPro software",
    contact: { name: "Direktorat Statistik Kesejahteraan Rakyat", email: "bpshso@bps.go.id" },
    lineage: "Susenas raw data → cleaning & validation → weighting adjustment → aggregation provinsi/nasional → publikasi",
    completeness: 98.5,
    accuracy: "Sampling error (SE) < 5% untuk estimasi nasional, < 10% untuk provinsi",
    timeliness: "Publikasi 6-8 bulan setelah periode referensi",
    consistencyRules: ["APS <= 100", "jumlah_siswa >= 0", "tahun dalam range 2015-2025", "kode_provinsi valid"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/27/key/[API_KEY]",
    authentication: "API Key (registrasi di portal BPS)",
    rateLimit: "1000 requests/day (free tier)",
    fileSize: "~15 MB (CSV untuk 10 tahun)",
    storageLocation: "BPS Data Center, Jakarta",
    sensitivityClass: "Public",
    anonymization: "Data agregat, tidak ada identifikasi individu",
    legalConstraints: "Undang-Undang No. 16 Tahun 1997 tentang Statistik",
    useCases: [
      "Monitoring program wajib belajar 12 tahun",
      "Perencanaan pembangunan infrastruktur pendidikan",
      "Evaluasi disparitas pendidikan antar provinsi",
      "Policy evaluation Kemendikbudristek"
    ],
    recommendedTransforms: [
      "Perhitungan growth rate tahunan",
      "Gender parity index calculation",
      "Provincial ranking dan clustering"
    ],
    estimatedCompute: "~500MB RAM untuk analisis 10 tahun seluruh provinsi",
  },
  {
    id: "bps-edu-002",
    title: "Rata-rata Lama Sekolah (RLS) dan Harapan Lama Sekolah (HLS) 2015-2025",
    description: "Indikator kualitas pendidikan yang menunjukkan rata-rata jumlah tahun yang ditempuh penduduk usia 25+ (RLS) dan harapan lama sekolah untuk anak usia 7 tahun (HLS) di Indonesia, komponen Indeks Pembangunan Manusia (IPM).",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2015-02-10T00:00:00Z",
    lastModified: "2025-11-15T14:00:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["pendidikan", "IPM", "RLS", "HLS", "lama sekolah", "human development", "provinsi"],
    category: "Pendidikan",
    geographicCoverage: "Indonesia - 34 Provinsi + 514 Kabupaten/Kota",
    dateRange: { start: "2015-01-01", end: "2025-12-31" },
    spatialGranularity: "Kabupaten/Kota (514) dan Provinsi (34)",
    temporalGranularity: "Tahunan",
    format: "CSV, Excel (XLSX), JSON, API",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun data" },
      { columnName: "kode_wilayah", dataType: "string", definition: "Kode wilayah (2 digit provinsi / 4 digit kab/kota)" },
      { columnName: "nama_wilayah", dataType: "string", definition: "Nama provinsi/kabupaten/kota" },
      { columnName: "rls", dataType: "float", unit: "tahun", definition: "Rata-rata Lama Sekolah penduduk 25+" },
      { columnName: "hls", dataType: "float", unit: "tahun", definition: "Harapan Lama Sekolah anak usia 7 tahun" },
      { columnName: "jenis_kelamin", dataType: "string", definition: "Laki-laki/Perempuan/Total" },
    ],
    primaryKey: "tahun, kode_wilayah, jenis_kelamin",
    missingValueIndicator: "n/a",
    sampleData: generateRLSHLSData(),
    collectionMethod: "Susenas (Survei Sosial Ekonomi Nasional) - kombinasi dengan data administratif Dapodik",
    samplingMethod: "Stratified two-stage sampling",
    tools: "CAPI (Computer Assisted Personal Interview), SAS, R statistical software",
    contact: { name: "Subdirektorat Statistik Pendidikan", email: "statpendidikan@bps.go.id" },
    lineage: "Susenas microdata → imputation missing data → calculation by formula → validation → district/province aggregation",
    completeness: 99.2,
    accuracy: "Coefficient of variation (CV) < 5% untuk provinsi",
    timeliness: "Publikasi 7-9 bulan setelah Maret (periode referensi)",
    consistencyRules: ["RLS <= HLS + margin", "RLS >= 0 and <= 20", "HLS >= RLS", "jenis_kelamin valid"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/26/key/[API_KEY]",
    authentication: "API Key (free registration)",
    rateLimit: "1000 requests/day",
    fileSize: "~45 MB (10 tahun, 514 kab/kota)",
    storageLocation: "BPS Central Server, Jakarta + Regional Backup",
    sensitivityClass: "Public",
    anonymization: "Agregat wilayah, tidak ada data individu",
    legalConstraints: "UU Statistik No. 16/1997, Peraturan Kepala BPS",
    useCases: [
      "Perhitungan Indeks Pembangunan Manusia (IPM/HDI)",
      "Monitoring SDG 4 (Quality Education)",
      "Perencanaan alokasi DAK pendidikan",
      "Identifikasi daerah tertinggal bidang pendidikan"
    ],
    recommendedTransforms: [
      "Year-over-year growth calculation",
      "Gender gap analysis (RLS male vs female)",
      "Correlation analysis dengan poverty rate",
      "Spatial clustering analysis"
    ],
    estimatedCompute: "~2GB RAM untuk analisis spasial 514 kabupaten/kota",
  },
  {
    id: "bps-health-001",
    title: "Angka Harapan Hidup (AHH) Menurut Provinsi 2015-2025",
    description: "Angka Harapan Hidup saat lahir (life expectancy at birth) yang menunjukkan rata-rata perkiraan lama hidup sejak lahir. Merupakan komponen IPM dan indikator utama kesehatan masyarakat.",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2015-03-20T00:00:00Z",
    lastModified: "2025-10-05T09:15:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["kesehatan", "harapan hidup", "AHH", "life expectancy", "IPM", "mortalitas", "provinsi"],
    category: "Kesehatan",
    geographicCoverage: "Indonesia - 34 Provinsi",
    dateRange: { start: "2015-01-01", end: "2025-12-31" },
    spatialGranularity: "Provinsi (34 provinsi)",
    temporalGranularity: "Tahunan",
    format: "CSV, Excel, JSON, PDF Report",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun estimasi" },
      { columnName: "kode_provinsi", dataType: "string", definition: "Kode provinsi BPS" },
      { columnName: "nama_provinsi", dataType: "string", definition: "Nama provinsi" },
      { columnName: "ahh_total", dataType: "float", unit: "tahun", definition: "Angka Harapan Hidup - Total" },
      { columnName: "ahh_lakilaki", dataType: "float", unit: "tahun", definition: "Angka Harapan Hidup - Laki-laki" },
      { columnName: "ahh_perempuan", dataType: "float", unit: "tahun", definition: "Angka Harapan Hidup - Perempuan" },
      { columnName: "metode", dataType: "string", definition: "Metode estimasi (Direct/Indirect)" },
    ],
    primaryKey: "tahun, kode_provinsi",
    missingValueIndicator: "-",
    sampleData: generateAHHData(),
    collectionMethod: "Indirect estimation dari Survei Penduduk Antar Sensus (SUPAS) dan Sensus Penduduk, menggunakan model life table",
    samplingMethod: "Sampel SUPAS ~500.000 rumah tangga secara nasional",
    tools: "Mortpak software (UN Population Division), STATA, indirect demographic estimation techniques",
    contact: { name: "Direktorat Statistik Kependudukan dan Ketenagakerjaan", email: "demografi@bps.go.id" },
    lineage: "SUPAS/SP data → mortality estimation by age group → life table construction → AHH calculation (e0) → smoothing",
    completeness: 100.0,
    accuracy: "Standard error ±0.5 tahun untuk provinsi besar, ±1.2 tahun untuk provinsi kecil",
    timeliness: "Publikasi 12-18 bulan setelah SUPAS/Sensus (dilakukan 5 tahunan)",
    consistencyRules: ["ahh_total between 50-85", "ahh_perempuan > ahh_lakilaki", "tahun valid", "trend monoton increasing"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/23/key/[API_KEY]",
    authentication: "API Key",
    rateLimit: "1000 requests/day",
    fileSize: "~2 MB (10 tahun, 34 provinsi)",
    storageLocation: "BPS Central Repository",
    sensitivityClass: "Public",
    anonymization: "Estimasi agregat, tidak ada data individu",
    legalConstraints: "UU Statistik, UU Administrasi Kependudukan",
    useCases: [
      "Komponen IPM (Indeks Pembangunan Manusia)",
      "Monitoring kesehatan masyarakat jangka panjang",
      "Proyeksi penduduk dan perencanaan pensiun",
      "Evaluasi program kesehatan nasional"
    ],
    recommendedTransforms: [
      "Gender gap analysis",
      "Trend analysis dengan exponential smoothing",
      "Correlation dengan GDP per capita, poverty rate",
      "Convergence analysis antar provinsi"
    ],
    estimatedCompute: "~200MB RAM untuk analisis time series",
  },
  {
    id: "bps-health-002",
    title: "Persentase Balita Gizi Buruk dan Gizi Kurang 2015-2025",
    description: "Prevalensi status gizi balita (usia 0-59 bulan) berdasarkan indikator berat badan menurut umur (BB/U), tinggi badan menurut umur (TB/U), dan berat badan menurut tinggi badan (BB/TB). Indikator kunci kesehatan anak dan SDG 2.2.",
    publisher: "Badan Pusat Statistik (BPS) Indonesia - bekerjasama dengan Kementerian Kesehatan",
    published: "2015-05-10T00:00:00Z",
    lastModified: "2025-08-25T11:00:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["kesehatan", "balita", "gizi", "stunting", "wasting", "underweight", "malnutrition", "SDG"],
    category: "Kesehatan",
    geographicCoverage: "Indonesia - 34 Provinsi",
    dateRange: { start: "2015-01-01", end: "2025-12-31" },
    spatialGranularity: "Provinsi (34 provinsi)",
    temporalGranularity: "Tahunan",
    format: "CSV, Excel, JSON",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun survei" },
      { columnName: "kode_provinsi", dataType: "string", definition: "Kode provinsi" },
      { columnName: "nama_provinsi", dataType: "string", definition: "Nama provinsi" },
      { columnName: "stunting", dataType: "float", unit: "%", definition: "Prevalensi stunting (pendek+sangat pendek) TB/U" },
      { columnName: "wasting", dataType: "float", unit: "%", definition: "Prevalensi wasting (kurus+sangat kurus) BB/TB" },
      { columnName: "underweight", dataType: "float", unit: "%", definition: "Prevalensi underweight (BB kurang+sangat kurang) BB/U" },
      { columnName: "jumlah_sampel", dataType: "int", unit: "balita", definition: "Jumlah balita dalam sampel" },
    ],
    primaryKey: "tahun, kode_provinsi",
    missingValueIndicator: "n/a",
    sampleData: generateStuntingData(),
    collectionMethod: "Survei Status Gizi Indonesia (SSGI) dan Susenas - pengukuran antropometri langsung",
    samplingMethod: "Two-stage stratified cluster sampling",
    tools: "WHO Anthro software untuk standardisasi z-scores, CAPI tablets",
    contact: { name: "BPS c.q. Direktorat Statistik Kesejahteraan Rakyat", email: "kesehatan.bps@bps.go.id" },
    lineage: "Antropometri measurement → z-score calculation (WHO standards) → classification by cutoff → weighting → aggregation",
    completeness: 96.8,
    accuracy: "Sampling error < 2% untuk nasional, < 8% untuk provinsi kecil",
    timeliness: "Publikasi 4-6 bulan setelah survei",
    consistencyRules: ["prevalensi between 0-100", "jumlah_sampel > 0", "stunting + wasting + underweight logical"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/1761/key/[API_KEY]",
    authentication: "API Key (registration)",
    rateLimit: "1000 requests/day",
    fileSize: "~5 MB (10 tahun)",
    storageLocation: "BPS Data Center + Kemenkes backup",
    sensitivityClass: "Public (aggregated)",
    anonymization: "No individual identifiers, aggregated to province level",
    legalConstraints: "UU Statistik, UU Kesehatan",
    useCases: [
      "Monitoring Program Penurunan Stunting Nasional",
      "SDG 2.2 (End malnutrition) monitoring",
      "Targeting daerah prioritas intervensi gizi",
      "Impact evaluation program bantuan sosial"
    ],
    recommendedTransforms: [
      "Time series trend analysis",
      "Comparison dengan WHO global thresholds",
      "Correlation dengan poverty, sanitation, maternal education",
      "Provincial hotspot mapping"
    ],
    estimatedCompute: "~800MB RAM untuk spatial-temporal analysis",
  },
  {
    id: "bps-econ-001",
    title: "Produk Domestik Regional Bruto (PDRB) Atas Dasar Harga Konstan 2015-2025",
    description: "PDRB atas dasar harga konstan 2010 menurut lapangan usaha untuk 34 provinsi dan 514 kabupaten/kota. Menunjukkan pertumbuhan ekonomi riil tanpa pengaruh inflasi. Publikasi tahunan dan triwulanan.",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2016-02-15T00:00:00Z",
    lastModified: "2026-02-03T15:30:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["ekonomi", "PDRB", "GDP", "pertumbuhan ekonomi", "regional", "lapangan usaha", "konstan"],
    category: "Ekonomi",
    geographicCoverage: "Indonesia - 34 Provinsi + 514 Kabupaten/Kota",
    dateRange: { start: "2015-01-01", end: "2025-12-31" },
    spatialGranularity: "Kabupaten/Kota (514) dan Provinsi (34)",
    temporalGranularity: "Tahunan dan Triwulanan",
    format: "CSV, Excel (XLSX), JSON, API",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun data" },
      { columnName: "triwulan", dataType: "int", definition: "Triwulan (1-4), 0 untuk tahunan" },
      { columnName: "kode_wilayah", dataType: "string", definition: "Kode provinsi/kabupaten/kota" },
      { columnName: "nama_wilayah", dataType: "string", definition: "Nama wilayah" },
      { columnName: "lapangan_usaha", dataType: "string", definition: "Sektor ekonomi (17 kategori KBLI)" },
      { columnName: "pdrb_adhk", dataType: "float", unit: "juta rupiah", definition: "PDRB atas dasar harga konstan 2010" },
      { columnName: "pertumbuhan", dataType: "float", unit: "%", definition: "Pertumbuhan y-o-y" },
    ],
    primaryKey: "tahun, triwulan, kode_wilayah, lapangan_usaha",
    missingValueIndicator: "-",
    sampleData: generatePDRBData(),
    collectionMethod: "Kompilasi dari berbagai survei ekonomi BPS (Survei Industri, Perdagangan, Jasa, Konstruksi) dan data administratif",
    samplingMethod: "Mix of census (large enterprises) dan sampling (small-medium enterprises)",
    tools: "SNA 2008 Framework, Supply-Use Table, CEIC database",
    contact: { name: "Direktorat Neraca Produksi", email: "pdrb@bps.go.id" },
    lineage: "Multiple economic surveys → industry classification → value added calculation → deflation → supply-use balancing → PDRB compilation",
    completeness: 99.7,
    accuracy: "Revisi standar ±0.5% point dari angka sementara ke tetap",
    timeliness: "Angka sementara: 2 bulan post-period (triwulan), 7 bulan (tahunan). Angka tetap: +12 bulan",
    consistencyRules: ["pertumbuhan between -20 and 30", "pdrb_adhk > 0", "sum lapangan usaha = total", "kode_wilayah valid"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/104/key/[API_KEY]",
    authentication: "API Key (free tier available)",
    rateLimit: "2000 requests/day",
    fileSize: "~380 MB (10 tahun, 514 kab/kota, 17 lapangan usaha)",
    storageLocation: "BPS Central Database + Regional BPS nodes",
    sensitivityClass: "Public",
    anonymization: "Aggregated data, individual business confidentiality maintained",
    legalConstraints: "UU Statistik No. 16/1997, kerahasiaan data usaha dijaga",
    useCases: [
      "Monitoring pertumbuhan ekonomi regional",
      "Perencanaan APBD dan alokasi DAU",
      "Investment decision dan site selection",
      "Regional convergence analysis",
      "Sectoral contribution analysis"
    ],
    recommendedTransforms: [
      "Real GDP growth calculation (y-o-y, q-o-q)",
      "Sectoral share analysis",
      "GDP per capita calculation (butuh data penduduk)",
      "Location Quotient (LQ) analysis",
      "Shift-share analysis"
    ],
    estimatedCompute: "~5GB RAM untuk analisis panel 10 tahun seluruh kab/kota",
  },
  {
    id: "bps-econ-002",
    title: "Tingkat Pengangguran Terbuka (TPT) dan Ketenagakerjaan 2015-2025",
    description: "Indikator ketenagakerjaan utama mencakup Tingkat Pengangguran Terbuka (TPT), Tingkat Partisipasi Angkatan Kerja (TPAK), jumlah angkatan kerja, bekerja, pengangguran menurut provinsi dari Sakernas (Survei Angkatan Kerja Nasional).",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2015-05-10T00:00:00Z",
    lastModified: "2025-11-08T10:00:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["ekonomi", "ketenagakerjaan", "pengangguran", "TPT", "TPAK", "Sakernas", "labor force", "employment"],
    category: "Ekonomi",
    geographicCoverage: "Indonesia - 34 Provinsi",
    dateRange: { start: "2015-02-01", end: "2025-08-31" },
    spatialGranularity: "Provinsi (34 provinsi)",
    temporalGranularity: "Semesteran (Februari dan Agustus)",
    format: "CSV, Excel, JSON, PDF",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun survei" },
      { columnName: "bulan", dataType: "string", definition: "Bulan survei (Februari/Agustus)" },
      { columnName: "kode_provinsi", dataType: "string", definition: "Kode provinsi" },
      { columnName: "nama_provinsi", dataType: "string", definition: "Nama provinsi" },
      { columnName: "angkatan_kerja", dataType: "int", unit: "ribu orang", definition: "Jumlah angkatan kerja (bekerja + menganggur)" },
      { columnName: "bekerja", dataType: "int", unit: "ribu orang", definition: "Jumlah penduduk bekerja" },
      { columnName: "pengangguran", dataType: "int", unit: "ribu orang", definition: "Jumlah pengangguran terbuka" },
      { columnName: "tpt", dataType: "float", unit: "%", definition: "Tingkat Pengangguran Terbuka" },
      { columnName: "tpak", dataType: "float", unit: "%", definition: "Tingkat Partisipasi Angkatan Kerja" },
    ],
    primaryKey: "tahun, bulan, kode_provinsi",
    missingValueIndicator: "-",
    sampleData: generateTPTData(),
    collectionMethod: "Sakernas (Survei Angkatan Kerja Nasional) - wawancara langsung menggunakan CAPI",
    samplingMethod: "Two-stage stratified sampling, ~75.000 rumah tangga per survei",
    tools: "CAPI (Computer Assisted Personal Interview), ILO labor force definitions",
    contact: { name: "Subdirektorat Statistik Ketenagakerjaan", email: "tenagakerja@bps.go.id" },
    lineage: "Sakernas raw data → ILO-based classification (bekerja/menganggur) → weighting → provincial aggregation → rate calculation",
    completeness: 99.4,
    accuracy: "Sampling error TPT < 0.3% point untuk nasional, < 1.5% untuk provinsi",
    timeliness: "Publikasi 2 bulan setelah periode survei (April dan Oktober)",
    consistencyRules: ["TPT = (pengangguran/angkatan_kerja)*100", "angkatan_kerja = bekerja + pengangguran", "TPT between 0-30", "TPAK between 50-90"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/507/key/[API_KEY]",
    authentication: "API Key",
    rateLimit: "1500 requests/day",
    fileSize: "~8 MB (10 tahun, 2 periode/tahun)",
    storageLocation: "BPS Main Server",
    sensitivityClass: "Public (aggregated)",
    anonymization: "Microdata anonymized, published data aggregated to province",
    legalConstraints: "UU Statistik, UU Ketenagakerjaan",
    useCases: [
      "Monitoring kondisi pasar tenaga kerja",
      "Evaluasi program Kartu Prakerja dan pelatihan vokasi",
      "Policy planning Kementerian Ketenagakerjaan",
      "Business investment decisions",
      "SDG 8.5 (Full employment) monitoring"
    ],
    recommendedTransforms: [
      "Year-over-year change calculation",
      "Seasonal adjustment analysis",
      "Unemployment rate decomposition by education level",
      "TPAK gender gap analysis",
      "Correlation with GDP growth"
    ],
    estimatedCompute: "~1.5GB RAM untuk time series dan panel analysis",
  },
  {
    id: "bps-econ-003",
    title: "Indeks Harga Konsumen (IHK) dan Inflasi 2015-2026",
    description: "IHK (Consumer Price Index) dan tingkat inflasi bulanan, year-on-year, dan calendar year untuk 90 kota di Indonesia. Mencakup 7 kelompok pengeluaran dengan metode Laspeyres modified.",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2015-01-05T00:00:00Z",
    lastModified: "2026-02-01T08:00:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["ekonomi", "inflasi", "IHK", "CPI", "harga konsumen", "bulanan", "monetary policy"],
    category: "Ekonomi",
    geographicCoverage: "Indonesia - 90 Kota (mencakup semua ibu kota provinsi + kota besar)",
    dateRange: { start: "2015-01-01", end: "2026-02-28" },
    spatialGranularity: "Kota (90 kota) dan Nasional",
    temporalGranularity: "Bulanan",
    format: "CSV, Excel, JSON, API (real-time)",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun" },
      { columnName: "bulan", dataType: "int", definition: "Bulan (1-12)" },
      { columnName: "kode_kota", dataType: "string", definition: "Kode kota (3 digit)" },
      { columnName: "nama_kota", dataType: "string", definition: "Nama kota" },
      { columnName: "kelompok_pengeluaran", dataType: "string", definition: "Kelompok: Umum/Makanan/Perumahan/Sandang/Kesehatan/Pendidikan/Transportasi" },
      { columnName: "ihk", dataType: "float", definition: "Indeks Harga Konsumen (2018=100)" },
      { columnName: "inflasi_mtm", dataType: "float", unit: "%", definition: "Inflasi month-to-month" },
      { columnName: "inflasi_yoy", dataType: "float", unit: "%", definition: "Inflasi year-on-year" },
      { columnName: "inflasi_ytd", dataType: "float", unit: "%", definition: "Inflasi year-to-date (calendar year)" },
    ],
    primaryKey: "tahun, bulan, kode_kota, kelompok_pengeluaran",
    missingValueIndicator: "n/a",
    sampleData: [
      { tahun: 2026, bulan: 1, kode_kota: "000", nama_kota: "Indonesia", kelompok_pengeluaran: "Umum", ihk: 118.45, inflasi_mtm: 0.85, inflasi_yoy: 2.47, inflasi_ytd: 0.85 },
      { tahun: 2026, bulan: 1, kode_kota: "001", nama_kota: "Jakarta", kelompok_pengeluaran: "Umum", ihk: 119.82, inflasi_mtm: 0.92, inflasi_yoy: 2.61, inflasi_ytd: 0.92 },
      { tahun: 2025, bulan: 12, kode_kota: "000", nama_kota: "Indonesia", kelompok_pengeluaran: "Makanan, Minuman, dan Tembakau", ihk: 121.35, inflasi_mtm: 1.15, inflasi_yoy: 3.28, inflasi_ytd: 2.83 },
    ],
    collectionMethod: "Survei harga pasar bulanan - pencatatan harga ~300-500 komoditas di pasar tradisional, modern, dan online",
    samplingMethod: "Purposive sampling pasar/toko (stratified by outlet type), systematic sampling komoditas",
    tools: "Mobile data collection apps, IHK calculation system (Laspeyres formula)",
    contact: { name: "Direktorat Statistik Harga", email: "ihk@bps.go.id" },
    lineage: "Price collection → outlier detection → price relative calculation → weighting by COICOP → index aggregation → inflation calculation",
    completeness: 99.9,
    accuracy: "Sampling variance < 0.05% untuk nasional, validated by Bank Indonesia",
    timeliness: "Publikasi tanggal 1-3 setiap bulan (flash estimate H+1, final H+3)",
    consistencyRules: ["inflasi_mtm = (IHK_t / IHK_t-1 - 1)*100", "inflasi_yoy = (IHK_t / IHK_t-12 - 1)*100", "IHK > 0", "kelompok valid"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/100/key/[API_KEY]",
    authentication: "API Key (free registration), flash data requires premium",
    rateLimit: "3000 requests/day (free), unlimited (premium)",
    fileSize: "~125 MB (11 tahun, 90 kota, bulanan, 7 kelompok)",
    storageLocation: "BPS Real-time Database + Backup servers",
    sensitivityClass: "Public",
    anonymization: "Aggregated price indices, individual prices confidential",
    legalConstraints: "UU Statistik, data sensitif untuk kebijakan moneter Bank Indonesia",
    useCases: [
      "Monetary policy Bank Indonesia (BI rate decisions)",
      "Deflator untuk PDRB dan upah riil",
      "Cost of living adjustments (COLA)",
      "Poverty line calculation",
      "Wage negotiation dan minimum wage setting",
      "Business forecasting dan pricing strategy"
    ],
    recommendedTransforms: [
      "Core inflation calculation (exclude volatile food & energy)",
      "Seasonal adjustment (X-13ARIMA-SEATS)",
      "Regional inflation dispersion analysis",
      "Inflation expectation modeling",
      "Contribution analysis by commodity group"
    ],
    estimatedCompute: "~3GB RAM untuk time series forecasting 90 kota",
  },
  {
    id: "bps-econ-004",
    title: "Persentase Penduduk Miskin (P0) dan Gini Ratio 2015-2025",
    description: "Indikator kemiskinan dan ketimpangan: persentase penduduk miskin (headcount ratio), jumlah penduduk miskin, garis kemiskinan, Indeks Kedalaman Kemiskinan (P1), Indeks Keparahan Kemiskinan (P2), dan Gini Ratio menurut provinsi.",
    publisher: "Badan Pusat Statistik (BPS) Indonesia",
    published: "2015-07-15T00:00:00Z",
    lastModified: "2025-07-18T09:30:00Z",
    license: "CC-BY 4.0 (Open Data License)",
    language: "id-ID",
    keywords: ["ekonomi", "kemiskinan", "poverty", "gini ratio", "inequality", "kesenjangan", "P0", "P1", "P2", "garis kemiskinan"],
    category: "Ekonomi",
    geographicCoverage: "Indonesia - 34 Provinsi (Nasional + Provinsi + Kota/Desa disaggregation)",
    dateRange: { start: "2015-03-01", end: "2025-09-30" },
    spatialGranularity: "Provinsi (34), tersedia juga nasional dan disagregasi perkotaan/perdesaan",
    temporalGranularity: "Semesteran (Maret dan September)",
    format: "CSV, Excel, JSON",
    schema: [
      { columnName: "tahun", dataType: "int", definition: "Tahun data" },
      { columnName: "bulan", dataType: "string", definition: "Bulan (Maret/September)" },
      { columnName: "kode_provinsi", dataType: "string", definition: "Kode provinsi" },
      { columnName: "nama_provinsi", dataType: "string", definition: "Nama provinsi" },
      { columnName: "wilayah", dataType: "string", definition: "Perkotaan/Perdesaan/Total" },
      { columnName: "persentase_miskin", dataType: "float", unit: "%", definition: "Persentase penduduk miskin (headcount ratio)" },
      { columnName: "jumlah_penduduk_miskin", dataType: "int", unit: "orang", definition: "Jumlah penduduk miskin" },
      { columnName: "garis_kemiskinan_perkapita", dataType: "int", unit: "rupiah/kapita/bulan", definition: "Garis Kemiskinan" },
    ],
    primaryKey: "tahun, kode_provinsi, wilayah",
    missingValueIndicator: "-",
    sampleData: generateKemiskinanData(),
    collectionMethod: "Susenas (Survei Sosial Ekonomi Nasional) Modul Konsumsi/Pengeluaran - recall 1 bulan",
    samplingMethod: "Two-stage stratified sampling, ~300.000 rumah tangga",
    tools: "Poverty measurement software based on Foster-Greer-Thorbecke (FGT) indices",
    contact: { name: "Subdirektorat Statistik Kemiskinan dan Ketimpangan", email: "kemiskinan@bps.go.id" },
    lineage: "Susenas consumption data → caloric conversion → poverty line (food + non-food) → FGT indices calculation → Gini from Lorenz curve",
    completeness: 98.2,
    accuracy: "Standard error P0 < 0.5% point nasional, < 2% provinsi",
    timeliness: "Publikasi 4 bulan setelah periode referensi (Juli dan Januari)",
    consistencyRules: ["P0 between 0-100", "P1 <= P0", "P2 <= P1", "Gini between 0-1", "jumlah_miskin = P0 * populasi"],
    endpoint: "https://webapi.bps.go.id/v1/api/list/model/data/domain/0000/var/23/key/[API_KEY]",
    authentication: "API Key",
    rateLimit: "1500 requests/day",
    fileSize: "~12 MB (10 tahun, 34 provinsi, semesteran)",
    storageLocation: "BPS Secure Database",
    sensitivityClass: "Public (aggregated), microdata restricted",
    anonymization: "Aggregated poverty statistics, microdata access requires proposal approval",
    legalConstraints: "UU Statistik, poverty microdata classified as restricted",
    useCases: [
      "Targeting program bantuan sosial (PKH, Bansos, subsidi)",
      "Monitoring SDG 1 (No Poverty) dan SDG 10 (Reduced Inequalities)",
      "Fiscal transfer (DAK, DAU) formula",
      "Regional development priority setting",
      "Impact evaluation program pengentasan kemiskinan"
    ],
    recommendedTransforms: [
      "Poverty incidence trend analysis",
      "Poverty profile by demographic characteristics (requires microdata)",
      "Poverty decomposition by sector/region",
      "Pro-poor growth analysis",
      "Inequality decomposition (within vs between region)"
    ],
    estimatedCompute: "~2.5GB RAM untuk microdata analysis (if accessible)",
  },
];

// Analitik data untuk visualisasi (disesuaikan dengan data BPS)
export const analyticsDataAPSEducation = [
  { tahun: "2016", aps_7_12: 98.82, aps_13_15: 95.34, aps_16_18: 76.25, aps_19_24: 28.51 },
  { tahun: "2017", aps_7_12: 99.02, aps_13_15: 95.89, aps_16_18: 77.18, aps_19_24: 29.12 },
  { tahun: "2018", aps_7_12: 99.18, aps_13_15: 96.21, aps_16_18: 78.45, aps_19_24: 29.87 },
  { tahun: "2019", aps_7_12: 99.25, aps_13_15: 96.58, aps_16_18: 79.32, aps_19_24: 30.45 },
  { tahun: "2020", aps_7_12: 99.28, aps_13_15: 96.87, aps_16_18: 79.88, aps_19_24: 30.12 },
  { tahun: "2021", aps_7_12: 99.34, aps_13_15: 97.12, aps_16_18: 80.54, aps_19_24: 30.88 },
  { tahun: "2022", aps_7_12: 99.42, aps_13_15: 97.48, aps_16_18: 81.23, aps_19_24: 31.52 },
  { tahun: "2023", aps_7_12: 99.51, aps_13_15: 97.78, aps_16_18: 82.05, aps_19_24: 32.18 },
  { tahun: "2024", aps_7_12: 99.58, aps_13_15: 98.14, aps_16_18: 82.87, aps_19_24: 32.91 },
  { tahun: "2025", aps_7_12: 99.65, aps_13_15: 98.42, aps_16_18: 83.54, aps_19_24: 33.45 },
];

export const analyticsDataStunting = [
  { provinsi: "DKI Jakarta", stunting_2020: 19.8, stunting_2023: 19.2, stunting_2025: 18.2 },
  { provinsi: "Jawa Barat", stunting_2020: 28.4, stunting_2023: 24.7, stunting_2025: 22.5 },
  { provinsi: "Jawa Tengah", stunting_2020: 27.9, stunting_2023: 23.8, stunting_2025: 21.8 },
  { provinsi: "Jawa Timur", stunting_2020: 26.2, stunting_2023: 22.5, stunting_2025: 20.3 },
  { provinsi: "NTB", stunting_2020: 37.2, stunting_2023: 33.4, stunting_2025: 31.5 },
  { provinsi: "NTT", stunting_2020: 42.5, stunting_2023: 37.2, stunting_2025: 34.8 },
];

export const analyticsDataPDRB = [
  { tahun: "2016", pertumbuhan: 5.03 },
  { tahun: "2017", pertumbuhan: 5.07 },
  { tahun: "2018", pertumbuhan: 5.17 },
  { tahun: "2019", pertumbuhan: 5.02 },
  { tahun: "2020", pertumbuhan: -2.07 },
  { tahun: "2021", pertumbuhan: 3.70 },
  { tahun: "2022", pertumbuhan: 5.31 },
  { tahun: "2023", pertumbuhan: 5.05 },
  { tahun: "2024", pertumbuhan: 5.12 },
  { tahun: "2025", pertumbuhan: 5.28 },
];

export const analyticsDataTPT = [
  { tahun: "Feb 2016", tpt: 5.50, tpak: 66.67 },
  { tahun: "Agu 2016", tpt: 5.61, tpak: 66.34 },
  { tahun: "Feb 2017", tpt: 5.33, tpak: 66.88 },
  { tahun: "Agu 2017", tpt: 5.50, tpak: 66.67 },
  { tahun: "Feb 2018", tpt: 5.13, tpak: 67.32 },
  { tahun: "Agu 2018", tpt: 5.34, tpak: 66.88 },
  { tahun: "Feb 2019", tpt: 5.01, tpak: 67.58 },
  { tahun: "Agu 2019", tpt: 5.28, tpak: 67.05 },
  { tahun: "Feb 2020", tpt: 4.99, tpak: 67.71 },
  { tahun: "Agu 2020", tpt: 7.07, tpak: 65.18 },
  { tahun: "Feb 2021", tpt: 6.26, tpak: 66.53 },
  { tahun: "Agu 2021", tpt: 6.49, tpak: 66.24 },
  { tahun: "Feb 2022", tpt: 5.83, tpak: 67.15 },
  { tahun: "Agu 2022", tpt: 5.86, tpak: 68.06 },
  { tahun: "Feb 2023", tpt: 5.45, tpak: 68.52 },
  { tahun: "Agu 2023", tpt: 5.32, tpak: 68.89 },
  { tahun: "Feb 2024", tpt: 5.10, tpak: 69.23 },
  { tahun: "Agu 2024", tpt: 4.95, tpak: 69.54 },
  { tahun: "Feb 2025", tpt: 4.92, tpak: 69.75 },
  { tahun: "Agu 2025", tpt: 4.87, tpak: 69.81 },
];

export const analyticsDataKemiskinan = [
  { tahun: "2016", p0: 10.70, gini: 0.394 },
  { tahun: "2017", p0: 10.12, gini: 0.391 },
  { tahun: "2018", p0: 9.66, gini: 0.384 },
  { tahun: "2019", p0: 9.22, gini: 0.380 },
  { tahun: "2020", p0: 9.78, gini: 0.385 },
  { tahun: "2021", p0: 9.71, gini: 0.384 },
  { tahun: "2022", p0: 9.54, gini: 0.381 },
  { tahun: "2023", p0: 9.36, gini: 0.379 },
  { tahun: "2024", p0: 9.15, gini: 0.379 },
  { tahun: "2025", p0: 9.03, gini: 0.381 },
];

// Pipeline execution data (disesuaikan untuk dataset BPS)
export interface PipelineExecution {
  id: string;
  pipelineName: string;
  datasetId: string;
  status: "running" | "success" | "failed" | "pending";
  startTime: string;
  endTime?: string;
  recordsProcessed: number;
  qualityScore: number;
  stages: {
    name: string;
    status: "completed" | "running" | "pending" | "failed";
    duration?: number;
    details: string;
  }[];
}

export const mockPipelines: PipelineExecution[] = [
  {
    id: "pipe-bps-001",
    pipelineName: "Susenas APS Data Ingestion",
    datasetId: "bps-edu-001",
    status: "success",
    startTime: "2025-09-20T02:00:00Z",
    endTime: "2025-09-20T05:45:00Z",
    recordsProcessed: 1360000,
    qualityScore: 98.5,
    stages: [
      { name: "Data Extraction", status: "completed", duration: 180, details: "Extract from Susenas CAPI database (34 provinces)" },
      { name: "Schema Validation", status: "completed", duration: 45, details: "Validate age groups, gender, province codes" },
      { name: "Quality Checks", status: "completed", duration: 120, details: "Completeness: 98.5%, APS <= 100 constraint verified" },
      { name: "Weighting Adjustment", status: "completed", duration: 90, details: "Apply household & population weights" },
      { name: "Aggregation", status: "completed", duration: 60, details: "Province-level aggregation by age & gender" },
      { name: "Load to Warehouse", status: "completed", duration: 30, details: "1.36M records loaded to BPS warehouse" },
    ],
  },
  {
    id: "pipe-bps-002",
    pipelineName: "SSGI Stunting Data Processing",
    datasetId: "bps-health-002",
    status: "running",
    startTime: "2025-08-25T06:00:00Z",
    recordsProcessed: 52340,
    qualityScore: 96.8,
    stages: [
      { name: "Data Extraction", status: "completed", duration: 95, details: "Anthropometric measurements from 34 provinces" },
      { name: "Z-score Calculation", status: "completed", duration: 180, details: "WHO Child Growth Standards applied" },
      { name: "Classification", status: "completed", duration: 60, details: "Stunting, wasting, underweight categorization" },
      { name: "Quality Checks", status: "running", duration: 0, details: "Checking prevalence ranges and sample sizes" },
      { name: "Aggregation", status: "pending", details: "Provincial aggregation pending" },
      { name: "Load to Warehouse", status: "pending", details: "Waiting for quality checks" },
    ],
  },
  {
    id: "pipe-bps-003",
    pipelineName: "Sakernas TPT Monthly Update",
    datasetId: "bps-econ-002",
    status: "success",
    startTime: "2025-11-05T01:00:00Z",
    endTime: "2025-11-05T03:15:00Z",
    recordsProcessed: 225000,
    qualityScore: 99.4,
    stages: [
      { name: "Data Extraction", status: "completed", duration: 60, details: "Sakernas August 2025 data (75,000 households)" },
      { name: "ILO Classification", status: "completed", duration: 45, details: "Working/unemployed classification applied" },
      { name: "Quality Checks", status: "completed", duration: 30, details: "TPT formula validation, TPAK range checks" },
      { name: "Weighting", status: "completed", duration: 25, details: "Provincial population weights applied" },
      { name: "Rate Calculation", status: "completed", duration: 15, details: "TPT & TPAK calculated per province" },
      { name: "Load to Warehouse", status: "completed", duration: 20, details: "225,000 records processed successfully" },
    ],
  },
];

// Quality metrics over time
export const qualityMetricsHistory = [
  { date: "2026-01-29", completeness: 96.8, accuracy: 97.2, timeliness: 94.5, consistency: 95.8 },
  { date: "2026-01-30", completeness: 97.1, accuracy: 97.5, timeliness: 95.1, consistency: 96.2 },
  { date: "2026-01-31", completeness: 96.9, accuracy: 97.3, timeliness: 94.8, consistency: 96.0 },
  { date: "2026-02-01", completeness: 97.5, accuracy: 97.8, timeliness: 95.4, consistency: 96.5 },
  { date: "2026-02-02", completeness: 97.2, accuracy: 97.6, timeliness: 95.2, consistency: 96.3 },
  { date: "2026-02-03", completeness: 97.8, accuracy: 98.1, timeliness: 95.7, consistency: 96.8 },
  { date: "2026-02-04", completeness: 97.5, accuracy: 97.9, timeliness: 95.5, consistency: 96.6 },
  { date: "2026-02-05", completeness: 97.9, accuracy: 98.2, timeliness: 95.9, consistency: 97.0 },
];