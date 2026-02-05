import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { qualityMetricsHistory, mockDatasets } from "../../data/mockDataBPS";
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShieldCheck, AlertTriangle, TrendingUp, CheckCircle, XCircle, Info } from "lucide-react";

export function QualityDashboard() {
  // Calculate current quality metrics
  const latestMetrics = qualityMetricsHistory[qualityMetricsHistory.length - 1];
  const avgQuality = (latestMetrics.completeness + latestMetrics.accuracy + latestMetrics.timeliness + latestMetrics.consistency) / 4;

  // Radar chart data
  const radarData = [
    { dimension: 'Completeness', value: latestMetrics.completeness },
    { dimension: 'Accuracy', value: latestMetrics.accuracy },
    { dimension: 'Timeliness', value: latestMetrics.timeliness },
    { dimension: 'Consistency', value: latestMetrics.consistency },
  ];

  // Dataset quality breakdown
  const datasetQualityBreakdown = mockDatasets.map(ds => ({
    name: ds.title.substring(0, 30) + (ds.title.length > 30 ? '...' : ''),
    completeness: ds.completeness,
    category: ds.category,
    id: ds.id,
  }));

  const getQualityColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 85) return "text-blue-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityBadge = (score: number) => {
    if (score >= 95) return { variant: "default" as const, label: "Excellent", icon: CheckCircle };
    if (score >= 85) return { variant: "secondary" as const, label: "Good", icon: CheckCircle };
    if (score >= 75) return { variant: "outline" as const, label: "Fair", icon: AlertTriangle };
    return { variant: "destructive" as const, label: "Poor", icon: XCircle };
  };

  const overallBadge = getQualityBadge(avgQuality);
  const OverallIcon = overallBadge.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Data Quality Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Monitor kualitas data across completeness, accuracy, timeliness, dan consistency
        </p>
      </div>

      {/* Overall Quality Score */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Overall Data Quality Score</CardTitle>
              <CardDescription>Agregasi dari 4 dimensi kualitas data</CardDescription>
            </div>
            <ShieldCheck className="w-12 h-12 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-4">
            <div className={`text-6xl font-bold ${getQualityColor(avgQuality)}`}>
              {avgQuality.toFixed(1)}%
            </div>
            <Badge variant={overallBadge.variant} className="mb-2 px-3 py-1">
              <OverallIcon className="w-4 h-4 mr-1" />
              {overallBadge.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Completeness</p>
              <p className={`text-2xl font-bold ${getQualityColor(latestMetrics.completeness)}`}>
                {latestMetrics.completeness}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Accuracy</p>
              <p className={`text-2xl font-bold ${getQualityColor(latestMetrics.accuracy)}`}>
                {latestMetrics.accuracy}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Timeliness</p>
              <p className={`text-2xl font-bold ${getQualityColor(latestMetrics.timeliness)}`}>
                {latestMetrics.timeliness}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Consistency</p>
              <p className={`text-2xl font-bold ${getQualityColor(latestMetrics.consistency)}`}>
                {latestMetrics.consistency}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Trends and Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Quality Trends (7 Days)
            </CardTitle>
            <CardDescription>Pergerakan metrik kualitas dari waktu ke waktu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityMetricsHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completeness" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="timeliness" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="consistency" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Dimensions</CardTitle>
            <CardDescription>Multi-dimensional view of current quality</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Radar name="Quality Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quality Dimension Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            Quality Dimension Definitions
          </CardTitle>
          <CardDescription>Bagaimana setiap dimensi kualitas diukur dan dihitung</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <p className="font-semibold text-blue-900">Completeness</p>
            </div>
            <p className="text-sm text-blue-700">
              Persentase nilai non-null per kolom. Dihitung sebagai: (total_non_null / total_records) × 100.
              Missing values diidentifikasi berdasarkan missing_value_indicator di schema.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <p className="font-semibold text-green-900">Accuracy</p>
            </div>
            <p className="text-sm text-green-700">
              Margin of error dan confidence intervals dari data collection. Untuk sensor data, diukur dengan kalibrasi
              terhadap reference stations. Survey data menggunakan sampling error estimates.
            </p>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <p className="font-semibold text-orange-900">Timeliness</p>
            </div>
            <p className="text-sm text-orange-700">
              Latency dari kejadian nyata sampai data tersedia di platform. Dihitung sebagai: 
              100 - (average_latency_minutes / max_acceptable_latency × 100). Real-time data target {'<'} 10 min.
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <p className="font-semibold text-purple-900">Consistency</p>
            </div>
            <p className="text-sm text-purple-700">
              Persentase records yang memenuhi consistency rules dan validation constraints.
              Contoh: timestamp {'<='} current_time, geographic codes valid, logical relationships terpenuhi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dataset-level Quality Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Quality Breakdown</CardTitle>
          <CardDescription>Completeness scores per dataset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {datasetQualityBreakdown.map((ds) => {
            const badge = getQualityBadge(ds.completeness);
            const Icon = badge.icon;
            
            return (
              <div key={ds.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ds.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">{ds.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${getQualityColor(ds.completeness)}`}>
                      {ds.completeness}%
                    </span>
                    <Badge variant={badge.variant} className="gap-1">
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </Badge>
                  </div>
                </div>
                <Progress value={ds.completeness} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quality Checks Performed */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Quality Checks</CardTitle>
          <CardDescription>Pipeline otomatis melakukan checks berikut pada setiap ingestion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Schema Validation</p>
                <p className="text-sm text-green-700">Verifikasi tipe data, format, dan struktur kolom</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Outlier Detection</p>
                <p className="text-sm text-green-700">Deteksi nilai anomali menggunakan IQR dan z-score</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Duplicate Detection</p>
                <p className="text-sm text-green-700">Identifikasi dan remove duplicate records berdasarkan primary key</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Referential Integrity</p>
                <p className="text-sm text-green-700">Validasi foreign keys dan cross-table relationships</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Range Validation</p>
                <p className="text-sm text-green-700">Cek nilai berada dalam range yang diharapkan (min/max)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Freshness Check</p>
                <p className="text-sm text-green-700">Monitoring latency dan update frequency sesuai SLA</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
