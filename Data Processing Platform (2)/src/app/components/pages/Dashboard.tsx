import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Database, TrendingUp, Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { mockDatasets, mockPipelines, qualityMetricsHistory } from "../../data/mockDataBPS";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "react-router";

export function Dashboard() {
  const totalDatasets = mockDatasets.length;
  const activePipelines = mockPipelines.filter(p => p.status === "running").length;
  const successRate = (mockPipelines.filter(p => p.status === "success").length / mockPipelines.length * 100).toFixed(1);
  const avgQuality = (qualityMetricsHistory[qualityMetricsHistory.length - 1].completeness +
    qualityMetricsHistory[qualityMetricsHistory.length - 1].accuracy +
    qualityMetricsHistory[qualityMetricsHistory.length - 1].timeliness +
    qualityMetricsHistory[qualityMetricsHistory.length - 1].consistency) / 4;

  const categoryStats = mockDatasets.reduce((acc, ds) => {
    acc[ds.category] = (acc[ds.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Evidence-Driven Decisions for a Better Society
            </h1>
            <p className="text-xl text-white/90 font-light">
              Empowering Smarter Communities.
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm flex flex-col items-center gap-2 animate-bounce">
          <span>↓</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7dd0f1] to-[#f458d1] bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-gray-600 mt-1">Summary of education, health and economic data catalog and analytics platform</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Dataset</CardTitle>
                <Database className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDatasets}</div>
                <p className="text-xs text-gray-500 mt-1">Across {Object.keys(categoryStats).length} categories</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pipeline Aktif</CardTitle>
                <Activity className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePipelines}</div>
                <p className="text-xs text-gray-500 mt-1">Real-time ingestion running</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Success Rate</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successRate}%</div>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Kualitas Rata-rata</CardTitle>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgQuality.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 mt-1">Across all dimensions</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Trend */}
            <Card className="shadow-lg border-2 border-blue-100">
              <CardHeader>
                <CardTitle>Trend Kualitas Data</CardTitle>
                <CardDescription>7 hari terakhir - completeness, accuracy, timeliness, consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityMetricsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completeness" stroke="#3b82f6" strokeWidth={2} name="Completeness" />
                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Accuracy" />
                    <Line type="monotone" dataKey="timeliness" stroke="#f59e0b" strokeWidth={2} name="Timeliness" />
                    <Line type="monotone" dataKey="consistency" stroke="#8b5cf6" strokeWidth={2} name="Consistency" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dataset by Category */}
            <Card className="shadow-lg border-2 border-purple-100">
              <CardHeader>
                <CardTitle>Dataset per Kategori</CardTitle>
                <CardDescription>Distribusi dataset berdasarkan sektor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Jumlah Dataset" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Pipeline Activity */}
          <Card className="shadow-lg border-2 border-pink-100">
            <CardHeader>
              <CardTitle>Aktivitas survey Terkini</CardTitle>
              <CardDescription>Status eksekusi pipeline ingestion data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPipelines.map((pipeline) => (
                  <div key={pipeline.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{pipeline.pipelineName}</h4>
                        <Badge variant={
                          pipeline.status === "success" ? "default" :
                          pipeline.status === "running" ? "secondary" :
                          pipeline.status === "failed" ? "destructive" : "outline"
                        }>
                          {pipeline.status === "success" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {pipeline.status === "running" && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                          {pipeline.status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {pipeline.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {pipeline.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Records: {pipeline.recordsProcessed.toLocaleString()}</span>
                        <span>Quality: {pipeline.qualityScore}%</span>
                        <span>Started: {new Date(pipeline.startTime).toLocaleTimeString('id-ID')}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/datasets/${pipeline.datasetId}`}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View Dataset
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/datasets">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200">
                <CardHeader>
                  <Database className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Browse Datasets</CardTitle>
                  <CardDescription>Jelajahi katalog dataset dengan metadata lengkap</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/pipelines">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200">
                <CardHeader>
                  <Activity className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle>Manage Pipelines</CardTitle>
                  <CardDescription>Monitor dan kelola pipeline ingestion data</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/analytics">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200">
                <CardHeader>
                  <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                  <CardTitle>Explore Analytics</CardTitle>
                  <CardDescription>Analisis historis dan real-time dengan explainability</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}