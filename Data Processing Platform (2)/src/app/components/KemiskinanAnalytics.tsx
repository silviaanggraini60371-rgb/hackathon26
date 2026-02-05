import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingDown, TrendingUp, AlertTriangle, MapPin } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import type { Dataset } from "../data/mockDataBPS";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

interface KemiskinanAnalyticsProps {
  dataset: Dataset;
}

interface ProvinceMetrics {
  provinsi: string;
  poverty_rate: number;
  poverty_urban: number;
  poverty_rural: number;
  urban_rural_gap: number;
  reduction_rate: number;
  score: number;
  cluster: string;
}

export function KemiskinanAnalytics({ dataset }: KemiskinanAnalyticsProps) {
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
    const metricsByProvince = new Map<string, any>();

    // Get current and previous year data
    const currentYearData = dataset.sampleData.filter((row: any) => row.tahun === selectedYear);
    const prevYearData = dataset.sampleData.filter((row: any) => row.tahun === selectedYear - 1);

    currentYearData.forEach((row: any) => {
      const key = row.nama_provinsi;

      if (!metricsByProvince.has(key)) {
        metricsByProvince.set(key, {
          provinsi: row.nama_provinsi,
          poverty_rate: 0,
          poverty_urban: 0,
          poverty_rural: 0,
          poverty_prev: 0,
          urban_rural_gap: 0,
          reduction_rate: 0,
          score: 0,
          cluster: ""
        });
      }

      const metrics = metricsByProvince.get(key);
      
      if (row.wilayah === "Total") {
        metrics.poverty_rate = row.persentase_miskin;
      } else if (row.wilayah === "Perkotaan") {
        metrics.poverty_urban = row.persentase_miskin;
      } else if (row.wilayah === "Perdesaan") {
        metrics.poverty_rural = row.persentase_miskin;
      }
    });

    // Get previous year for reduction calculation
    prevYearData.forEach((row: any) => {
      if (row.wilayah === "Total") {
        const metrics = metricsByProvince.get(row.nama_provinsi);
        if (metrics) {
          metrics.poverty_prev = row.persentase_miskin;
        }
      }
    });

    // Calculate derived metrics
    const metricsArray: ProvinceMetrics[] = [];
    metricsByProvince.forEach(m => {
      m.urban_rural_gap = m.poverty_rural - m.poverty_urban;
      m.reduction_rate = m.poverty_prev > 0 ? 
        ((m.poverty_prev - m.poverty_rate) / m.poverty_prev) * 100 : 0;
      metricsArray.push(m);
    });

    // Normalize and calculate composite score (inverse - lower poverty is better)
    const povertyRates = metricsArray.map(m => m.poverty_rate);
    const reductionRates = metricsArray.map(m => m.reduction_rate);
    const gaps = metricsArray.map(m => m.urban_rural_gap);

    const minPov = Math.min(...povertyRates);
    const maxPov = Math.max(...povertyRates);
    const minRed = Math.min(...reductionRates);
    const maxRed = Math.max(...reductionRates);
    const minGap = Math.min(...gaps);
    const maxGap = Math.max(...gaps);

    metricsArray.forEach((m, idx) => {
      // Inverse normalization for poverty (lower is better)
      const normPoverty = 1 - ((povertyRates[idx] - minPov) / (maxPov - minPov || 1));
      const normReduction = (reductionRates[idx] - minRed) / (maxRed - minRed || 1);
      const normEquity = 1 - ((gaps[idx] - minGap) / (maxGap - minGap || 1));

      // Poverty Alleviation Performance Index: 45% Low Rate + 35% High Reduction + 20% Equity
      m.score = (0.45 * normPoverty + 0.35 * normReduction + 0.20 * normEquity) * 100;
    });

    // Clustering: percentile-based (higher score = better)
    const sorted = [...metricsArray].sort((a, b) => b.score - a.score);
    const p67 = sorted[Math.floor(sorted.length * 0.33)]?.score || 67;
    const p33 = sorted[Math.floor(sorted.length * 0.67)]?.score || 33;

    metricsArray.forEach(m => {
      if (m.score >= p67) m.cluster = "Low Poverty";
      else if (m.score >= p33) m.cluster = "Medium Poverty";
      else m.cluster = "High Poverty";
    });

    return metricsArray.sort((a, b) => b.score - a.score);
  }, [dataset.sampleData, selectedYear]);

  // National trends
  const nationalTrends = useMemo(() => {
    const trendData: any[] = [];
    const yearSet = new Set<number>();

    dataset.sampleData.forEach((row: any) => {
      yearSet.add(row.tahun);
    });

    const sortedYears = Array.from(yearSet).sort();

    sortedYears.forEach(year => {
      const yearData = dataset.sampleData.filter((row: any) => row.tahun === year);

      const totalData = yearData.filter((row: any) => row.wilayah === "Total");
      const urbanData = yearData.filter((row: any) => row.wilayah === "Perkotaan");
      const ruralData = yearData.filter((row: any) => row.wilayah === "Perdesaan");

      if (totalData.length > 0) {
        const avgTotal = totalData.reduce((sum: number, row: any) => sum + row.persentase_miskin, 0) / totalData.length;
        const avgUrban = urbanData.reduce((sum: number, row: any) => sum + row.persentase_miskin, 0) / (urbanData.length || 1);
        const avgRural = ruralData.reduce((sum: number, row: any) => sum + row.persentase_miskin, 0) / (ruralData.length || 1);

        trendData.push({
          tahun: year,
          total: parseFloat(avgTotal.toFixed(2)),
          perkotaan: parseFloat(avgUrban.toFixed(2)),
          perdesaan: parseFloat(avgRural.toFixed(2)),
          gap: parseFloat((avgRural - avgUrban).toFixed(2))
        });
      }
    });

    return trendData;
  }, [dataset.sampleData]);

  // Top and bottom performers
  const topPerformers = useMemo(() => 
    provinceMetrics.slice(0, 5),
    [provinceMetrics]
  );

  const bottomPerformers = useMemo(() => 
    provinceMetrics.slice(-5).reverse(),
    [provinceMetrics]
  );

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (nationalTrends.length === 0) {
      return {
        nationalRate: 0,
        annualReduction: 0,
        decadeReduction: 0,
        highPovertyProvinces: 0,
        urbanRuralGap: 0
      };
    }

    const currentYear = nationalTrends[nationalTrends.length - 1];
    const previousYear = nationalTrends.length > 1 ? nationalTrends[nationalTrends.length - 2] : null;
    const firstYear = nationalTrends[0];

    const annualReduction = previousYear ? 
      ((previousYear.total - currentYear.total) / previousYear.total * 100) : 0;

    const decadeReduction = firstYear && firstYear !== currentYear ? 
      ((firstYear.total - currentYear.total) / firstYear.total * 100) : 0;

    const highPovertyCount = provinceMetrics.filter(m => m.poverty_rate > 12).length;

    const avgGap = currentYear?.gap || 0;

    return {
      nationalRate: currentYear?.total || 0,
      annualReduction: annualReduction,
      decadeReduction: decadeReduction,
      highPovertyProvinces: highPovertyCount,
      urbanRuralGap: avgGap
    };
  }, [nationalTrends, provinceMetrics]);

  const clusterCounts = useMemo(() => {
    const counts = { "Low Poverty": 0, "Medium Poverty": 0, "High Poverty": 0 };
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">National Poverty Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kpis.nationalRate.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis.nationalRate < 7 ? "Low (Target achieved)" : 
               kpis.nationalRate < 12 ? "Medium" : "High"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Annual Reduction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {kpis.annualReduction >= 0 ? '-' : '+'}{Math.abs(kpis.annualReduction).toFixed(2)}%
              </span>
              {kpis.annualReduction > 0 ? 
                <TrendingDown className="w-5 h-5 text-green-600" /> :
                <TrendingUp className="w-5 h-5 text-red-600" />
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis.annualReduction > 5 ? "On track SDG" : 
               kpis.annualReduction > 2 ? "Moderate progress" : "Slow progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Decade Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              -{kpis.decadeReduction.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Reduction since 2015</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">High Poverty Areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600">
                {kpis.highPovertyProvinces}
              </span>
              {kpis.highPovertyProvinces > 0 && <AlertTriangle className="w-5 h-5 text-orange-600" />}
            </div>
            <p className="text-xs text-gray-500 mt-1">Provinces with rate &gt; 12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Urban-Rural Gap</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kpis.urbanRuralGap.toFixed(1)} pp
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis.urbanRuralGap < 3 ? "Low disparity" : 
               kpis.urbanRuralGap < 7 ? "Moderate" : "High disparity"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* National Trends */}
      <Card>
        <CardHeader>
          <CardTitle>National Poverty Trends (2015-2025)</CardTitle>
          <CardDescription>Poverty headcount ratio by area type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={nationalTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis label={{ value: 'Poverty Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="National" strokeWidth={2} />
              <Line type="monotone" dataKey="perkotaan" stroke="#10b981" name="Urban" strokeWidth={2} />
              <Line type="monotone" dataKey="perdesaan" stroke="#ef4444" name="Rural" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Urban-Rural Gap */}
      <Card>
        <CardHeader>
          <CardTitle>Urban-Rural Poverty Gap ({selectedYear})</CardTitle>
          <CardDescription>Rural poverty rate minus urban rate (percentage points)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={provinceMetrics.filter(m => m.urban_rural_gap > 0.5).slice(0, 15).sort((a, b) => b.urban_rural_gap - a.urban_rural_gap)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Gap (percentage points)', position: 'bottom' }} />
              <YAxis type="category" dataKey="provinsi" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="urban_rural_gap" fill="#f97316" name="Urban-Rural Gap" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 flex gap-2">
            <Badge variant="default">Low: &lt; 3 pp</Badge>
            <Badge variant="secondary">Moderate: 3-7 pp</Badge>
            <Badge variant="destructive">High: &gt; 7 pp</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Top 5 Performers ({selectedYear})
            </CardTitle>
            <CardDescription>Best poverty alleviation performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((m, idx) => (
                <div key={m.provinsi} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{m.provinsi}</div>
                    <div className="text-xs text-gray-600">
                      Rate: {m.poverty_rate.toFixed(2)}% | Reduction: {m.reduction_rate.toFixed(1)}%/yr
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{m.score.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Bottom 5 Performers ({selectedYear})
            </CardTitle>
            <CardDescription>Areas requiring intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomPerformers.map((m, idx) => (
                <div key={m.provinsi} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                    {provinceMetrics.length - 4 + idx}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{m.provinsi}</div>
                    <div className="text-xs text-gray-600">
                      Rate: {m.poverty_rate.toFixed(2)}% | Reduction: {m.reduction_rate.toFixed(1)}%/yr
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{m.score.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provincial Performance Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Provincial Poverty Alleviation Performance ({selectedYear})</CardTitle>
          <CardDescription>Composite score: 45% Low Rate + 35% High Reduction + 20% Urban-Rural Equity</CardDescription>
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
                    Poverty: {m.poverty_rate.toFixed(2)}% | 
                    Reduction: {m.reduction_rate.toFixed(1)}%/yr | 
                    UR Gap: {m.urban_rural_gap.toFixed(1)} pp
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-purple-600">{m.score.toFixed(1)}</div>
                  <Badge 
                    variant={m.cluster === "Low Poverty" ? "default" : m.cluster === "Medium Poverty" ? "secondary" : "destructive"}
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
                <div className="text-2xl font-bold text-green-600">{clusterCounts["Low Poverty"]}</div>
                <div className="text-xs text-gray-600">Low Poverty</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{clusterCounts["Medium Poverty"]}</div>
                <div className="text-xs text-gray-600">Medium Poverty</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{clusterCounts["High Poverty"]}</div>
                <div className="text-xs text-gray-600">High Poverty</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}