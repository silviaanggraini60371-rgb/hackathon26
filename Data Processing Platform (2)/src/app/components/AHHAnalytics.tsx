import { useMemo, useState } from "react";
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
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TrendingUp, Users, AlertTriangle, Brain } from "lucide-react";
import type { Dataset } from "../data/mockDataBPS";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { AIBadge, AICalculationBanner } from "./AIBadge";

interface AHHAnalyticsProps {
  dataset: Dataset;
}

export function AHHAnalytics({ dataset }: AHHAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // AI-POWERED TRANSFORMATION 1: Life Expectancy Growth Trend
  const aiGrowthTrend = useMemo(() => {
    const provinceData = dataset.sampleData.filter(
      row => row.nama_provinsi && row.tahun && row.jenis_kelamin === "Total"
    );

    // Group by province
    const provinceMap = new Map<string, any[]>();
    provinceData.forEach(row => {
      const prov = row.nama_provinsi as string;
      if (!provinceMap.has(prov)) {
        provinceMap.set(prov, []);
      }
      provinceMap.get(prov)!.push({
        tahun: row.tahun as number,
        ahh: row.ahh as number
      });
    });

    const results: any[] = [];
    provinceMap.forEach((data, provinsi) => {
      // Sort by year
      data.sort((a, b) => a.tahun - b.tahun);
      
      // Calculate linear regression trend
      if (data.length >= 2) {
        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + d.tahun, 0);
        const sumY = data.reduce((sum, d) => sum + d.ahh, 0);
        const sumXY = data.reduce((sum, d) => sum + d.tahun * d.ahh, 0);
        const sumX2 = data.reduce((sum, d) => sum + d.tahun * d.tahun, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const currentAHH = data[data.length - 1].ahh;
        
        results.push({
          provinsi,
          trend: slope,
          currentAHH,
          performance: slope >= 0.3 ? "Signifikan" : slope >= 0.1 ? "Moderat" : "Stagnan",
          startYear: data[0].tahun,
          endYear: data[data.length - 1].tahun
        });
      }
    });

    return results.sort((a, b) => b.trend - a.trend);
  }, [dataset]);

  // AI-POWERED TRANSFORMATION 2: Gender Longevity Gap
  const aiGenderGap = useMemo(() => {
    const yearData = dataset.sampleData.filter(
      row => row.nama_provinsi && row.tahun === selectedYear && row.jenis_kelamin !== "Total"
    );

    // Group by province
    const provinceMap = new Map<string, { male?: number; female?: number }>();
    yearData.forEach(row => {
      const prov = row.nama_provinsi as string;
      if (!provinceMap.has(prov)) {
        provinceMap.set(prov, {});
      }
      const data = provinceMap.get(prov)!;
      if (row.jenis_kelamin === "Laki-laki") {
        data.male = row.ahh as number;
      } else if (row.jenis_kelamin === "Perempuan") {
        data.female = row.ahh as number;
      }
    });

    const results: any[] = [];
    provinceMap.forEach((data, provinsi) => {
      if (data.male && data.female) {
        const gap = data.female - data.male;
        results.push({
          provinsi,
          maleAHH: data.male,
          femaleAHH: data.female,
          gap,
          status: (gap >= 3 && gap <= 5) ? "Normal" : (gap >= 2 && gap <= 6) ? "Minor Deviation" : "Anomali"
        });
      }
    });

    return results.sort((a, b) => Math.abs(b.gap - 4) - Math.abs(a.gap - 4)); // Sort by deviation from ideal 4
  }, [dataset, selectedYear]);

  // AI-POWERED TRANSFORMATION 3: Regional Disparity
  const aiRegionalDisparity = useMemo(() => {
    const years = Array.from(new Set(
      dataset.sampleData
        .filter(row => row.tahun && row.jenis_kelamin === "Total")
        .map(row => row.tahun as number)
    )).sort();

    const disparityByYear: any[] = years.map(year => {
      const yearData = dataset.sampleData.filter(
        row => row.tahun === year && row.jenis_kelamin === "Total" && row.nama_provinsi
      );

      const values = yearData.map(row => row.ahh as number);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      );
      const cv = (stdDev / mean) * 100;

      return {
        tahun: year,
        cv,
        mean,
        stdDev,
        min: Math.min(...values),
        max: Math.max(...values),
        range: Math.max(...values) - Math.min(...values),
        level: cv < 5 ? "Rendah" : cv < 10 ? "Sedang" : "Tinggi"
      };
    });

    // Current year provincial disparity
    const currentYear = Math.max(...years);
    const currentData = dataset.sampleData.filter(
      row => row.tahun === currentYear && row.jenis_kelamin === "Total" && row.nama_provinsi
    );

    const currentMean = currentData.reduce((sum, row) => sum + (row.ahh as number), 0) / currentData.length;

    const provincialDisparity = currentData.map(row => ({
      provinsi: row.nama_provinsi as string,
      ahh: row.ahh as number,
      deviationFromMean: (row.ahh as number) - currentMean,
      relativeDev: (((row.ahh as number) - currentMean) / currentMean) * 100
    })).sort((a, b) => b.ahh - a.ahh);

    return {
      byYear: disparityByYear,
      byProvince: provincialDisparity,
      currentCV: disparityByYear[disparityByYear.length - 1]?.cv || 0
    };
  }, [dataset]);

  // COMPOSITE HEALTH DEVELOPMENT INDEX
  const aiHealthIndex = useMemo(() => {
    const results: any[] = [];
    
    aiGrowthTrend.forEach(trend => {
      const gap = aiGenderGap.find(g => g.provinsi === trend.provinsi);
      
      if (gap) {
        // Normalize Current AHH Level (0-100)
        const maxAHH = Math.max(...aiGrowthTrend.map(t => t.currentAHH));
        const minAHH = Math.min(...aiGrowthTrend.map(t => t.currentAHH));
        const normAHH = ((trend.currentAHH - minAHH) / (maxAHH - minAHH)) * 100;
        
        // Normalize Trend (0-100)
        const maxTrend = Math.max(...aiGrowthTrend.map(t => t.trend));
        const minTrend = Math.min(...aiGrowthTrend.map(t => t.trend));
        const normTrend = ((trend.trend - minTrend) / (maxTrend - minTrend)) * 100;
        
        // Gender Balance Score (0-100) - ideal gap is 4 years
        const genderBalance = (1 - Math.abs(gap.gap - 4) / 4) * 100;
        const normGender = Math.max(0, Math.min(100, genderBalance));
        
        // Composite: 50% AHH Level, 30% Trend, 20% Gender Balance
        const compositeScore = (0.50 * normAHH) + (0.30 * normTrend) + (0.20 * normGender);
        
        results.push({
          provinsi: trend.provinsi,
          compositeScore: parseFloat(compositeScore.toFixed(2)),
          currentAHH: trend.currentAHH,
          trend: trend.trend,
          genderGap: gap.gap,
          cluster: compositeScore >= 67 ? "High Health" : compositeScore >= 33 ? "Medium Health" : "Low Health"
        });
      }
    });

    return results.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [aiGrowthTrend, aiGenderGap]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    dataset.sampleData.forEach(row => {
      if (row.tahun) yearSet.add(row.tahun as number);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [dataset]);

  const getTrendColor = (trend: number) => {
    if (trend >= 0.3) return "#10b981"; // green
    if (trend >= 0.1) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getClusterColor = (cluster: string) => {
    if (cluster === "High Health") return "#10b981";
    if (cluster === "Medium Health") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="space-y-6">
      <AICalculationBanner calculationType={""} totalCalculations={0} avgConfidence={0} methodologies={[]} />

      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trend" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Growth Trend
          </TabsTrigger>
          <TabsTrigger value="gender" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gender Gap
          </TabsTrigger>
          <TabsTrigger value="disparity" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Disparity
          </TabsTrigger>
          <TabsTrigger value="composite" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Health Index
          </TabsTrigger>
        </TabsList>

        {/* TRANSFORMATION 1: LIFE EXPECTANCY GROWTH TREND */}
        <TabsContent value="trend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Life Expectancy Growth Trend Analysis
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel
                title="AI-Powered Trend Calculation"
                insights={[
                  `Trend = Δ AHH per tahun (linear regression slope)`,
                  `${aiGrowthTrend.filter(r => r.performance === "Signifikan").length} provinsi dengan perbaikan signifikan (>0.3 tahun/tahun)`,
                  `${aiGrowthTrend.filter(r => r.performance === "Moderat").length} provinsi dengan perbaikan moderat (0.1-0.3)`,
                  `Tren tertinggi: ${aiGrowthTrend[0]?.provinsi} (+${aiGrowthTrend[0]?.trend.toFixed(3)} tahun/tahun)`,
                  `Current AHH tertinggi: ${aiGrowthTrend.find(r => r.currentAHH === Math.max(...aiGrowthTrend.map(t => t.currentAHH)))?.provinsi}`
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiGrowthTrend.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="provinsi" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis label={{ value: 'Trend (tahun/tahun)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="trend" name="Growth Trend">
                      {aiGrowthTrend.slice(0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getTrendColor(entry.trend)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Top 10 Provinsi by Growth Trend</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">Growth Trend</TableHead>
                      <TableHead className="text-right">Current AHH</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiGrowthTrend.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono">+{row.trend.toFixed(3)} tahun/tahun</TableCell>
                        <TableCell className="text-right font-mono">{row.currentAHH.toFixed(2)} tahun</TableCell>
                        <TableCell>
                          <Badge variant={row.performance === "Signifikan" ? "default" : row.performance === "Moderat" ? "secondary" : "destructive"}>
                            {row.performance}
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

        {/* TRANSFORMATION 2: GENDER LONGEVITY GAP */}
        <TabsContent value="gender" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Gender Longevity Gap Analysis
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <label className="text-sm font-medium">Tahun:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border rounded px-3 py-1 text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <AIInsightsPanel
                title="AI-Powered Gender Gap Calculation"
                insights={[
                  `Gap = AHH Perempuan - AHH Laki-laki`,
                  `${aiGenderGap.filter(r => r.status === "Normal").length} provinsi dengan gap normal (3-5 tahun)`,
                  `${aiGenderGap.filter(r => r.status === "Minor Deviation").length} provinsi dengan deviasi minor`,
                  `${aiGenderGap.filter(r => r.status === "Anomali").length} provinsi dengan anomali kesehatan gender`,
                  `Gap ideal biologis: 3-5 tahun (perempuan hidup lebih lama)`
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiGenderGap.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="provinsi" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis label={{ value: 'AHH (tahun)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="maleAHH" name="Laki-laki" fill="#3b82f6" />
                    <Bar dataKey="femaleAHH" name="Perempuan" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Gender Gap by Province ({selectedYear})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">Laki-laki</TableHead>
                      <TableHead className="text-right">Perempuan</TableHead>
                      <TableHead className="text-right">Gap</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiGenderGap.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono">{row.maleAHH.toFixed(2)} tahun</TableCell>
                        <TableCell className="text-right font-mono">{row.femaleAHH.toFixed(2)} tahun</TableCell>
                        <TableCell className="text-right font-mono font-bold">{row.gap.toFixed(2)} tahun</TableCell>
                        <TableCell>
                          <Badge variant={row.status === "Normal" ? "default" : row.status === "Minor Deviation" ? "secondary" : "destructive"}>
                            {row.status}
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

        {/* TRANSFORMATION 3: REGIONAL DISPARITY */}
        <TabsContent value="disparity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Regional Health Disparity Index
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel
                title="AI-Powered Disparity Analysis"
                insights={[
                  `Disparity = (Coefficient of Variation) = (StdDev / Mean) × 100`,
                  `Current CV: ${aiRegionalDisparity.currentCV.toFixed(2)}% (${aiRegionalDisparity.currentCV < 5 ? "Rendah" : aiRegionalDisparity.currentCV < 10 ? "Sedang" : "Tinggi"})`,
                  `Range AHH: ${aiRegionalDisparity.byYear[aiRegionalDisparity.byYear.length - 1]?.min.toFixed(2)} - ${aiRegionalDisparity.byYear[aiRegionalDisparity.byYear.length - 1]?.max.toFixed(2)} tahun`,
                  `Gap terbesar: ${aiRegionalDisparity.byYear[aiRegionalDisparity.byYear.length - 1]?.range.toFixed(2)} tahun`,
                  aiRegionalDisparity.currentCV < 5 ? "Excellent: Disparitas kesehatan minimal antar provinsi" : "Needs Improvement: Masih ada gap kesehatan signifikan"
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Disparity Trend Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={aiRegionalDisparity.byYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" />
                    <YAxis label={{ value: 'CV (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cv" name="Coefficient of Variation" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Provincial Deviation from National Mean</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiRegionalDisparity.byProvince.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="provinsi" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis label={{ value: 'Deviation (tahun)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="deviationFromMean" name="Deviation from Mean">
                      {aiRegionalDisparity.byProvince.slice(0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.deviationFromMean >= 0 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">AHH</TableHead>
                      <TableHead className="text-right">Deviation</TableHead>
                      <TableHead className="text-right">Relative (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiRegionalDisparity.byProvince.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono">{row.ahh.toFixed(2)} tahun</TableCell>
                        <TableCell className="text-right font-mono">
                          {row.deviationFromMean >= 0 ? "+" : ""}{row.deviationFromMean.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.relativeDev >= 0 ? "+" : ""}{row.relativeDev.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPOSITE HEALTH DEVELOPMENT INDEX */}
        <TabsContent value="composite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-600" />
                Health Development Composite Index
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel
                title="AI-Powered Composite Scoring"
                insights={[
                  `Score = (0.50 × Norm_AHH) + (0.30 × Norm_Trend) + (0.20 × Gender_Balance)`,
                  `${aiHealthIndex.filter(r => r.cluster === "High Health").length} provinsi high health (score ≥ 67)`,
                  `${aiHealthIndex.filter(r => r.cluster === "Medium Health").length} provinsi medium health (33-66)`,
                  `${aiHealthIndex.filter(r => r.cluster === "Low Health").length} provinsi perlu peningkatan (score < 33)`,
                  `Top performer: ${aiHealthIndex[0]?.provinsi} (score: ${aiHealthIndex[0]?.compositeScore.toFixed(2)})`
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiHealthIndex.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="provinsi" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis label={{ value: 'Composite Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="compositeScore" name="Health Development Index">
                      {aiHealthIndex.slice(0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getClusterColor(entry.cluster)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Health Development Ranking</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">Composite Score</TableHead>
                      <TableHead className="text-right">Current AHH</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                      <TableHead className="text-right">Gender Gap</TableHead>
                      <TableHead>Cluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiHealthIndex.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono font-bold">{row.compositeScore.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.currentAHH.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">+{row.trend.toFixed(3)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.genderGap.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              row.cluster === "High Health" ? "default" : 
                              row.cluster === "Medium Health" ? "secondary" : 
                              "destructive"
                            }
                          >
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
