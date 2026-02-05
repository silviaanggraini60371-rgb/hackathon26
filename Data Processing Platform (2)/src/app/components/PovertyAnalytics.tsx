import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
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
import { TrendingDown, AlertTriangle, Target, Brain } from "lucide-react";
import type { Dataset } from "../data/mockDataBPS";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { calculateAIPovertyUrbanRuralGap, calculateAIGrowthRate, calculateAIRanking } from "../utils/aiAnalytics";
import { AIBadge, AICalculationBanner } from "./AIBadge";

interface PovertyAnalyticsProps {
  dataset: Dataset;
}

export function PovertyAnalytics({ dataset }: PovertyAnalyticsProps) {
  // AI-POWERED TRANSFORMATION 1: Poverty Reduction Rate
  const aiPovertyReduction = useMemo(() => {
    const nationalData = dataset.sampleData.filter(
      row => row.wilayah === "Total" && row.nama_provinsi
    );
    
    const transformedData = nationalData.map(row => ({
      tahun: row.tahun as number,
      provinsi: row.nama_provinsi as string,
      value: row.tingkat_kemiskinan as number
    }));
    
    return calculateAIGrowthRate(transformedData);
  }, [dataset]);

  // AI-POWERED TRANSFORMATION 2: Urban-Rural Gap
  const aiUrbanRuralGap = useMemo(() => {
    const urbanRuralData = dataset.sampleData.filter(
      row => (row.wilayah === "Perkotaan" || row.wilayah === "Perdesaan") && row.nama_provinsi
    );
    
    const transformedData = urbanRuralData.map(row => ({
      tahun: row.tahun as number,
      provinsi: row.nama_provinsi as string,
      wilayah: row.wilayah as 'Perkotaan' | 'Perdesaan',
      poverty_rate: row.tingkat_kemiskinan as number
    }));
    
    return calculateAIPovertyUrbanRuralGap(transformedData);
  }, [dataset]);

  // AI-POWERED TRANSFORMATION 3: Provincial Ranking
  const aiProvincialRanking = useMemo(() => {
    const latestYear = Math.max(...dataset.sampleData.map(row => row.tahun as number));
    
    const latestPoverty = dataset.sampleData.filter(
      row => row.tahun === latestYear && row.wilayah === "Total"
    );
    
    const provinces = latestPoverty.map(row => {
      const provinsi = row.nama_provinsi as string;
      const currentPoverty = row.tingkat_kemiskinan as number;
      
      // Get reduction rate
      const reductionData = aiPovertyReduction.filter(r => r.provinsi === provinsi);
      const avgReduction = reductionData.length > 0
        ? reductionData.reduce((sum, r) => sum + r.growth_rate, 0) / reductionData.length
        : 0;
      
      // Get urban-rural equity
      const gapData = aiUrbanRuralGap.filter(g => g.provinsi === provinsi && g.tahun === latestYear);
      const equity = gapData.length > 0 ? gapData[0].equity_score : 50;
      
      return {
        provinsi,
        primary_metric: 100 - currentPoverty, // Invert: higher is better
        secondary_metric: Math.abs(avgReduction), // Reduction magnitude
        tertiary_metric: equity // Urban-rural equity
      };
    });
    
    return calculateAIRanking(provinces, { primary: 0.45, secondary: 0.35, tertiary: 0.20 });
  }, [dataset, aiPovertyReduction, aiUrbanRuralGap]);

  // National trend
  const nationalTrend = useMemo(() => {
    const nationalData = dataset.sampleData.filter(row => row.wilayah === "Total");
    
    const yearlyAvg = new Map<number, { sum: number; count: number }>();
    
    nationalData.forEach(row => {
      const year = row.tahun as number;
      if (!yearlyAvg.has(year)) {
        yearlyAvg.set(year, { sum: 0, count: 0 });
      }
      const data = yearlyAvg.get(year)!;
      data.sum += row.tingkat_kemiskinan as number;
      data.count++;
    });
    
    return Array.from(yearlyAvg.entries())
      .map(([tahun, data]) => ({
        tahun,
        poverty_rate: parseFloat((data.sum / data.count).toFixed(2))
      }))
      .sort((a, b) => a.tahun - b.tahun);
  }, [dataset]);

  const latestYear = Math.max(...dataset.sampleData.map(row => row.tahun as number));
  const latestNational = nationalTrend.find(t => t.tahun === latestYear)?.poverty_rate || 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="reduction" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Reduction Rate
          </TabsTrigger>
          <TabsTrigger value="gap" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Urban-Rural Gap
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Provincial Ranking
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: AI INSIGHTS */}
        <TabsContent value="ai" className="space-y-4">
          <AIInsightsPanel
            data={nationalTrend.map(t => ({ year: t.tahun, value: t.poverty_rate }))}
            metricName="Tingkat Kemiskinan"
            currentValue={latestNational}
          />
        </TabsContent>

        {/* TAB 1: POVERTY REDUCTION RATE */}
        <TabsContent value="reduction" className="space-y-4">
          <AICalculationBanner
            calculationType="AI-Enhanced Poverty Reduction Analysis"
            totalCalculations={aiPovertyReduction.length}
            avgConfidence={0.84}
            methodologies={[
              'Exponential Smoothing',
              'Acceleration Detection',
              'SDG Target Alignment',
              'Policy Effectiveness Scoring'
            ]}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Reduction Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {aiPovertyReduction.length > 0
                    ? Math.abs(aiPovertyReduction.reduce((sum, r) => sum + r.growth_rate, 0) / aiPovertyReduction.length).toFixed(2)
                    : "0.00"}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Per tahun (2016-2025)</p>
                <AIBadge confidence={0.84} variant="compact" className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Provinsi Terbaik (Penurunan Tertinggi)</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const provinceAvg = new Map<string, { sum: number; count: number }>();
                  aiPovertyReduction.forEach(r => {
                    if (!provinceAvg.has(r.provinsi)) {
                      provinceAvg.set(r.provinsi, { sum: 0, count: 0 });
                    }
                    const data = provinceAvg.get(r.provinsi)!;
                    data.sum += r.growth_rate;
                    data.count++;
                  });
                  
                  const avgByProvince = Array.from(provinceAvg.entries())
                    .map(([provinsi, data]) => ({
                      provinsi,
                      avg: data.sum / data.count
                    }))
                    .sort((a, b) => a.avg - b.avg)[0]; // Most negative = best reduction
                  
                  return (
                    <>
                      <div className="text-lg font-semibold text-green-600">
                        {avgByProvince?.provinsi.substring(0, 20) || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {Math.abs(avgByProvince?.avg || 0).toFixed(2)}% penurunan/tahun
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700">Provinsi Butuh Perhatian</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const provinceAvg = new Map<string, { sum: number; count: number }>();
                  aiPovertyReduction.forEach(r => {
                    if (!provinceAvg.has(r.provinsi)) {
                      provinceAvg.set(r.provinsi, { sum: 0, count: 0 });
                    }
                    const data = provinceAvg.get(r.provinsi)!;
                    data.sum += r.growth_rate;
                    data.count++;
                  });
                  
                  const worst = Array.from(provinceAvg.entries())
                    .map(([provinsi, data]) => ({
                      provinsi,
                      avg: data.sum / data.count
                    }))
                    .sort((a, b) => b.avg - a.avg)[0]; // Most positive/least negative = worst
                  
                  return (
                    <>
                      <div className="text-lg font-semibold text-red-600">
                        {worst?.provinsi.substring(0, 20) || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {worst && worst.avg < 0 
                          ? `${Math.abs(worst.avg).toFixed(2)}% penurunan/tahun (lambat)` 
                          : `${worst?.avg.toFixed(2)}% peningkatan/tahun`}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Reduction Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Reduction Rate Nasional</CardTitle>
              <p className="text-sm text-gray-600">
                Reduction Rate = ((Poverty_t-1 - Poverty_t) / Poverty_t-1) × 100%
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={(() => {
                  const yearlyAvg = new Map<number, { sum: number; count: number }>();
                  aiPovertyReduction.forEach(r => {
                    if (!yearlyAvg.has(r.tahun)) {
                      yearlyAvg.set(r.tahun, { sum: 0, count: 0 });
                    }
                    const data = yearlyAvg.get(r.tahun)!;
                    data.sum += r.growth_rate;
                    data.count++;
                  });
                  
                  return Array.from(yearlyAvg.entries())
                    .map(([tahun, data]) => ({
                      tahun,
                      reduction_rate: parseFloat((Math.abs(data.sum / data.count)).toFixed(2))
                    }))
                    .sort((a, b) => a.tahun - b.tahun);
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tahun" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reduction_rate" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name="Reduction Rate (%)"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: URBAN-RURAL GAP */}
        <TabsContent value="gap" className="space-y-4">
          <AICalculationBanner
            calculationType="AI-Enhanced Urban-Rural Equity Analysis"
            totalCalculations={aiUrbanRuralGap.length}
            avgConfidence={0.87}
            methodologies={[
              'Disparity Classification',
              'Equity Score Calculation',
              'Policy Focus Recommendation',
              'Regional Balance Assessment'
            ]}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Gap Nasional ({latestYear})</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestGaps = aiUrbanRuralGap.filter(g => g.tahun === latestYear);
                  const avgGap = latestGaps.length > 0
                    ? latestGaps.reduce((sum, g) => sum + g.gap, 0) / latestGaps.length
                    : 0;
                  
                  return (
                    <>
                      <div className="text-2xl font-bold">{avgGap.toFixed(2)} ppt</div>
                      <Badge className="mt-2" variant={avgGap < 3 ? "default" : avgGap < 7 ? "secondary" : "destructive"}>
                        {avgGap < 3 ? "Low Disparity" : avgGap < 7 ? "Moderate" : "High Disparity"}
                      </Badge>
                      <AIBadge confidence={0.87} variant="compact" className="mt-2" />
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">Provinsi Paling Adil</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestGaps = aiUrbanRuralGap.filter(g => g.tahun === latestYear);
                  const best = latestGaps.sort((a, b) => a.gap - b.gap)[0];
                  
                  return (
                    <>
                      <div className="text-lg font-semibold text-green-600">
                        {best?.provinsi.substring(0, 20) || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Gap: {best?.gap.toFixed(2)} ppt
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {best?.ai_policy_focus}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700">Disparitas Tertinggi</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestGaps = aiUrbanRuralGap.filter(g => g.tahun === latestYear);
                  const worst = latestGaps.sort((a, b) => b.gap - a.gap)[0];
                  
                  return (
                    <>
                      <div className="text-lg font-semibold text-red-600">
                        {worst?.provinsi.substring(0, 20) || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Gap: {worst?.gap.toFixed(2)} ppt
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        {worst?.ai_policy_focus}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Gap Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Urban-Rural Gap per Provinsi - {latestYear}</CardTitle>
              <p className="text-sm text-gray-600">Gap = Poverty Rural - Poverty Urban (percentage points)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart
                  data={aiUrbanRuralGap
                    .filter(g => g.tahun === latestYear)
                    .sort((a, b) => b.gap - a.gap)
                    .slice(0, 15)
                    .map(g => ({
                      ...g,
                      provinsi: g.provinsi.length > 20 ? g.provinsi.substring(0, 18) + '...' : g.provinsi
                    }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis type="category" dataKey="provinsi" stroke="#6b7280" width={150} style={{ fontSize: '11px' }} />
                  <Tooltip />
                  <Bar dataKey="gap" name="Gap (ppt)">
                    {aiUrbanRuralGap.filter(g => g.tahun === latestYear).slice(0, 15).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gap < 3 ? "#10b981" : entry.gap < 7 ? "#f59e0b" : "#ef4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PROVINCIAL RANKING */}
        <TabsContent value="ranking" className="space-y-4">
          <AICalculationBanner
            calculationType="AI-Enhanced Poverty Alleviation Ranking"
            totalCalculations={aiProvincialRanking.length}
            avgConfidence={0.90}
            methodologies={[
              'Composite Scoring (45-35-20)',
              'Adaptive Clustering',
              'Z-Score Normalization',
              'Performance-Based Segmentation'
            ]}
          />

          {/* Cluster Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">Low Poverty (High Performers)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {aiProvincialRanking.filter(p => p.cluster === "high_performer").length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Provinsi</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700">Medium Poverty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {aiProvincialRanking.filter(p => p.cluster === "medium_performer").length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Provinsi</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700">High Poverty (Need Support)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {aiProvincialRanking.filter(p => p.cluster === "low_performer" || p.cluster === "critical").length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Provinsi</p>
              </CardContent>
            </Card>
          </div>

          {/* Ranking Table */}
          <Card>
            <CardHeader>
              <CardTitle>Peringkat Provinsi - Poverty Alleviation Performance</CardTitle>
              <p className="text-sm text-gray-600">
                Score: 45% Current Status + 35% Reduction Rate + 20% Urban-Rural Equity
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="bg-purple-900 sticky top-0">
                    <TableRow>
                      <TableHead className="text-white font-semibold">Rank</TableHead>
                      <TableHead className="text-white font-semibold">Provinsi</TableHead>
                      <TableHead className="text-white font-semibold">Score</TableHead>
                      <TableHead className="text-white font-semibold">Cluster</TableHead>
                      <TableHead className="text-white font-semibold">AI Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiProvincialRanking.map((row, idx) => (
                      <TableRow key={row.provinsi} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                        <TableCell className="font-semibold">{row.rank}</TableCell>
                        <TableCell className="font-medium">{row.provinsi}</TableCell>
                        <TableCell className="font-semibold">{row.normalized_score}</TableCell>
                        <TableCell>
                          <Badge variant={
                            row.cluster === "high_performer" ? "default" :
                            row.cluster === "medium_performer" ? "secondary" : "destructive"
                          }>
                            {row.cluster === "high_performer" ? "Low Poverty" :
                             row.cluster === "medium_performer" ? "Medium Poverty" : "High Poverty"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{row.ai_recommendation}</TableCell>
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
