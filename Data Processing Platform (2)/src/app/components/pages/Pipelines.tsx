import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { mockPipelines, mockDatasets } from "../../data/mockDataBPS";
import { CheckCircle2, Activity, AlertCircle, Clock, Play, Pause, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function Pipelines() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "running": return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "pending": return <Clock className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStageProgress = (stages: any[]) => {
    const completed = stages.filter(s => s.status === "completed").length;
    return (completed / stages.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 lg:py-12 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold text-white">Data Ingestion Pipelines</h2>
          <p className="text-white/90 mt-1">
            Monitor automated ETL pipelines dengan quality checks dan transformasi
          </p>
        </div>
        <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg font-semibold">
          <Play className="w-4 h-4" />
          New Pipeline
        </button>
      </div>

      {/* Pipeline Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-2 border-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockPipelines.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
              Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {mockPipelines.filter(p => p.status === "running").length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {mockPipelines.filter(p => p.status === "success").length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {mockPipelines.filter(p => p.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline List */}
      <div className="space-y-4">
        {mockPipelines.map((pipeline) => {
          const dataset = mockDatasets.find(d => d.id === pipeline.datasetId);
          const progress = getStageProgress(pipeline.stages);

          return (
            <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{pipeline.pipelineName}</CardTitle>
                      <Badge variant={
                        pipeline.status === "success" ? "default" :
                        pipeline.status === "running" ? "secondary" :
                        pipeline.status === "failed" ? "destructive" : "outline"
                      }>
                        {getStatusIcon(pipeline.status)}
                        <span className="ml-1">{pipeline.status}</span>
                      </Badge>
                    </div>
                    {dataset && (
                      <CardDescription className="flex items-center gap-2">
                        Dataset: 
                        <Link to={`/datasets/${dataset.id}`} className="text-blue-600 hover:underline">
                          {dataset.title}
                        </Link>
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Pause className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Pipeline Progress</span>
                    <span className="font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Pipeline Stages */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Execution Stages:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {pipeline.stages.map((stage, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          stage.status === "completed" ? "bg-green-50 border-green-200" :
                          stage.status === "running" ? "bg-blue-50 border-blue-200" :
                          stage.status === "failed" ? "bg-red-50 border-red-200" :
                          "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {stage.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          {stage.status === "running" && <Activity className="w-4 h-4 text-blue-600 animate-pulse" />}
                          {stage.status === "failed" && <AlertCircle className="w-4 h-4 text-red-600" />}
                          {stage.status === "pending" && <Clock className="w-4 h-4 text-gray-400" />}
                          
                          <div className="flex-1">
                            <p className="font-medium text-sm">{stage.name}</p>
                            <p className="text-xs text-gray-600">{stage.details}</p>
                          </div>
                        </div>

                        {stage.duration && (
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {stage.duration}s
                            </Badge>
                          </div>
                        )}

                        {idx < pipeline.stages.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-300 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Records Processed</p>
                    <p className="text-lg font-bold">{pipeline.recordsProcessed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quality Score</p>
                    <p className="text-lg font-bold text-green-600">{pipeline.qualityScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Started</p>
                    <p className="text-sm font-semibold">
                      {new Date(pipeline.startTime).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Data Lineage Explanation */}
                {dataset && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-purple-900 mb-1">Data Lineage</p>
                        <p className="text-xs text-purple-700">{dataset.lineage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Architecture Info */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Capabilities</CardTitle>
          <CardDescription>Platform mendukung berbagai fitur untuk ingestion data otomatis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Structured & Semi-structured Data</p>
                <p className="text-sm text-gray-600">Mendukung CSV, JSON, Parquet, GeoJSON, XML, dan format lainnya</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Quality Checks</p>
                <p className="text-sm text-gray-600">Otomatis validasi schema, completeness, consistency, dan outlier detection</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Batch & Real-time</p>
                <p className="text-sm text-gray-600">Mendukung batch processing dan streaming ingestion untuk real-time data</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Metadata Management</p>
                <p className="text-sm text-gray-600">Otomatis ekstraksi metadata, lineage tracking, dan documentation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}