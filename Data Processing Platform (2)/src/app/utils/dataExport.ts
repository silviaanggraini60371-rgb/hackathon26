import * as XLSX from 'xlsx';
import type { Dataset } from '../data/mockDataBPS';

// Daftar lengkap 34 provinsi Indonesia
const PROVINSI_INDONESIA = [
  { kode: "11", nama: "Aceh" },
  { kode: "12", nama: "Sumatera Utara" },
  { kode: "13", nama: "Sumatera Barat" },
  { kode: "14", nama: "Riau" },
  { kode: "15", nama: "Jambi" },
  { kode: "16", nama: "Sumatera Selatan" },
  { kode: "17", nama: "Bengkulu" },
  { kode: "18", nama: "Lampung" },
  { kode: "19", nama: "Kepulauan Bangka Belitung" },
  { kode: "21", nama: "Kepulauan Riau" },
  { kode: "31", nama: "DKI Jakarta" },
  { kode: "32", nama: "Jawa Barat" },
  { kode: "33", nama: "Jawa Tengah" },
  { kode: "34", nama: "DI Yogyakarta" },
  { kode: "35", nama: "Jawa Timur" },
  { kode: "36", nama: "Banten" },
  { kode: "51", nama: "Bali" },
  { kode: "52", nama: "Nusa Tenggara Barat" },
  { kode: "53", nama: "Nusa Tenggara Timur" },
  { kode: "61", nama: "Kalimantan Barat" },
  { kode: "62", nama: "Kalimantan Tengah" },
  { kode: "63", nama: "Kalimantan Selatan" },
  { kode: "64", nama: "Kalimantan Timur" },
  { kode: "65", nama: "Kalimantan Utara" },
  { kode: "71", nama: "Sulawesi Utara" },
  { kode: "72", nama: "Sulawesi Tengah" },
  { kode: "73", nama: "Sulawesi Selatan" },
  { kode: "74", nama: "Sulawesi Tenggara" },
  { kode: "75", nama: "Gorontalo" },
  { kode: "76", nama: "Sulawesi Barat" },
  { kode: "81", nama: "Maluku" },
  { kode: "82", nama: "Maluku Utara" },
  { kode: "91", nama: "Papua Barat" },
  { kode: "94", nama: "Papua" },
];

// Helper function untuk mendapatkan karakteristik provinsi
const getProvinsiCharacteristics = (kodeProvinsi: string) => {
  const characteristics: Record<string, any> = {
    // Wilayah maju (urban, ekonomi kuat)
    "31": { apsModifier: 5, stuntingModifier: -8, tptModifier: 1.5, pdrb: "very_high", ahh: 73 },
    "34": { apsModifier: 4, stuntingModifier: -6, tptModifier: 0.5, pdrb: "high", ahh: 75 },
    "51": { apsModifier: 3, stuntingModifier: -5, tptModifier: -1, pdrb: "high", ahh: 74 },
    
    // Wilayah Jawa & Bali (menengah-tinggi)
    "32": { apsModifier: 2, stuntingModifier: -3, tptModifier: 1, pdrb: "high", ahh: 71 },
    "33": { apsModifier: 1, stuntingModifier: -2, tptModifier: 0.5, pdrb: "medium", ahh: 72 },
    "35": { apsModifier: 2, stuntingModifier: -2, tptModifier: 0.8, pdrb: "high", ahh: 71 },
    "36": { apsModifier: 2, stuntingModifier: -3, tptModifier: 1.2, pdrb: "high", ahh: 70 },
    
    // Sumatera (bervariasi)
    "12": { apsModifier: 0, stuntingModifier: 0, tptModifier: 0.5, pdrb: "medium", ahh: 70 },
    "13": { apsModifier: 1, stuntingModifier: -1, tptModifier: 0.3, pdrb: "medium", ahh: 70 },
    "14": { apsModifier: 0, stuntingModifier: 1, tptModifier: 0.4, pdrb: "high", ahh: 71 },
    "21": { apsModifier: 1, stuntingModifier: -2, tptModifier: 0.2, pdrb: "very_high", ahh: 72 },
    
    // Wilayah dengan tantangan (NTT, Papua, Maluku)
    "53": { apsModifier: -4, stuntingModifier: 8, tptModifier: -0.5, pdrb: "low", ahh: 66 },
    "94": { apsModifier: -5, stuntingModifier: 10, tptModifier: -1, pdrb: "low", ahh: 65 },
    "91": { apsModifier: -4, stuntingModifier: 9, tptModifier: -0.8, pdrb: "low", ahh: 66 },
    "81": { apsModifier: -3, stuntingModifier: 6, tptModifier: -0.3, pdrb: "low", ahh: 67 },
    "82": { apsModifier: -3, stuntingModifier: 5, tptModifier: -0.2, pdrb: "low", ahh: 67 },
  };
  
  // Default untuk provinsi yang tidak disebutkan
  return characteristics[kodeProvinsi] || { 
    apsModifier: 0, 
    stuntingModifier: 2, 
    tptModifier: 0, 
    pdrb: "medium", 
    ahh: 69 
  };
};

