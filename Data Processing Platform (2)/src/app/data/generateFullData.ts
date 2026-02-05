// Generate full realistic BPS data for all years and provinces

export const provinces = [
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

// Helper untuk generate random value dengan trend
function generateTrendValue(
  baseValue: number,
  year: number,
  provinsiIndex: number,
  config: {
    yearlyGrowth?: number;
    provinsiVariation?: number;
    randomness?: number;
  } = {}
): number {
  const {
    yearlyGrowth = 0.5,
    provinsiVariation = 5,
    randomness = 0.3,
  } = config;

  const yearDiff = year - 2015;
  const trendValue = baseValue + yearDiff * yearlyGrowth;
  const provinsiAdjustment = (provinsiIndex - 17) * (provinsiVariation / 17);
  const randomAdjustment = (Math.random() - 0.5) * randomness;

  return parseFloat((trendValue + provinsiAdjustment + randomAdjustment).toFixed(2));
}

// Generate data APS (Angka Partisipasi Sekolah)
export function generateAPSData() {
  const data: any[] = [];
  const kelompokUmur = ["7-12", "13-15", "16-18", "19-24"];
  const jenisKelamin = ["Laki-laki", "Perempuan", "Total"];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i); // 2015-2025

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      kelompokUmur.forEach((umur) => {
        jenisKelamin.forEach((kelamin) => {
          // Base APS values berbeda untuk tiap kelompok umur
          let baseAPS = 0;
          let baseJumlah = 0;

          if (umur === "7-12") {
            baseAPS = 98.5;
            baseJumlah = 500000 + provIndex * 50000;
          } else if (umur === "13-15") {
            baseAPS = 96.0;
            baseJumlah = 250000 + provIndex * 25000;
          } else if (umur === "16-18") {
            baseAPS = 85.0;
            baseJumlah = 200000 + provIndex * 20000;
          } else {
            baseAPS = 35.0;
            baseJumlah = 150000 + provIndex * 15000;
          }

          const aps = Math.min(
            100,
            generateTrendValue(baseAPS, tahun, provIndex, {
              yearlyGrowth: 0.15,
              provinsiVariation: 5,
              randomness: 0.5,
            })
          );

          const jumlah_siswa = Math.floor(
            generateTrendValue(baseJumlah, tahun, provIndex, {
              yearlyGrowth: 1000,
              provinsiVariation: 50000,
              randomness: 10000,
            })
          );

          data.push({
            tahun,
            kode_provinsi: prov.kode,
            nama_provinsi: prov.nama,
            kelompok_umur: umur,
            jenis_kelamin: kelamin,
            aps: parseFloat(aps.toFixed(2)),
            jumlah_siswa,
          });
        });
      });
    });
  });

  return data;
}

// Generate data RLS/HLS
export function generateRLSHLSData() {
  const data: any[] = [];
  const jenisKelamin = ["Laki-laki", "Perempuan", "Total"];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      jenisKelamin.forEach((kelamin) => {
        const baseRLS = 8.0;
        const baseHLS = 12.5;

        const rls = generateTrendValue(baseRLS, tahun, provIndex, {
          yearlyGrowth: 0.12,
          provinsiVariation: 2.5,
          randomness: 0.1,
        });

        const hls = generateTrendValue(baseHLS, tahun, provIndex, {
          yearlyGrowth: 0.15,
          provinsiVariation: 2.0,
          randomness: 0.1,
        });

        data.push({
          tahun,
          kode_wilayah: prov.kode,
          nama_wilayah: prov.nama,
          rls: parseFloat(rls.toFixed(2)),
          hls: parseFloat(Math.max(rls, hls).toFixed(2)), // HLS harus >= RLS
          jenis_kelamin: kelamin,
        });
      });
    });
  });

  return data;
}

// Generate data AHH (Angka Harapan Hidup)
export function generateAHHData() {
  const data: any[] = [];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      const baseAHH = 68.0;

      const ahh_total = generateTrendValue(baseAHH, tahun, provIndex, {
        yearlyGrowth: 0.25,
        provinsiVariation: 3.5,
        randomness: 0.2,
      });

      const ahh_lakilaki = ahh_total - 2.5 - Math.random() * 0.5;
      const ahh_perempuan = ahh_total + 2.5 + Math.random() * 0.5;

      data.push({
        tahun,
        kode_provinsi: prov.kode,
        nama_provinsi: prov.nama,
        ahh_total: parseFloat(ahh_total.toFixed(2)),
        ahh_lakilaki: parseFloat(ahh_lakilaki.toFixed(2)),
        ahh_perempuan: parseFloat(ahh_perempuan.toFixed(2)),
        metode: tahun >= 2020 ? "Direct" : "Indirect",
      });
    });
  });

  return data;
}

