import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { qualityMetricsHistory } from "../../data/mockDataBPS";
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShieldCheck, TrendingUp, Info } from "lucide-react";
import { useQualityMetrics } from "../../hooks/useQualityMetrics";
import { QUALITY_DIMENSIONS, AUTOMATED_CHECKS } from "../../data/qualityData";
import { QualityDimensionCard } from "../quality/QualityDimensionCard";
import { QualityCheckItem } from "../quality/QualityCheckItem";
import { MetricCard } from "../quality/MetricCard";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";

export function QualityDashboard() {
  const {
    latestMetrics,
    avgQuality,
    datasetQualityBreakdown,
    getQualityColor,
    getQualityBadge,
    overallBadge
  } = useQualityMetrics();

  const OverallIcon = overallBadge.icon;

  const radarData = [
    { dimension: 'Completeness', value: latestMetrics.completeness },
    { dimension: 'Accuracy', value: latestMetrics.accuracy },
    { dimension: 'Timeliness', value: latestMetrics.timeliness },
    { dimension: 'Consistency', value: latestMetrics.consistency },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 lg:py-12 rounded-lg">
        <h2 className="text-3xl font-bold text-white">Data Quality Dashboard</h2>
        <p className="text-white/90 mt-1">
          Monitor kualitas data across completeness, accuracy, timeliness, dan consistency
        </p>
      </div>

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-white shadow-lg">
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
            <MetricCard label="Completeness" value={latestMetrics.completeness} colorClass={getQualityColor(latestMetrics.completeness)} />
            <MetricCard label="Accuracy" value={latestMetrics.accuracy} colorClass={getQualityColor(latestMetrics.accuracy)} />
            <MetricCard label="Timeliness" value={latestMetrics.timeliness} colorClass={getQualityColor(latestMetrics.timeliness)} />
            <MetricCard label="Consistency" value={latestMetrics.consistency} colorClass={getQualityColor(latestMetrics.consistency)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            Quality Dimension Definitions
          </CardTitle>
          <CardDescription>Bagaimana setiap dimensi kualitas diukur dan dihitung</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUALITY_DIMENSIONS.map((dim, idx) => (
            <QualityDimensionCard key={idx} dimension={dim} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dataset Quality Breakdown</CardTitle>
          <CardDescription>Completeness scores per dataset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {datasetQualityBreakdown.map((ds: { completeness: | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; category: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => {
            const completeness = Number(ds.completeness) || 0;
            const badge = getQualityBadge(completeness);
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
                    <span className={`text-sm font-bold ${getQualityColor(completeness)}`}>
                      {completeness}%
                    </span>
                    <Badge variant={badge.variant} className="gap-1">
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </Badge>
                  </div>
                </div>
                <Progress value={completeness} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automated Quality Checks</CardTitle>
          <CardDescription>Pipeline otomatis melakukan checks berikut pada setiap ingestion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUTOMATED_CHECKS.map((check, idx) => (
              <QualityCheckItem key={idx} check={check} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}