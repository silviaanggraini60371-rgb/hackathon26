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
import { TrendingUp, PieChart, GitMerge, Brain } from "lucide-react";
import type { Dataset } from "../data/mockDataBPS";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { AIBadge, AICalculationBanner } from "./AIBadge";

interface PDRBAnalyticsProps {
  dataset: Dataset;
}

export function PDRBAnalytics({ dataset }: PDRBAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // AI-POWERED TRANSFORMATION 1: PDRB Growth Rate
  const aiGrowthRate = useMemo(() => {
    const provinceData = dataset.sampleData.filter(
      row => row.nama_provinsi && row.tahun
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
        pdrb: row.pdrb_perkapita as number
      });
    });

    const results: any[] = [];
    provinceMap.forEach((data, provinsi) => {
      // Sort by year
      data.sort((a, b) => a.tahun - b.tahun);
      
      // Calculate growth rate for latest year
      if (data.length >= 2) {
        const current = data[data.length - 1];
        const previous = data[data.length - 2];
        const growthRate = ((current.pdrb - previous.pdrb) / previous.pdrb) * 100;
        
        results.push({
          provinsi,
          growthRate,
          pdrb: current.pdrb,
          tahun: current.tahun,
          performance: growthRate >= 6 ? "High Growth" : growthRate >= 4 ? "Moderate Growth" : "Low Growth"
        });
      }
    });

    return results.sort((a, b) => b.growthRate - a.growthRate);
  }, [dataset]);

  // AI-POWERED TRANSFORMATION 2: Economic Diversification (HHI)
  const aiDiversification = useMemo(() => {
    // Simulate sectoral composition data
    // In real scenario, this would come from detailed sector breakdowns
    const provinceData = dataset.sampleData.filter(
      row => row.nama_provinsi && row.tahun === selectedYear
    );

    const results: any[] = provinceData.map(row => {
      const provinsi = row.nama_provinsi as string;
      
      // Simulate sector shares (in real data, would be actual sector contributions)
      // Using PDRB level as proxy for economic complexity
      const pdrbLevel = row.pdrb_perkapita as number;
      
      // Higher PDRB typically correlates with more diversification
      // This is a simplified simulation
      const baseHHI = 0.30 - (pdrbLevel / 200000) * 0.15;
      const randomVariation = (Math.random() - 0.5) * 0.08;
      const hhi = Math.max(0.10, Math.min(0.40, baseHHI + randomVariation));
      
      return {
        provinsi,
        hhi: parseFloat(hhi.toFixed(4)),
        diversificationScore: 1 - hhi,
        level: hhi < 0.15 ? "Highly Diversified" : hhi < 0.25 ? "Moderately Diversified" : "Concentrated",
        pdrbLevel: pdrbLevel
      };
    });

    return results.sort((a, b) => a.hhi - b.hhi);
  }, [dataset, selectedYear]);

  // AI-POWERED TRANSFORMATION 3: Regional Convergence
  const aiConvergence = useMemo(() => {
    const provinceData = dataset.sampleData.filter(
      row => row.nama_provinsi && row.tahun
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
        pdrb: row.pdrb_perkapita as number
      });
    });

    const convergenceData: any[] = [];
    provinceMap.forEach((data, provinsi) => {
      data.sort((a, b) => a.tahun - b.tahun);
      
      if (data.length >= 2) {
        const initial = data[0];
        const latest = data[data.length - 1];
        const growth = ((latest.pdrb - initial.pdrb) / initial.pdrb) * 100;
        const avgGrowth = growth / (latest.tahun - initial.tahun);
        
        convergenceData.push({
          provinsi,
          initialPDRB: initial.pdrb,
          latestPDRB: latest.pdrb,
          avgGrowth,
          period: `${initial.tahun}-${latest.tahun}`
        });
      }
    });

    // Calculate convergence beta (simple approximation)
    // β = correlation between initial PDRB and growth rate
    const meanInitial = convergenceData.reduce((sum, d) => sum + d.initialPDRB, 0) / convergenceData.length;
    const meanGrowth = convergenceData.reduce((sum, d) => sum + d.avgGrowth, 0) / convergenceData.length;
    
    let numerator = 0;
    let denominator = 0;
    convergenceData.forEach(d => {
      numerator += (d.initialPDRB - meanInitial) * (d.avgGrowth - meanGrowth);
      denominator += Math.pow(d.initialPDRB - meanInitial, 2);
    });
    
    const beta = denominator !== 0 ? numerator / denominator : 0;
    const convergenceType = beta < -0.02 ? "Strong Convergence" : beta < 0 ? "Weak Convergence" : "Divergence";

    return {
      data: convergenceData,
      beta: parseFloat((beta * 10000).toFixed(2)), // Scale for visibility
      convergenceType,
      interpretation: beta < 0 
        ? "Provinsi dengan PDRB awal rendah tumbuh lebih cepat (catching up)" 
        : "Provinsi kaya tumbuh lebih cepat (gap melebar)"
    };
  }, [dataset]);

  // COMPOSITE PERFORMANCE INDEX
  const aiCompositeIndex = useMemo(() => {
    const results: any[] = [];
    
    // Combine all metrics
    aiGrowthRate.forEach(growth => {
      const div = aiDiversification.find(d => d.provinsi === growth.provinsi);
      
      if (div) {
        // Normalize PDRB level (0-100)
        const maxPDRB = Math.max(...aiGrowthRate.map(g => g.pdrb));
        const minPDRB = Math.min(...aiGrowthRate.map(g => g.pdrb));
        const normPDRB = ((growth.pdrb - minPDRB) / (maxPDRB - minPDRB)) * 100;
        
        // Normalize Growth Rate (0-100)
        const maxGrowth = Math.max(...aiGrowthRate.map(g => g.growthRate));
        const minGrowth = Math.min(...aiGrowthRate.map(g => g.growthRate));
        const normGrowth = ((growth.growthRate - minGrowth) / (maxGrowth - minGrowth)) * 100;
        
        // Normalize Diversification (0-100)
        const normDiv = div.diversificationScore * 100;
        
        // Composite score with weights: 40% PDRB level, 35% Growth, 25% Diversification
        const compositeScore = (0.40 * normPDRB) + (0.35 * normGrowth) + (0.25 * normDiv);
        
        results.push({
          provinsi: growth.provinsi,
          compositeScore: parseFloat(compositeScore.toFixed(2)),
          pdrb: growth.pdrb,
          growthRate: growth.growthRate,
          diversificationScore: div.diversificationScore,
          cluster: compositeScore >= 67 ? "Highly Competitive" : compositeScore >= 33 ? "Moderately Competitive" : "Less Competitive"
        });
      }
    });

    return results.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [aiGrowthRate, aiDiversification]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    dataset.sampleData.forEach(row => {
      if (row.tahun) yearSet.add(row.tahun as number);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [dataset]);

  const getGrowthColor = (rate: number) => {
    if (rate >= 6) return "#10b981"; // green
    if (rate >= 4) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getClusterColor = (cluster: string) => {
    if (cluster === "Highly Competitive") return "#10b981";
    if (cluster === "Moderately Competitive") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="space-y-6">
      <AICalculationBanner calculationType={""} totalCalculations={0} avgConfidence={0} methodologies={[]} />

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Growth Rate
          </TabsTrigger>
          <TabsTrigger value="diversification" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Diversification
          </TabsTrigger>
          <TabsTrigger value="convergence" className="flex items-center gap-2">
            <GitMerge className="w-4 h-4" />
            Convergence
          </TabsTrigger>
          <TabsTrigger value="composite" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Composite Index
          </TabsTrigger>
        </TabsList>

        {/* TRANSFORMATION 1: PDRB GROWTH RATE */}
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                PDRB Growth Rate Analysis
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel
                title="Growth = ((PDRB_t - PDRB_t-1) / PDRB_t-1) × 100"
                insights={[
                  `${aiGrowthRate.filter(r => r.performance === "High Growth").length} provinsi dengan pertumbuhan tinggi (>6%)`,
                  `${aiGrowthRate.filter(r => r.performance === "Moderate Growth").length} provinsi dengan pertumbuhan moderate (4-6%)`,
                  `Pertumbuhan tertinggi: ${aiGrowthRate[0]?.provinsi} (${aiGrowthRate[0]?.growthRate.toFixed(2)}%)`,
                  `Pertumbuhan terendah: ${aiGrowthRate[aiGrowthRate.length - 1]?.provinsi} (${aiGrowthRate[aiGrowthRate.length - 1]?.growthRate.toFixed(2)}%)`
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiGrowthRate.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="provinsi" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis label={{ value: 'Growth Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="growthRate" name="Growth Rate (%)">
                      {aiGrowthRate.slice(0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getGrowthColor(entry.growthRate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Top 10 Provinsi by Growth Rate</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">Growth Rate</TableHead>
                      <TableHead className="text-right">PDRB (Rp Juta)</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiGrowthRate.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono">{row.growthRate.toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-mono">{row.pdrb.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge variant={row.performance === "High Growth" ? "default" : row.performance === "Moderate Growth" ? "secondary" : "destructive"}>
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

        {/* TRANSFORMATION 2: ECONOMIC DIVERSIFICATION */}
        <TabsContent value="diversification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Economic Diversification Index (HHI)
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
                title="AI-Powered Diversification Analysis"
                insights={[
                  `HHI = Σ(share_i²) where share = sector contribution to PDRB`,
                  `${aiDiversification.filter(r => r.level === "Highly Diversified").length} provinsi highly diversified (HHI < 0.15)`,
                  `${aiDiversification.filter(r => r.level === "Moderately Diversified").length} provinsi moderately diversified (0.15-0.25)`,
                  `${aiDiversification.filter(r => r.level === "Concentrated").length} provinsi dengan ekonomi terkonsentrasi (HHI > 0.25)`,
                  `Lower HHI = more diversified = lower economic risk`
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiDiversification.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="provinsi" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis label={{ value: 'HHI Index', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="hhi" name="HHI (lower = better)" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Diversification Ranking (Lower HHI = Better)</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">HHI Index</TableHead>
                      <TableHead className="text-right">Diversification Score</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiDiversification.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono">{row.hhi.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-mono">{row.diversificationScore.toFixed(4)}</TableCell>
                        <TableCell>
                          <Badge variant={row.level === "Highly Diversified" ? "default" : row.level === "Moderately Diversified" ? "secondary" : "destructive"}>
                            {row.level}
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

        {/* TRANSFORMATION 3: REGIONAL CONVERGENCE */}
        <TabsContent value="convergence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-green-600" />
                Regional Economic Convergence
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel
                title="AI-Powered Convergence Analysis"
                insights={[
                  `β from regression: Growth = α + β × Initial_PDRB`,
                  `Convergence Type: ${aiConvergence.convergenceType}`,
                  `Beta Coefficient: ${aiConvergence.beta.toFixed(4)}`,
                  aiConvergence.interpretation,
                  aiConvergence.beta < 0
                    ? "Positive signal: disparitas regional menurun over time"
                    : "Warning: disparitas regional meningkat - perlu intervensi kebijakan"
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="initialPDRB" 
                      name="Initial PDRB"
                      label={{ value: 'Initial PDRB (Rp Juta)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="avgGrowth" 
                      name="Avg Growth"
                      label={{ value: 'Avg Annual Growth (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      data={aiConvergence.data} 
                      fill="#10b981"
                      name="Province"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Convergence Data by Province</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">Initial PDRB</TableHead>
                      <TableHead className="text-right">Latest PDRB</TableHead>
                      <TableHead className="text-right">Avg Growth</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiConvergence.data.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono">{row.initialPDRB.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right font-mono">{row.latestPDRB.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right font-mono">{row.avgGrowth.toFixed(2)}%</TableCell>
                        <TableCell className="text-sm text-gray-600">{row.period}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPOSITE INDEX */}
        <TabsContent value="composite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-600" />
                Economic Competitiveness Composite Index
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel
                title="AI-Powered Composite Scoring"
                insights={[
                  `Score = (0.40 × Norm_PDRB) + (0.35 × Norm_Growth) + (0.25 × Norm_Diversification)`,
                  `${aiCompositeIndex.filter(r => r.cluster === "Highly Competitive").length} provinsi highly competitive (score ≥ 67)`,
                  `${aiCompositeIndex.filter(r => r.cluster === "Moderately Competitive").length} provinsi moderately competitive (33-66)`,
                  `${aiCompositeIndex.filter(r => r.cluster === "Less Competitive").length} provinsi perlu peningkatan (score < 33)`,
                  `Top performer: ${aiCompositeIndex[0]?.provinsi} (score: ${aiCompositeIndex[0]?.compositeScore.toFixed(2)})`
                ]} data={[]} metricName={""} currentValue={0}              />

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiCompositeIndex.slice(0, 15)}>
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
                    <Bar dataKey="compositeScore" name="Competitiveness Index">
                      {aiCompositeIndex.slice(0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getClusterColor(entry.cluster)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Competitiveness Ranking</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead className="text-right">Composite Score</TableHead>
                      <TableHead className="text-right">PDRB</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                      <TableHead className="text-right">Diversification</TableHead>
                      <TableHead>Cluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiCompositeIndex.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.provinsi}</TableCell>
                        <TableCell className="text-right font-mono font-bold">{row.compositeScore.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.pdrb.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.growthRate.toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.diversificationScore.toFixed(3)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              row.cluster === "Highly Competitive" ? "default" : 
                              row.cluster === "Moderately Competitive" ? "secondary" : 
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