// Generate data Stunting
export function generateStuntingData() {
  const data: any[] = [];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      const baseStunting = 35.0;
      const baseWasting = 12.0;
      const baseUnderweight = 20.0;

      const stunting = Math.max(
        5,
        generateTrendValue(baseStunting, tahun, provIndex, {
          yearlyGrowth: -1.2, // Menurun setiap tahun
          provinsiVariation: 8,
          randomness: 0.8,
        })
      );

      const wasting = Math.max(
        3,
        generateTrendValue(baseWasting, tahun, provIndex, {
          yearlyGrowth: -0.4,
          provinsiVariation: 3,
          randomness: 0.5,
        })
      );

      const underweight = Math.max(
        5,
        generateTrendValue(baseUnderweight, tahun, provIndex, {
          yearlyGrowth: -0.8,
          provinsiVariation: 5,
          randomness: 0.6,
        })
      );

      const jumlah_sampel = Math.floor(1500 + provIndex * 50 + Math.random() * 500);

      data.push({
        tahun,
        kode_provinsi: prov.kode,
        nama_provinsi: prov.nama,
        stunting: parseFloat(stunting.toFixed(2)),
        wasting: parseFloat(wasting.toFixed(2)),
        underweight: parseFloat(underweight.toFixed(2)),
        jumlah_sampel,
      });
    });
  });

  return data;
}

// Generate data PDRB
export function generatePDRBData() {
  const data: any[] = [];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      const basePDRB = 50000000; // 50 juta

      const pdrb_adhb = generateTrendValue(basePDRB, tahun, provIndex, {
        yearlyGrowth: 2500000,
        provinsiVariation: 30000000,
        randomness: 1000000,
      });

      const pdrb_adhk = pdrb_adhb * 0.92;
      const pertumbuhan = 4.5 + (Math.random() - 0.5) * 2;

      data.push({
        tahun,
        kode_provinsi: prov.kode,
        nama_provinsi: prov.nama,
        pdrb_adhb: parseFloat(pdrb_adhb.toFixed(0)),
        pdrb_adhk: parseFloat(pdrb_adhk.toFixed(0)),
        pertumbuhan_ekonomi: parseFloat(pertumbuhan.toFixed(2)),
        per_kapita_adhb: parseFloat((pdrb_adhb / (5000000 + provIndex * 500000)).toFixed(0)),
      });
    });
  });

  return data;
}

// Generate data Kemiskinan
export function generateKemiskinanData() {
  const data: any[] = [];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);
  const wilayahTypes = ["Perkotaan", "Perdesaan", "Total"];

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      const basePersen = 12.0;

      wilayahTypes.forEach((wilayah) => {
        // Rural areas have higher poverty
        const wilayahMultiplier = wilayah === "Perdesaan" ? 1.5 : wilayah === "Perkotaan" ? 0.6 : 1.0;

        const persentase_miskin = Math.max(
          3,
          generateTrendValue(basePersen * wilayahMultiplier, tahun, provIndex, {
            yearlyGrowth: -0.35,
            provinsiVariation: 5,
            randomness: 0.5,
          })
        );

        const jumlah_penduduk = 5000000 + provIndex * 500000;
        const jumlah_miskin = Math.floor((persentase_miskin / 100) * jumlah_penduduk);
        const garis_kemiskinan = 350000 + tahun * 15000 + provIndex * 5000;

        data.push({
          tahun,
          kode_provinsi: prov.kode,
          nama_provinsi: prov.nama,
          wilayah: wilayah,
          persentase_miskin: parseFloat(persentase_miskin.toFixed(2)),
          jumlah_penduduk_miskin: jumlah_miskin,
          garis_kemiskinan_perkapita: garis_kemiskinan,
        });
      });
    });
  });

  return data;
}

// Generate data TPT (Tingkat Pengangguran Terbuka)
export function generateTPTData() {
  const data: any[] = [];
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);
  const jenisKelamin = ["Laki-laki", "Perempuan", "Total"];

  years.forEach((tahun) => {
    provinces.forEach((prov, provIndex) => {
      jenisKelamin.forEach((kelamin) => {
        const baseTPT = 6.5;

        const tpt = Math.max(
          2,
          generateTrendValue(baseTPT, tahun, provIndex, {
            yearlyGrowth: -0.15,
            provinsiVariation: 2.5,
            randomness: 0.3,
          })
        );

        const angkatan_kerja = 2000000 + provIndex * 100000;
        const pengangguran = Math.floor((tpt / 100) * angkatan_kerja);

        data.push({
          tahun,
          kode_provinsi: prov.kode,
          nama_provinsi: prov.nama,
          jenis_kelamin: kelamin,
          tpt: parseFloat(tpt.toFixed(2)),
          jumlah_pengangguran: pengangguran,
          angkatan_kerja,
        });
      });
    });
  });

  return data;
}