// Generate sample data rows berdasarkan schema dataset
const generateFullDataset = (dataset: Dataset, rowCount: number = 1000): Record<string, any>[] => {
  // Jika sudah ada sampleData yang cukup, gunakan itu
  if (dataset.sampleData && dataset.sampleData.length >= rowCount) {
    return dataset.sampleData.slice(0, rowCount);
  }

  // Generate data sintetis berdasarkan schema
  const data: Record<string, any>[] = [];
  
  // Untuk dataset BPS, kita akan generate data realistis
  if (dataset.id === "bps-edu-001") {
    // APS data - generate untuk beberapa tahun dan provinsi
    const kelompokUmur = ["7-12", "13-15", "16-18", "19-24"];
    const jenisKelamin = ["Laki-laki", "Perempuan", "Total"];
    
    for (let tahun = 2015; tahun <= 2025; tahun++) {
      for (const prov of PROVINSI_INDONESIA) {
        const provChar = getProvinsiCharacteristics(prov.kode);
        for (const umur of kelompokUmur) {
          for (const jk of jenisKelamin) {
            const baseAPS = umur === "7-12" ? 98 : umur === "13-15" ? 94 : umur === "16-18" ? 75 : 28;
            const yearIncrease = (tahun - 2015) * 0.15;
            const aps = Math.min(100, baseAPS + yearIncrease + provChar.apsModifier + (Math.random() * 2));
            
            data.push({
              tahun,
              kode_provinsi: prov.kode,
              nama_provinsi: prov.nama,
              kelompok_umur: umur,
              jenis_kelamin: jk,
              aps: Number(aps.toFixed(2)),
              jumlah_siswa: Math.floor(Math.random() * 500000) + 50000
            });
          }
        }
      }
    }
  } else if (dataset.id === "bps-health-002") {
    // Stunting data
    for (let tahun = 2015; tahun <= 2025; tahun++) {
      for (const prov of PROVINSI_INDONESIA) {
        const provChar = getProvinsiCharacteristics(prov.kode);
        const baseStunting = prov.kode === "53" ? 40 : prov.kode === "52" ? 35 : prov.kode === "31" ? 20 : 28;
        const yearDecrease = (tahun - 2015) * 0.7;
        
        data.push({
          tahun,
          kode_provinsi: prov.kode,
          nama_provinsi: prov.nama,
          stunting: Number((baseStunting - yearDecrease + provChar.stuntingModifier + (Math.random() * 2 - 1)).toFixed(1)),
          wasting: Number((8 - yearDecrease * 0.1 + (Math.random() * 1 - 0.5)).toFixed(1)),
          underweight: Number((15 - yearDecrease * 0.3 + (Math.random() * 1.5 - 0.75)).toFixed(1)),
          jumlah_sampel: Math.floor(Math.random() * 3000) + 1500
        });
      }
    }
  } else if (dataset.id === "bps-econ-002") {
    // TPT data
    const bulanList = ["Februari", "Agustus"];
    
    for (let tahun = 2015; tahun <= 2025; tahun++) {
      for (const bulan of bulanList) {
        for (const prov of PROVINSI_INDONESIA) {
          const provChar = getProvinsiCharacteristics(prov.kode);
          const baseTpt = prov.kode === "31" ? 6.5 : prov.kode === "51" ? 3.5 : 5.5;
          const covidSpike = (tahun === 2020 && bulan === "Agustus") ? 2 : 0;
          const trendDecrease = (tahun - 2015) * 0.08;
          const tpt = Number((baseTpt + covidSpike - trendDecrease + provChar.tptModifier + (Math.random() * 0.5)).toFixed(2));
          
          const angkatanKerja = Math.floor(Math.random() * 3000) + 2000;
          const pengangguran = Math.floor(angkatanKerja * tpt / 100);
          const bekerja = angkatanKerja - pengangguran;
          
          data.push({
            tahun,
            bulan,
            kode_provinsi: prov.kode,
            nama_provinsi: prov.nama,
            angkatan_kerja: angkatanKerja,
            bekerja,
            pengangguran,
            tpt,
            tpak: Number((67 + (Math.random() * 4 - 2)).toFixed(2))
          });
        }
      }
    }
  } else if (dataset.id === "bps-econ-004") {
    // Kemiskinan data
    const bulanList = ["Maret", "September"];
    const wilayahList = ["Perkotaan", "Perdesaan", "Total"];
    
    for (let tahun = 2015; tahun <= 2025; tahun++) {
      for (const bulan of bulanList) {
        for (const prov of PROVINSI_INDONESIA) {
          const provChar = getProvinsiCharacteristics(prov.kode);
          
          // Base poverty rate varies by province
          const basePovertyTotal = prov.kode === "31" ? 4.5 : 
                                   prov.kode === "51" ? 4.2 :
                                   prov.kode === "94" ? 27 :
                                   prov.kode === "53" ? 22 : 10.5;
          
          // Trend decrease over time
          const trendDecrease = (tahun - 2015) * 0.3;
          const covidSpike = (tahun === 2020 || tahun === 2021) ? 1.2 : 0;
          
          for (const wilayah of wilayahList) {
            let persentaseMiskin = 0;
            
            if (wilayah === "Perkotaan") {
              persentaseMiskin = basePovertyTotal * 0.6 - trendDecrease + covidSpike + (Math.random() * 0.5);
            } else if (wilayah === "Perdesaan") {
              persentaseMiskin = basePovertyTotal * 1.6 - trendDecrease + covidSpike + (Math.random() * 0.8);
            } else {
              persentaseMiskin = basePovertyTotal - trendDecrease + covidSpike + (Math.random() * 0.6);
            }
            
            // Ensure positive values
            persentaseMiskin = Math.max(1.0, persentaseMiskin);
            
            // Calculate dependent values
            const populasi = Math.floor(Math.random() * 8000000) + 2000000;
            const jumlahMiskin = Math.floor(populasi * persentaseMiskin / 100);
            const garisKemiskinan = Math.floor(400000 + (tahun - 2015) * 20000 + (Math.random() * 50000));
            
            data.push({
              tahun,
              bulan,
              kode_provinsi: prov.kode,
              nama_provinsi: prov.nama,
              wilayah,
              persentase_miskin: Number(persentaseMiskin.toFixed(2)),
              jumlah_penduduk_miskin: jumlahMiskin,
              garis_kemiskinan_perkapita: garisKemiskinan
            });
          }
        }
      }
    }
  } else {
    // Generic data generation berdasarkan sampleData
    const sampleCount = Math.min(dataset.sampleData.length, 5);
    for (let i = 0; i < Math.min(rowCount, 100); i++) {
      const sample = dataset.sampleData[i % sampleCount];
      data.push({ ...sample, row_id: i + 1 });
    }
  }
  
  return data.slice(0, rowCount);
};

