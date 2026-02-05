import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import type { Dataset } from "../data/mockDataBPS";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

interface RLSHLSAnalyticsProps {
  dataset: Dataset;
}

interface ProvinceMetrics {
  provinsi: string;
  rls_male: number;
  rls_female: number;
  hls_total: number;
  education_gap: number;
  gender_gap: number;
  score: number;
  cluster: string;
}

export function RLSHLSAnalytics({ dataset }: RLSHLSAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Get available years
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    dataset.sampleData.forEach((row: any) => {
      yearSet.add(row.tahun);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [dataset.sampleData]);

  // Calculate province metrics
  const provinceMetrics = useMemo((): ProvinceMetrics[] => {
    const metricsByProvince = new Map<string, ProvinceMetrics>();

    // Filter data for selected year
    const yearData = dataset.sampleData.filter((row: any) => row.tahun === selectedYear);

    yearData.forEach((row: any) => {
      const key = row.nama_wilayah;

      if (!metricsByProvince.has(key)) {
        metricsByProvince.set(key, {
          provinsi: row.nama_wilayah,
          rls_male: 0,
          rls_female: 0,
          hls_total: 0,
          education_gap: 0,
          gender_gap: 0,
          score: 0,
          cluster: ""
        });
      }

      const metrics = metricsByProvince.get(key)!;

      if (row.jenis_kelamin === "Laki-laki") {
        metrics.rls_male = row.rls;
      } else if (row.jenis_kelamin === "Perempuan") {
        metrics.rls_female = row.rls;
      } else if (row.jenis_kelamin === "Total") {
        metrics.hls_total = row.hls;
      }
    });

    // Calculate derived metrics
    const metricsArray: ProvinceMetrics[] = [];
    metricsByProvince.forEach(m => {
      m.education_gap = m.hls_total - (m.rls_male + m.rls_female) / 2;
      m.gender_gap = m.rls_male - m.rls_female;
      metricsArray.push(m);
    });

    // Normalize and calculate composite score
    const rlsValues = metricsArray.map(m => (m.rls_male + m.rls_female) / 2);
    const hlsValues = metricsArray.map(m => m.hls_total);
    const genderGapAbs = metricsArray.map(m => Math.abs(m.gender_gap));

    const minRLS = Math.min(...rlsValues);
    const maxRLS = Math.max(...rlsValues);
    const minHLS = Math.min(...hlsValues);
    const maxHLS = Math.max(...hlsValues);
    const minGap = Math.min(...genderGapAbs);
    const maxGap = Math.max(...genderGapAbs);

    metricsArray.forEach((m, idx) => {
      const normRLS = (rlsValues[idx] - minRLS) / (maxRLS - minRLS);
      const normHLS = (hlsValues[idx] - minHLS) / (maxHLS - minHLS);
      const normGenderParity = 1 - ((genderGapAbs[idx] - minGap) / (maxGap - minGap));

      // Education Quality Index: 40% RLS + 30% HLS + 30% Gender Parity
      m.score = (0.40 * normRLS + 0.30 * normHLS + 0.30 * normGenderParity) * 100;
    });

    // Clustering: percentile-based
    const sorted = [...metricsArray].sort((a, b) => b.score - a.score);
    const p67 = sorted[Math.floor(sorted.length * 0.33)].score;
    const p33 = sorted[Math.floor(sorted.length * 0.67)].score;

    metricsArray.forEach(m => {
      if (m.score >= p67) m.cluster = "Advanced";
      else if (m.score >= p33) m.cluster = "Developing";
      else m.cluster = "Lagging";
    });

    return metricsArray.sort((a, b) => b.score - a.score);
  }, [dataset.sampleData, selectedYear]);

  // National trends
  const nationalTrends = useMemo(() => {
    const trendData: any[] = [];
    const yearSet = new Set<number>();

    dataset.sampleData.forEach((row: any) => {
      if (row.jenis_kelamin === "Total") {
        yearSet.add(row.tahun);
      }
    });

    const sortedYears = Array.from(yearSet).sort();

    sortedYears.forEach(year => {
      const yearData = dataset.sampleData.filter((row: any) => 
        row.tahun === year && row.jenis_kelamin === "Total"
      );

      if (yearData.length > 0) {
        const avgRLS = yearData.reduce((sum: number, row: any) => sum + row.rls, 0) / yearData.length;
        const avgHLS = yearData.reduce((sum: number, row: any) => sum + row.hls, 0) / yearData.length;

        trendData.push({
          tahun: year,
          rls: parseFloat(avgRLS.toFixed(2)),
          hls: parseFloat(avgHLS.toFixed(2)),
          gap: parseFloat((avgHLS - avgRLS).toFixed(2))
        });
      }
    });

    return trendData;
  }, [dataset.sampleData]);

  // Gender gap analysis
  const genderGapData = useMemo(() => {
    return provinceMetrics
      .filter(m => Math.abs(m.gender_gap) > 0.01)
      .map(m => ({
        provinsi: m.provinsi.substring(0, 15),
        gap: parseFloat(m.gender_gap.toFixed(2)),
        status: Math.abs(m.gender_gap) < 0.3 ? "Equal" : Math.abs(m.gender_gap) < 0.8 ? "Minor Gap" : "Significant Gap"
      }))
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 15);
  }, [provinceMetrics]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (nationalTrends.length === 0) {
      return {
        avgEducationGap: 0,
        rlsAnnualGrowth: 0,
        decadeProgress: 0,
        genderDisparityCount: 0
      };
    }

    const currentYear = nationalTrends[nationalTrends.length - 1];
    const previousYear = nationalTrends.length > 1 ? nationalTrends[nationalTrends.length - 2] : null;
    const firstYear = nationalTrends[0];

    const rlsGrowth = previousYear ? 
      ((currentYear.rls - previousYear.rls) / previousYear.rls * 100) : 0;

    const decadeProgress = firstYear && firstYear !== currentYear ? 
      ((currentYear.rls - firstYear.rls) / firstYear.rls * 100) : 0;

    const genderGapProvinces = provinceMetrics.filter(m => Math.abs(m.gender_gap) > 0.3).length;

    return {
      avgEducationGap: currentYear?.gap || 0,
      rlsAnnualGrowth: rlsGrowth,
      decadeProgress: decadeProgress,
      genderDisparityCount: genderGapProvinces
    };
  }, [nationalTrends, provinceMetrics]);

  const clusterCounts = useMemo(() => {
    const counts = { Advanced: 0, Developing: 0, Lagging: 0 };
    provinceMetrics.forEach(m => {
      counts[m.cluster as keyof typeof counts]++;
    });
    return counts;
  }, [provinceMetrics]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Controls</CardTitle>
          <CardDescription>Select year for provincial analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Education Gap (HLS - RLS)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kpis.avgEducationGap.toFixed(1)} tahun
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis.avgEducationGap > 4 ? "High expansion potential" : 
               kpis.avgEducationGap > 2 ? "Moderate potential" : "Low potential"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">RLS Annual Growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {kpis.rlsAnnualGrowth >= 0 ? '+' : ''}{kpis.rlsAnnualGrowth.toFixed(2)}%
              </span>
              {kpis.rlsAnnualGrowth > 0 ? 
                <TrendingUp className="w-5 h-5 text-green-600" /> :
                <TrendingDown className="w-5 h-5 text-red-600" />
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">Year-over-year change</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">10-Year Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              +{kpis.decadeProgress.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">RLS improvement (2015-2025)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Gender Disparity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600">
                {kpis.genderDisparityCount}
              </span>
              {kpis.genderDisparityCount > 0 && <AlertTriangle className="w-5 h-5 text-orange-600" />}
            </div>
            <p className="text-xs text-gray-500 mt-1">Provinces with gap &gt; 0.3 years</p>
          </CardContent>
        </Card>
      </div>

      {/* National Trends */}
      <Card>
        <CardHeader>
          <CardTitle>National Education Trends (2015-2025)</CardTitle>
          <CardDescription>Average schooling years and educational expectations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={nationalTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis label={{ value: 'Years', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rls" stroke="#3b82f6" name="RLS (Avg Schooling)" strokeWidth={2} />
              <Line type="monotone" dataKey="hls" stroke="#8b5cf6" name="HLS (Expected Schooling)" strokeWidth={2} />
              <Line type="monotone" dataKey="gap" stroke="#f59e0b" name="Education Gap" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gender Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Gender Gap in Education ({selectedYear})</CardTitle>
          <CardDescription>RLS difference: Laki-laki - Perempuan (positive = male advantage)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={genderGapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Years Difference', position: 'bottom' }} />
              <YAxis type="category" dataKey="provinsi" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="gap" fill="#f97316" name="Gender Gap (years)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex gap-2">
            <Badge variant="default">Equal: |gap| &lt; 0.3</Badge>
            <Badge variant="secondary">Minor: 0.3-0.8 years</Badge>
            <Badge variant="destructive">Significant: &gt; 0.8 years</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Provincial Performance Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Provincial Education Quality Index ({selectedYear})</CardTitle>
          <CardDescription>Composite score: 40% RLS + 30% HLS + 30% Gender Parity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {provinceMetrics.map((m, idx) => (
              <div key={m.provinsi} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{m.provinsi}</div>
                  <div className="text-xs text-gray-600">
                    RLS: {((m.rls_male + m.rls_female) / 2).toFixed(2)} tahun | 
                    HLS: {m.hls_total.toFixed(2)} tahun | 
                    Gender Gap: {Math.abs(m.gender_gap) < 0.01 ? '~0' : m.gender_gap.toFixed(2)} tahun
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-purple-600">{m.score.toFixed(1)}</div>
                  <Badge 
                    variant={m.cluster === "Advanced" ? "default" : m.cluster === "Developing" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {m.cluster}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{clusterCounts.Advanced}</div>
                <div className="text-xs text-gray-600">Advanced</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{clusterCounts.Developing}</div>
                <div className="text-xs text-gray-600">Developing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{clusterCounts.Lagging}</div>
                <div className="text-xs text-gray-600">Lagging</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}