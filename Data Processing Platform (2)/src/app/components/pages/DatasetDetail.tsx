import { useParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { mockDatasets } from "../../data/mockDataBPS";
import { 
  ArrowLeft, Database, Calendar, MapPin, FileText, Shield, 
  Users, Link2, Download, CheckCircle, AlertCircle, Info, FileDown 
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { exportToCSV, exportToJSON, exportToExcel, exportMetadata } from "../../utils/dataExport";
import { DataVisualization } from "../DataVisualization";
import { DatasetAnalytics } from "../DatasetAnalytics";

export function DatasetDetail() {
  const { id } = useParams();
  const dataset = mockDatasets.find(d => d.id === id);

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset Not Found</h2>
        <p className="text-gray-500 mb-4">Dataset dengan ID "{id}" tidak ditemukan</p>
        <Link to="/datasets" className="text-blue-600 hover:text-blue-700">
          ← Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/datasets" className="text-[#7dd0f1] hover:text-[#f458d1] flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Datasets
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{dataset.title}</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 lg:py-12 rounded-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-white text-purple-600 border-white">{dataset.category}</Badge>
              <Badge variant="outline" className="text-white border-white">{dataset.license}</Badge>
              <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                <CheckCircle className="w-3 h-3" />
                {dataset.completeness}% Complete
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{dataset.title}</h1>
            <p className="text-white/90">{dataset.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 bg-white text-purple-600 hover:bg-white/90">
                <Download className="w-4 h-4" />
                Download Dataset
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportToCSV(dataset, 1000)}>
                <FileDown className="w-4 h-4 mr-2" />
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToJSON(dataset, 1000)}>
                <FileDown className="w-4 h-4 mr-2" />
                Download as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(dataset, 1000)}>
                <FileDown className="w-4 h-4 mr-2" />
                Download as Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportMetadata(dataset)}>
                <Info className="w-4 h-4 mr-2" />
                Metadata Only (JSON)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Publisher</p>
            <p className="font-semibold text-sm">{dataset.publisher}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Format</p>
            <p className="font-semibold text-sm">{dataset.format}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">File Size</p>
            <p className="font-semibold text-sm">{dataset.fileSize}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Last Updated</p>
            <p className="font-semibold text-sm">{new Date(dataset.lastModified).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Detailed Metadata Tabs */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="data">Data & Chart</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {["bps-edu-001", "bps-edu-002", "bps-health-001", "bps-health-002", "bps-econ-001", "bps-econ-003", "bps-econ-004"].includes(dataset.id) && (
            <TabsTrigger value="analytics" className="bg-purple-50 data-[state=active]:bg-purple-600">
              Advanced Analytics
            </TabsTrigger>
          )}
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="provenance">Provenance</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
        </TabsList>

        {/* Data & Chart Tab */}
        <TabsContent value="data" className="space-y-4">
          <DataVisualization dataset={dataset} />
        </TabsContent>

        {/* Advanced Analytics Tab */}
        {["bps-edu-001", "bps-edu-002", "bps-health-001", "bps-health-002", "bps-econ-001", "bps-econ-003", "bps-econ-004"].includes(dataset.id) && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
              <p className="text-gray-600">
                Analisis lanjutan yang mengimplementasikan transformasi yang direkomendasikan untuk dataset ini
              </p>
            </div>
            <DatasetAnalytics dataset={dataset} />
          </TabsContent>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Spatio-Temporal Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Geographic Coverage</p>
                <p className="text-gray-900">{dataset.geographicCoverage}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Temporal Range</p>
                  <p className="text-gray-900">{dataset.dateRange.start} to {dataset.dateRange.end}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Temporal Granularity</p>
                  <p className="text-gray-900">{dataset.temporalGranularity}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Spatial Granularity</p>
                <p className="text-gray-900">{dataset.spatialGranularity}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Usage & Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Use Cases</p>
                <ul className="space-y-2">
                  {dataset.useCases.map((useCase, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recommended Transformations</p>
                <div className="flex flex-wrap gap-2">
                  {dataset.recommendedTransforms.map((transform, idx) => (
                    <Badge key={idx} variant="secondary">{transform}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Estimated Compute Requirements</p>
                <p className="text-gray-900">{dataset.estimatedCompute}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Keywords & Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dataset.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Schema</CardTitle>
              <CardDescription>Column definitions, data types, units, and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column Name</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Definition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.schema.map((col, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">{col.columnName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{col.dataType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{col.unit || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600">{col.definition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schema Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Primary Key</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{dataset.primaryKey}</code>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Missing Value Indicator</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{dataset.missingValueIndicator}</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>Preview of actual records from the dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(dataset.sampleData[0] || {}).map((key) => (
                        <TableHead key={key} className="font-mono text-xs">{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataset.sampleData.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((value, vIdx) => (
                          <TableCell key={vIdx} className="font-mono text-xs">
                            {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Metrics</CardTitle>
              <CardDescription>Quality assessment across multiple dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Completeness</p>
                    <p className="text-lg font-bold text-green-600">{dataset.completeness}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${dataset.completeness}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Percentage of non-missing values</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Accuracy</p>
                    <p className="text-sm font-semibold">{dataset.accuracy}</p>
                  </div>
                  <p className="text-xs text-gray-500">Error estimates and confidence intervals</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Timeliness</p>
                    <p className="text-sm font-semibold">{dataset.timeliness}</p>
                  </div>
                  <p className="text-xs text-gray-500">Latency from event to availability</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Consistency Rules</p>
                  <ul className="space-y-1">
                    {dataset.consistencyRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Provenance Tab */}
        <TabsContent value="provenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Data Collection & Methodology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Collection Method</p>
                <p className="text-gray-900">{dataset.collectionMethod}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Sampling Method</p>
                <p className="text-gray-900">{dataset.samplingMethod}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Tools & Versions</p>
                <p className="text-gray-900">{dataset.tools}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600" />
                Data Lineage & Transformation
              </CardTitle>
              <CardDescription>ETL pipeline and data transformation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-900">{dataset.lineage}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  This lineage provides explainability on how the data was processed and transformed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{dataset.contact.name}</p>
                  <p className="text-sm text-blue-600">{dataset.contact.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Endpoint configuration and authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Endpoint URL</p>
                <code className="block bg-gray-100 px-4 py-2 rounded text-sm break-all">
                  {dataset.endpoint}
                </code>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Authentication</p>
                  <p className="text-gray-900">{dataset.authentication}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Rate Limit</p>
                  <p className="text-gray-900">{dataset.rateLimit}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Storage Location</p>
                <p className="text-gray-900">{dataset.storageLocation}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Privacy & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Sensitivity Classification</p>
                <Badge variant={dataset.sensitivityClass === "Public" ? "default" : "destructive"}>
                  {dataset.sensitivityClass}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Anonymization</p>
                <p className="text-gray-900">{dataset.anonymization}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Legal Constraints</p>
                <p className="text-gray-900">{dataset.legalConstraints}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Licensing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{dataset.license}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Published: {new Date(dataset.published).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}