// Export ke CSV
export const exportToCSV = (dataset: Dataset, rowCount: number = 1000) => {
  const data = generateFullDataset(dataset, rowCount);
  
  if (data.length === 0) {
    alert('No data available to export');
    return;
  }

  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataset.id}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export ke JSON
export const exportToJSON = (dataset: Dataset, rowCount: number = 1000) => {
  const data = generateFullDataset(dataset, rowCount);
  
  if (data.length === 0) {
    alert('No data available to export');
    return;
  }

  const jsonContent = JSON.stringify({
    metadata: {
      dataset_id: dataset.id,
      title: dataset.title,
      publisher: dataset.publisher,
      exported_at: new Date().toISOString(),
      total_records: data.length,
      license: dataset.license
    },
    schema: dataset.schema,
    data: data
  }, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataset.id}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export ke Excel
export const exportToExcel = (dataset: Dataset, rowCount: number = 1000) => {
  const data = generateFullDataset(dataset, rowCount);
  
  if (data.length === 0) {
    alert('No data available to export');
    return;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add data sheet
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Add metadata sheet
  const metadata = [
    ['Dataset ID', dataset.id],
    ['Title', dataset.title],
    ['Publisher', dataset.publisher],
    ['Description', dataset.description],
    ['Category', dataset.category],
    ['Published', dataset.published],
    ['Last Modified', dataset.lastModified],
    ['License', dataset.license],
    ['Geographic Coverage', dataset.geographicCoverage],
    ['Date Range', `${dataset.dateRange.start} to ${dataset.dateRange.end}`],
    ['Spatial Granularity', dataset.spatialGranularity],
    ['Temporal Granularity', dataset.temporalGranularity],
    ['Format', dataset.format],
    ['File Size', dataset.fileSize],
    ['Completeness', `${dataset.completeness}%`],
    ['Accuracy', dataset.accuracy],
    ['Timeliness', dataset.timeliness],
    ['Collection Method', dataset.collectionMethod],
    ['Sampling Method', dataset.samplingMethod],
    ['Contact', `${dataset.contact.name} (${dataset.contact.email})`],
    ['', ''],
    ['Exported At', new Date().toISOString()],
    ['Total Records', data.length.toString()]
  ];
  const wsMetadata = XLSX.utils.aoa_to_sheet(metadata);
  XLSX.utils.book_append_sheet(wb, wsMetadata, 'Metadata');
  
  // Add schema sheet
  const schemaData = dataset.schema.map(col => ({
    'Column Name': col.columnName,
    'Data Type': col.dataType,
    'Unit': col.unit || '',
    'Definition': col.definition
  }));
  const wsSchema = XLSX.utils.json_to_sheet(schemaData);
  XLSX.utils.book_append_sheet(wb, wsSchema, 'Schema');
  
  // Write file
  XLSX.writeFile(wb, `${dataset.id}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export metadata only
export const exportMetadata = (dataset: Dataset) => {
  const metadata = {
    basic_metadata: {
      id: dataset.id,
      title: dataset.title,
      description: dataset.description,
      publisher: dataset.publisher,
      published: dataset.published,
      lastModified: dataset.lastModified,
      license: dataset.license,
      language: dataset.language,
      keywords: dataset.keywords,
      category: dataset.category
    },
    spatio_temporal: {
      geographicCoverage: dataset.geographicCoverage,
      dateRange: dataset.dateRange,
      spatialGranularity: dataset.spatialGranularity,
      temporalGranularity: dataset.temporalGranularity
    },
    technical: {
      format: dataset.format,
      schema: dataset.schema,
      primaryKey: dataset.primaryKey,
      missingValueIndicator: dataset.missingValueIndicator
    },
    provenance: {
      collectionMethod: dataset.collectionMethod,
      samplingMethod: dataset.samplingMethod,
      tools: dataset.tools,
      contact: dataset.contact,
      lineage: dataset.lineage
    },
    quality: {
      completeness: dataset.completeness,
      accuracy: dataset.accuracy,
      timeliness: dataset.timeliness,
      consistencyRules: dataset.consistencyRules
    },
    access: {
      endpoint: dataset.endpoint,
      authentication: dataset.authentication,
      rateLimit: dataset.rateLimit,
      fileSize: dataset.fileSize,
      storageLocation: dataset.storageLocation
    },
    privacy: {
      sensitivityClass: dataset.sensitivityClass,
      anonymization: dataset.anonymization,
      legalConstraints: dataset.legalConstraints
    },
    usage: {
      useCases: dataset.useCases,
      recommendedTransforms: dataset.recommendedTransforms,
      estimatedCompute: dataset.estimatedCompute
    }
  };

  const jsonContent = JSON.stringify(metadata, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataset.id}_metadata.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};