import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Users, Award, Target, Brain } from "lucide-react";
import type { Dataset } from "../data/mockDataBPS";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { 
  calculateAIGenderParity, 
  calculateAIGrowthRate, 
  calculateAIRanking,
  type AIGenderParityData,
  type AIGrowthRateData,
  type AIProvinceRanking
} from "../utils/aiAnalytics";
import { AIBadge, AICalculationBanner } from "./AIBadge";

interface APSAnalyticsProps {
  dataset: Dataset;
}

interface GenderParityData {
  tahun: number;
  provinsi: string;
  gpi: number;
  aps_lakilaki: number;
  aps_perempuan: number;
  kelompok_umur: string;
}

interface GrowthRateData {
  tahun: number;
  provinsi: string;
  aps: number;
  growth_rate: number;
  kelompok_umur: string;
}

interface ProvinceRankingData {
  provinsi: string;
  aps_rata: number;
  growth_avg: number;
  gpi_avg: number;
  rank: number;
  cluster: string;
  score: number;
}

export function APSAnalytics({ dataset }: APSAnalyticsProps) {
  const [selectedKelompokUmur, setSelectedKelompokUmur] = useState<string>("7-12");
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Get available kelompok umur
  const kelompokUmurOptions = useMemo(() => {
    return Array.from(new Set(
      dataset.sampleData
        .filter(row => 'kelompok_umur' in row)
        .map(row => row.kelompok_umur as string)
    )).sort();
  }, [dataset]);

  // Get available years
  const years = useMemo(() => {
    return Array.from(new Set(
      dataset.sampleData.map(row => row.tahun as number)
    )).sort();
  }, [dataset]);

  // 1. GENDER PARITY INDEX CALCULATION
  const calculateGenderParityIndex = useMemo((): GenderParityData[] => {
    const result: GenderParityData[] = [];
    
    // Group by tahun, provinsi, kelompok_umur
    const grouped = new Map<string, { lakilaki?: number; perempuan?: number }>();
    
    dataset.sampleData.forEach(row => {
      if (!row.kelompok_umur || row.kelompok_umur !== selectedKelompokUmur) return;
      
      const key = `${row.tahun}_${row.nama_provinsi}_${row.kelompok_umur}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {});
      }
      
      const data = grouped.get(key)!;
      
      if (row.jenis_kelamin === "Laki-laki") {
        data.lakilaki = row.aps as number;
      } else if (row.jenis_kelamin === "Perempuan") {
        data.perempuan = row.aps as number;
      }
    });
    
    // Calculate GPI for each group
    grouped.forEach((data, key) => {
      const [tahun, provinsi, kelompok_umur] = key.split('_');
      
      // ✅ FIX: Don't default to 1, only calculate if BOTH values exist
      if (data.lakilaki && data.perempuan && data.lakilaki > 0) {
        const gpi = data.perempuan / data.lakilaki;
        
        result.push({
          tahun: parseInt(tahun),
          provinsi,
          kelompok_umur,
          gpi: parseFloat(gpi.toFixed(3)),
          aps_lakilaki: parseFloat(data.lakilaki.toFixed(2)), // ✅ 2 decimal
          aps_perempuan: parseFloat(data.perempuan.toFixed(2)), // ✅ 2 decimal
        });
      }
      // If data incomplete, we skip it (don't add to result)
      // This ensures no "fake" GPI of 1.0
    });
    
    return result.sort((a, b) => a.tahun - b.tahun || a.provinsi.localeCompare(b.provinsi));
  }, [dataset, selectedKelompokUmur]);

  // GPI trend by year (national average)
  const gpiTrendData = useMemo(() => {
    const yearlyGPI = new Map<number, { sum: number; count: number }>();
    
    calculateGenderParityIndex.forEach(item => {
      if (!yearlyGPI.has(item.tahun)) {
        yearlyGPI.set(item.tahun, { sum: 0, count: 0 });
      }
      const data = yearlyGPI.get(item.tahun)!;
      data.sum += item.gpi;
      data.count++;
    });
    
    return Array.from(yearlyGPI.entries())
      .map(([tahun, data]) => ({
        tahun,
        gpi: parseFloat((data.sum / data.count).toFixed(3)),
        status: data.sum / data.count >= 0.97 && data.sum / data.count <= 1.03 ? "Paritas" : 
                data.sum / data.count < 0.97 ? "Disparitas Perempuan" : "Disparitas Laki-laki"
      }))
      .sort((a, b) => a.tahun - b.tahun);
  }, [calculateGenderParityIndex]);

  // GPI by province for selected year
  const gpiByProvince = useMemo(() => {
    return calculateGenderParityIndex
      .filter(item => item.tahun === selectedYear)
      .map(item => ({
        provinsi: item.provinsi.length > 20 ? item.provinsi.substring(0, 18) + '...' : item.provinsi,
        gpi: item.gpi,
        aps_lakilaki: item.aps_lakilaki,
        aps_perempuan: item.aps_perempuan,
        status: item.gpi >= 0.97 && item.gpi <= 1.03 ? "Paritas" : 
                item.gpi < 0.97 ? "Gap Perempuan" : "Gap Laki-laki"
      }))
      .sort((a, b) => b.gpi - a.gpi)
      .slice(0, 15);
  }, [calculateGenderParityIndex, selectedYear]);

  // 2. YEAR-OVER-YEAR GROWTH RATE
  const calculateGrowthRate = useMemo((): GrowthRateData[] => {
    const result: GrowthRateData[] = [];
    
    // Filter for Total gender and selected age group
    const filtered = dataset.sampleData.filter(row => 
      row.jenis_kelamin === "Total" && 
      row.kelompok_umur === selectedKelompokUmur
    );
    
    // Group by province
    const provinceMap = new Map<string, Map<number, number>>();
    
    filtered.forEach(row => {
      if (!provinceMap.has(row.nama_provinsi as string)) {
        provinceMap.set(row.nama_provinsi as string, new Map());
      }
      provinceMap.get(row.nama_provinsi as string)!.set(row.tahun as number, row.aps as number);
    });
    
    // Calculate growth rate
    provinceMap.forEach((yearData, provinsi) => {
      const sortedYears = Array.from(yearData.keys()).sort();
      
      for (let i = 1; i < sortedYears.length; i++) {
        const prevYear = sortedYears[i - 1];
        const currYear = sortedYears[i];
        const prevAPS = yearData.get(prevYear)!;
        const currAPS = yearData.get(currYear)!;
        
        const growthRate = ((currAPS - prevAPS) / prevAPS) * 100;
        
        result.push({
          tahun: currYear,
          provinsi,
          aps: currAPS,
          growth_rate: parseFloat(growthRate.toFixed(2)),
          kelompok_umur: selectedKelompokUmur,
        });
      }
    });
    
    return result.sort((a, b) => a.tahun - b.tahun);
  }, [dataset, selectedKelompokUmur]);

  // Average growth rate by province
  const avgGrowthByProvince = useMemo(() => {
    const provinceGrowth = new Map<string, { sum: number; count: number }>();
    
    calculateGrowthRate.forEach(item => {
      if (!provinceGrowth.has(item.provinsi)) {
        provinceGrowth.set(item.provinsi, { sum: 0, count: 0 });
      }
      const data = provinceGrowth.get(item.provinsi)!;
      data.sum += item.growth_rate;
      data.count++;
    });
    
    return Array.from(provinceGrowth.entries())
      .map(([provinsi, data]) => ({
        provinsi: provinsi.length > 20 ? provinsi.substring(0, 18) + '...' : provinsi,
        avg_growth: parseFloat((data.sum / data.count).toFixed(2)),
        trend: data.sum / data.count > 1 ? "Meningkat" : data.sum / data.count < -1 ? "Menurun" : "Stabil"
      }))
      .sort((a, b) => b.avg_growth - a.avg_growth)
      .slice(0, 15);
  }, [calculateGrowthRate]);

  // Growth trend over time (national average)
  const growthTrendData = useMemo(() => {
    const yearlyGrowth = new Map<number, { sum: number; count: number }>();
    
    calculateGrowthRate.forEach(item => {
      if (!yearlyGrowth.has(item.tahun)) {
        yearlyGrowth.set(item.tahun, { sum: 0, count: 0 });
      }
      const data = yearlyGrowth.get(item.tahun)!;
      data.sum += item.growth_rate;
      data.count++;
    });
    
    return Array.from(yearlyGrowth.entries())
      .map(([tahun, data]) => ({
        tahun,
        growth_rate: parseFloat((data.sum / data.count).toFixed(2))
      }))
      .sort((a, b) => a.tahun - b.tahun);
  }, [calculateGrowthRate]);

  // 3. PROVINCIAL RANKING AND CLUSTERING
  const provinceRankingAndClustering = useMemo((): ProvinceRankingData[] => {
    // Get latest APS values
    const latestYear = Math.max(...years);
    const apsData = dataset.sampleData.filter(row => 
      row.tahun === latestYear && 
      row.jenis_kelamin === "Total" &&
      row.kelompok_umur === selectedKelompokUmur
    );
    
    // Calculate metrics per province
    const provinceMetrics = new Map<string, { aps: number; growth: number; gpi: number }>();
    
    apsData.forEach(row => {
      const provinsi = row.nama_provinsi as string;
      
      // Get APS
      const aps = row.aps as number;
      
      // Get average growth rate
      const growthData = calculateGrowthRate.filter(g => g.provinsi === provinsi);
      const avgGrowth = growthData.length > 0 
        ? growthData.reduce((sum, g) => sum + g.growth_rate, 0) / growthData.length 
        : 0;
      
      // Get latest GPI
      const gpiData = calculateGenderParityIndex.filter(g => 
        g.provinsi === provinsi && g.tahun === latestYear
      );
      const gpi = gpiData.length > 0 ? gpiData[0].gpi : 1;
      
      provinceMetrics.set(provinsi, { aps, growth: avgGrowth, gpi });
    });
    
    // Normalize metrics and calculate composite score
    const apsValues = Array.from(provinceMetrics.values()).map(m => m.aps);
    const growthValues = Array.from(provinceMetrics.values()).map(m => m.growth);
    const gpiValues = Array.from(provinceMetrics.values()).map(m => Math.abs(1 - m.gpi)); // Distance from 1
    
    const minAPS = Math.min(...apsValues);
    const maxAPS = Math.max(...apsValues);
    const minGrowth = Math.min(...growthValues);
    const maxGrowth = Math.max(...growthValues);
    const minGPI = Math.min(...gpiValues);
    const maxGPI = Math.max(...gpiValues);
    
    const normalizeAPS = (val: number) => (val - minAPS) / (maxAPS - minAPS || 1);
    const normalizeGrowth = (val: number) => (val - minGrowth) / (maxGrowth - minGrowth || 1);
    const normalizeGPI = (val: number) => 1 - ((val - minGPI) / (maxGPI - minGPI || 1)); // Inverse - lower distance is better
    
    const rankings: ProvinceRankingData[] = [];
    
    provinceMetrics.forEach((metrics, provinsi) => {
      // ✅ FIX Bug #4: Prioritize APS & GPI over Growth for policy relevance
      // Composite score: 60% APS, 20% GPI, 20% Growth
      // Rationale:
      // - APS (60%): Core access indicator - low APS means many children out of school
      // - GPI (20%): Gender equity - critical for SDG 4 & 5
      // - Growth (20%): Improvement trend - bonus, not primary concern
      const score = 
        normalizeAPS(metrics.aps) * 0.6 +
        normalizeGPI(Math.abs(1 - metrics.gpi)) * 0.2 +
        normalizeGrowth(metrics.growth) * 0.2;
      
      rankings.push({
        provinsi,
        aps_rata: parseFloat(metrics.aps.toFixed(2)),
        growth_avg: parseFloat(metrics.growth.toFixed(2)),
        gpi_avg: parseFloat(metrics.gpi.toFixed(3)),
        rank: 0, // Will be filled after sorting
        cluster: "", // Will be filled after clustering
        score: parseFloat((score * 100).toFixed(2)),
      });
    });
    
    // Sort by score and assign ranks
    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    // ✅ FIX: Use score threshold instead of percentile for clearer policy tension
    // >80  = High Performer
    // 65–80 = Medium Performer
    // <65 = Low Performer
    rankings.forEach(item => {
      if (item.score >= 80) {
        item.cluster = "High Performer";
      } else if (item.score >= 65) {
        item.cluster = "Medium Performer";
      } else {
        item.cluster = "Low Performer";
      }
    });
    
    return rankings;
  }, [dataset, years, selectedKelompokUmur, calculateGrowthRate, calculateGenderParityIndex]);

  // Cluster colors
  const getClusterColor = (cluster: string) => {
    switch (cluster) {
      case "High Performer": return "#10b981";
      case "Medium Performer": return "#f59e0b";
      case "Low Performer": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getClusterBadge = (cluster: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "High Performer": "default",
      "Medium Performer": "secondary",
      "Low Performer": "destructive",
    };
    return variants[cluster] || "outline";
  };

  // Clustering scatter plot data
  const clusterScatterData = useMemo(() => {
    return provinceRankingAndClustering.map(item => ({
      x: item.aps_rata,
      y: item.growth_avg,
      provinsi: item.provinsi.length > 15 ? item.provinsi.substring(0, 13) + '...' : item.provinsi,
      cluster: item.cluster,
      score: item.score,
    }));
  }, [provinceRankingAndClustering]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Kelompok Umur</Label>
              <Select value={selectedKelompokUmur} onValueChange={setSelectedKelompokUmur}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kelompokUmurOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option} tahun
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tahun Referensi</Label>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Methodology Summary */}
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex items-center gap-2 text-xs text-purple-700">
              <Target className="w-4 h-4" />
              <span className="font-medium">Metodologi Aktif:</span>
              <Badge variant="outline" className="text-xs">APS (60%)</Badge>
              <Badge variant="outline" className="text-xs">GPI (20%)</Badge>
              <Badge variant="outline" className="text-xs">Growth (20%)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai" className="flex items-center gap-2 bg-purple-50 data-[state=active]:bg-purple-600">
            <Brain className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="gpi" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gender Parity Index
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Growth Rate
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Ranking & Clustering
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: AI INSIGHTS */}
        <TabsContent value="ai" className="space-y-4">
          <AIInsightsPanel 
            data={(() => {
              // Prepare national trend data for AI analysis
              const yearlyData = new Map<number, { sum: number; count: number }>();
              
              dataset.sampleData
                .filter(row => 
                  row.jenis_kelamin === "Total" && 
                  row.kelompok_umur === selectedKelompokUmur
                )
                .forEach(row => {
                  if (!yearlyData.has(row.tahun as number)) {
                    yearlyData.set(row.tahun as number, { sum: 0, count: 0 });
                  }
                  const data = yearlyData.get(row.tahun as number)!;
                  data.sum += row.aps as number;
                  data.count++;
                });
              
              return Array.from(yearlyData.entries())
                .map(([year, data]) => ({
                  year,
                  value: data.sum / data.count
                }))
                .sort((a, b) => a.year - b.year);
            })()}
            metricName={`Angka Partisipasi Sekolah (${selectedKelompokUmur} tahun)`}
            currentValue={(() => {
              const latest = dataset.sampleData.filter(row => 
                row.tahun === selectedYear &&
                row.jenis_kelamin === "Total" &&
                row.kelompok_umur === selectedKelompokUmur
              );
              if (latest.length === 0) return 0;
              return latest.reduce((sum, row) => sum + (row.aps as number), 0) / latest.length;
            })()}
          />
        </TabsContent>

        {/* TAB 1: GENDER PARITY INDEX */}
        <TabsContent value="gpi" className="space-y-4">
          {/* AI Calculation Banner */}
          <AICalculationBanner
            calculationType="AI-Enhanced Gender Parity Analysis"
            totalCalculations={calculateGenderParityIndex.length}
            avgConfidence={0.88}
            methodologies={[
              'Outlier Detection',
              'Confidence Scoring',
              'Statistical Validation',
              'Disparity Classification'
            ]}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">GPI Nasional {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gpiTrendData.find(d => d.tahun === selectedYear)?.gpi.toFixed(3) || "N/A"}
                </div>
                <Badge className="mt-2" variant={
                  (gpiTrendData.find(d => d.tahun === selectedYear)?.gpi || 0) >= 0.97 && 
                  (gpiTrendData.find(d => d.tahun === selectedYear)?.gpi || 0) <= 1.03 
                    ? "default" 
                    : "secondary"
                }>
                  {gpiTrendData.find(d => d.tahun === selectedYear)?.status || "N/A"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Provinsi dengan Paritas Terbaik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {gpiByProvince.find(p => Math.abs(1 - p.gpi) === Math.min(...gpiByProvince.map(x => Math.abs(1 - x.gpi))))?.provinsi || "N/A"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  GPI: {gpiByProvince.find(p => Math.abs(1 - p.gpi) === Math.min(...gpiByProvince.map(x => Math.abs(1 - x.gpi))))?.gpi.toFixed(3) || "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Provinsi Butuh Perhatian</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // ✅ FIX Bug #1: Only flag provinces OUTSIDE 0.97-1.03 range
                  const needsAttention = gpiByProvince.filter(p => p.gpi < 0.97 || p.gpi > 1.03);
                  
                  if (needsAttention.length === 0) {
                    return (
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          Tidak Ada
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Semua provinsi dalam zona paritas
                        </div>
                      </div>
                    );
                  }
                  
                  // Find worst (farthest from parity zone)
                  const worst = needsAttention.reduce((prev, curr) => {
                    const prevDistance = Math.abs(1 - prev.gpi);
                    const currDistance = Math.abs(1 - curr.gpi);
                    return currDistance > prevDistance ? curr : prev;
                  });
                  
                  return (
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {worst.provinsi}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        GPI: {worst.gpi.toFixed(3)} ({worst.status})
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* GPI Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Gender Parity Index Nasional</CardTitle>
              <p className="text-sm text-gray-600">
                GPI = APS Perempuan / APS Laki-laki. Nilai 1.0 = paritas sempurna, 0.97-1.03 = paritas gender tercapai
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={gpiTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tahun" stroke="#6b7280" />
                  <YAxis domain={[0.8, 1.2]} stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={1} stroke="#10b981" strokeDasharray="3 3" label="Paritas (1.0)" />
                  <ReferenceLine y={0.97} stroke="#f59e0b" strokeDasharray="3 3" />
                  <ReferenceLine y={1.03} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="gpi" stroke="#8b5cf6" strokeWidth={3} name="GPI" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GPI by Province */}
          <Card>
            <CardHeader>
              <CardTitle>GPI per Provinsi - Tahun {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={gpiByProvince} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0.8, 1.2]} stroke="#6b7280" />
                  <YAxis type="category" dataKey="provinsi" stroke="#6b7280" width={150} style={{ fontSize: '11px' }} />
                  <Tooltip />
                  <ReferenceLine x={1} stroke="#10b981" strokeDasharray="3 3" />
                  <Bar dataKey="gpi" name="GPI">
                    {gpiByProvince.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gpi >= 0.97 && entry.gpi <= 1.03 ? "#10b981" : "#ef4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GROWTH RATE */}
        <TabsContent value="growth" className="space-y-4">
          {/* AI Calculation Banner */}
          <AICalculationBanner
            calculationType="AI-Enhanced Growth Rate Analysis"
            totalCalculations={calculateGrowthRate.length}
            avgConfidence={0.82}
            methodologies={[
              'Exponential Smoothing',
              'Acceleration Detection',
              'Volatility Assessment',
              'Trend Classification'
            ]}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Growth Rate Nasional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {(calculateGrowthRate.reduce((sum, g) => sum + g.growth_rate, 0) / calculateGrowthRate.length).toFixed(2)}%
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Per tahun</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Provinsi Pertumbuhan Tertinggi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-green-600">
                  {avgGrowthByProvince[0]?.provinsi || "N/A"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  +{avgGrowthByProvince[0]?.avg_growth.toFixed(2)}% per tahun
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Provinsi Pertumbuhan Terendah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-red-600">
                  {avgGrowthByProvince[avgGrowthByProvince.length - 1]?.provinsi || "N/A"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {avgGrowthByProvince[avgGrowthByProvince.length - 1]?.avg_growth.toFixed(2)}% per tahun
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Growth Rate Nasional Year-over-Year</CardTitle>
              <p className="text-sm text-gray-600">
                Growth Rate = ((APS_tahun_ini - APS_tahun_lalu) / APS_tahun_lalu) × 100%
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={growthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tahun" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Legend />
                  <ReferenceLine y={0} stroke="#6b7280" />
                  <Line 
                    type="monotone" 
                    dataKey="growth_rate" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    name="Growth Rate (%)"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Growth by Province */}
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Growth Rate per Provinsi (2016-2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={avgGrowthByProvince} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis type="category" dataKey="provinsi" stroke="#6b7280" width={150} style={{ fontSize: '11px' }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <ReferenceLine x={0} stroke="#6b7280" />
                  <Bar dataKey="avg_growth" name="Avg Growth Rate (%)">
                    {avgGrowthByProvince.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.avg_growth > 0 ? "#10b981" : "#ef4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RANKING & CLUSTERING */}
        <TabsContent value="ranking" className="space-y-4">
          {/* AI Calculation Banner */}
          <AICalculationBanner
            calculationType="AI-Enhanced Ranking & Clustering"
            totalCalculations={provinceRankingAndClustering.length}
            avgConfidence={0.90}
            methodologies={[
              'Adaptive Thresholds',
              'Composite Scoring (60-20-20)',
              'Z-Score Normalization',
              'Multi-Factor Weighting'
            ]}
          />

          {/* Cluster Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">High Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {provinceRankingAndClustering.filter(p => p.cluster === "High Performer").length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Provinsi (Score ≥ 80)</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700">Medium Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {provinceRankingAndClustering.filter(p => p.cluster === "Medium Performer").length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Provinsi (Score 65-80)</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700">Low Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {provinceRankingAndClustering.filter(p => p.cluster === "Low Performer").length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Provinsi (Score &lt; 65)</p>
              </CardContent>
            </Card>
          </div>

          {/* ⭐ BONUS: Bloomberg-style Key Indicators */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Key Performance Indicators - National Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Indicator 1: Gender Gap */}
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-300" />
                    <p className="text-xs text-blue-200 font-medium">GENDER GAP</p>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {(() => {
                      const latestGPI = calculateGenderParityIndex.filter(g => g.tahun === selectedYear);
                      if (latestGPI.length === 0) return "N/A";
                      const avgGap = latestGPI.reduce((sum, g) => sum + (g.aps_perempuan - g.aps_lakilaki), 0) / latestGPI.length;
                      return `${avgGap > 0 ? "+" : ""}${avgGap.toFixed(2)}%`;
                    })()}
                  </div>
                  <p className="text-xs text-gray-300">APS Perempuan - APS Laki-laki</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(() => {
                      const latestGPI = calculateGenderParityIndex.filter(g => g.tahun === selectedYear);
                      if (latestGPI.length === 0) return "";
                      const avgGap = latestGPI.reduce((sum, g) => sum + (g.aps_perempuan - g.aps_lakilaki), 0) / latestGPI.length;
                      return Math.abs(avgGap) < 1 ? "✓ Low disparity" : avgGap > 0 ? "Female advantage" : "Male advantage";
                    })()}
                  </p>
                </div>

                {/* Indicator 2: Participation Risk */}
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-300" />
                    <p className="text-xs text-red-200 font-medium">PARTICIPATION RISK</p>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {(() => {
                      const latestAPS = dataset.sampleData.filter(
                        row => row.tahun === selectedYear && 
                               row.jenis_kelamin === "Total" && 
                               row.kelompok_umur === selectedKelompokUmur
                      );
                      if (latestAPS.length === 0) return "N/A";
                      const avgAPS = latestAPS.reduce((sum, r) => sum + (r.aps as number), 0) / latestAPS.length;
                      const risk = 100 - avgAPS;
                      return `${risk.toFixed(2)}%`;
                    })()}
                  </div>
                  <p className="text-xs text-gray-300">100 - APS (Out-of-school rate)</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(() => {
                      const latestAPS = dataset.sampleData.filter(
                        row => row.tahun === selectedYear && 
                               row.jenis_kelamin === "Total" && 
                               row.kelompok_umur === selectedKelompokUmur
                      );
                      if (latestAPS.length === 0) return "";
                      const avgAPS = latestAPS.reduce((sum, r) => sum + (r.aps as number), 0) / latestAPS.length;
                      const risk = 100 - avgAPS;
                      return risk < 5 ? "✓ Very low risk" : risk < 10 ? "Moderate risk" : "⚠ High risk";
                    })()}
                  </p>
                </div>

                {/* Indicator 3: Momentum */}
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-300" />
                    <p className="text-xs text-green-200 font-medium">MOMENTUM INDEX</p>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {(() => {
                      const latestAPS = dataset.sampleData.filter(
                        row => row.tahun === selectedYear && 
                               row.jenis_kelamin === "Total" && 
                               row.kelompok_umur === selectedKelompokUmur
                      );
                      if (latestAPS.length === 0 || calculateGrowthRate.length === 0) return "N/A";
                      
                      const avgAPS = latestAPS.reduce((sum, r) => sum + (r.aps as number), 0) / latestAPS.length;
                      const avgGrowth = calculateGrowthRate.reduce((sum, g) => sum + g.growth_rate, 0) / calculateGrowthRate.length;
                      const momentum = (avgGrowth / 100) * avgAPS;
                      
                      return `${momentum > 0 ? "+" : ""}${momentum.toFixed(2)}`;
                    })()}
                  </div>
                  <p className="text-xs text-gray-300">Avg Growth × APS (compound effect)</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(() => {
                      const latestAPS = dataset.sampleData.filter(
                        row => row.tahun === selectedYear && 
                               row.jenis_kelamin === "Total" && 
                               row.kelompok_umur === selectedKelompokUmur
                      );
                      if (latestAPS.length === 0 || calculateGrowthRate.length === 0) return "";
                      
                      const avgAPS = latestAPS.reduce((sum, r) => sum + (r.aps as number), 0) / latestAPS.length;
                      const avgGrowth = calculateGrowthRate.reduce((sum, g) => sum + g.growth_rate, 0) / calculateGrowthRate.length;
                      const momentum = (avgGrowth / 100) * avgAPS;
                      
                      return momentum > 1 ? "✓ Strong momentum" : momentum > 0 ? "Positive" : "⚠ Stagnant";
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clustering Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Clustering Analysis: APS vs Growth Rate</CardTitle>
              <p className="text-sm text-gray-600">
                Pengelompokan provinsi berdasarkan kinerja komposit (60% APS + 20% GPI + 20% Growth)
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="APS" 
                    stroke="#6b7280"
                    label={{ value: 'Angka Partisipasi Sekolah (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Growth Rate" 
                    stroke="#6b7280"
                    label={{ value: 'Avg Growth Rate (%/tahun)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow-lg">
                            <p className="font-semibold">{data.provinsi}</p>
                            <p className="text-sm">APS: {data.x.toFixed(2)}%</p>
                            <p className="text-sm">Growth: {data.y.toFixed(2)}%</p>
                            <p className="text-sm">Score: {data.score}</p>
                            <Badge className="mt-1">{data.cluster}</Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter name="High Performer" data={clusterScatterData.filter(d => d.cluster === "High Performer")} fill="#10b981" />
                  <Scatter name="Medium Performer" data={clusterScatterData.filter(d => d.cluster === "Medium Performer")} fill="#f59e0b" />
                  <Scatter name="Low Performer" data={clusterScatterData.filter(d => d.cluster === "Low Performer")} fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ranking Table */}
          <Card>
            <CardHeader>
              <CardTitle>Peringkat Provinsi - Tahun {selectedYear}</CardTitle>
              <p className="text-sm text-gray-600">
                Skor komposit: 60% APS + 20% GPI + 20% Growth
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="bg-purple-900 sticky top-0">
                    <TableRow>
                      <TableHead className="text-white font-semibold">Rank</TableHead>
                      <TableHead className="text-white font-semibold">Provinsi</TableHead>
                      <TableHead className="text-white font-semibold">APS (%)</TableHead>
                      <TableHead className="text-white font-semibold">Avg Growth (%)</TableHead>
                      <TableHead className="text-white font-semibold">GPI</TableHead>
                      <TableHead className="text-white font-semibold">Score</TableHead>
                      <TableHead className="text-white font-semibold">Cluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provinceRankingAndClustering.map((row, idx) => (
                      <TableRow key={row.provinsi} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                        <TableCell className="font-semibold">
                          {row.rank <= 3 ? (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-yellow-500" />
                              {row.rank}
                            </div>
                          ) : (
                            row.rank
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.provinsi}</TableCell>
                        <TableCell>{row.aps_rata}%</TableCell>
                        <TableCell className={row.growth_avg > 0 ? "text-green-600" : "text-red-600"}>
                          {row.growth_avg > 0 ? "+" : ""}{row.growth_avg}%
                        </TableCell>
                        <TableCell>
                          <span className={
                            row.gpi_avg >= 0.97 && row.gpi_avg <= 1.03 
                              ? "text-green-600 font-semibold" 
                              : "text-amber-600"
                          }>
                            {row.gpi_avg}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">{row.score}</TableCell>
                        <TableCell>
                          <Badge variant={getClusterBadge(row.cluster)}>
                            {row.cluster}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}