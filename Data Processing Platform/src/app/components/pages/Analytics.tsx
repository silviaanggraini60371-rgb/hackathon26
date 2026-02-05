import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  analyticsDataAPSEducation, 
  analyticsDataStunting, 
  analyticsDataPDRB,
  analyticsDataTPT,
  analyticsDataKemiskinan,
  mockDatasets 
} from "../../data/mockDataBPS";
import { TrendingUp, Activity, Info, AlertCircle } from "lucide-react";

export function Analytics() {
  const [selectedDataset, setSelectedDataset] = useState("ds-001");

  const getAnalyticsData = (datasetId: string) => {
    switch (datasetId) {
      case "bps-edu-001": return analyticsDataAPSEducation;
      case "bps-health-002": return analyticsDataStunting;
      case "bps-econ-001": return analyticsDataPDRB;
      case "bps-econ-002": return analyticsDataTPT;
      case "bps-econ-004": return analyticsDataKemiskinan;
      default: return analyticsDataAPSEducation;
    }
  };

  const dataset = mockDatasets.find(d => d.id === selectedDataset);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Data Analytics & Exploration</h2>
        <p className="text-gray-500 mt-1">
          Analisis historis dan real-time dengan explainable insights
        </p>
      </div>

      {/* Dataset Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Dataset</CardTitle>
          <CardDescription>Pilih dataset untuk analisis dan eksplorasi</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockDatasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  {ds.title} ({ds.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dataset && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">Dataset Information</p>
                  <p className="text-sm text-blue-700">{dataset.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{dataset.temporalGranularity}</Badge>
                    <Badge variant="secondary">{dataset.format}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="realtime">Real-time View</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Historical Trends */}
        <TabsContent value="trends" className="space-y-4">
          {selectedDataset === "bps-edu-001" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Trend Angka Partisipasi Sekolah 2016-2025</CardTitle>
                  <CardDescription>APS menurut kelompok umur (SD, SMP, SMA, PT)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={analyticsDataAPSEducation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tahun" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="aps_7_12" stroke="#3b82f6" strokeWidth={2} name="APS 7-12 th (SD)" />
                      <Line type="monotone" dataKey="aps_13_15" stroke="#10b981" strokeWidth={2} name="APS 13-15 th (SMP)" />
                      <Line type="monotone" dataKey="aps_16_18" stroke="#f59e0b" strokeWidth={2} name="APS 16-18 th (SMA)" />
                      <Line type="monotone" dataKey="aps_19_24" stroke="#8b5cf6" strokeWidth={2} name="APS 19-24 th (PT)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Explainability Card */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Explainable Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Pencapaian APS SD Mendekati Universal</p>
                      <p className="text-sm text-purple-700 mt-1">
                        APS kelompok umur 7-12 tahun (SD) mencapai 99.65% pada 2025, menandakan keberhasilan program wajib belajar 9 tahun.
                        Namun APS 16-18 th (SMA) masih 83.54%, menunjukkan dropout rate signifikan di jenjang menengah atas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Data Derivation</p>
                      <p className="text-sm text-purple-700 mt-1">
                        APS = (Jumlah penduduk usia X yang bersekolah / Total penduduk usia X) × 100.
                        Data bersumber dari Susenas dengan multi-stage stratified sampling ~300.000 RT.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Quality Validation</p>
                      <p className="text-sm text-purple-700 mt-1">
                        Completeness: 98.5% | Sampling error {'<'} 5% nasional, {'<'} 10% provinsi | Konsisten dengan data Dapodik
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedDataset === "bps-health-002" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Trend Prevalensi Stunting 2020-2025</CardTitle>
                  <CardDescription>Persentase balita stunting di berbagai provinsi</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsDataStunting}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="provinsi" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 50]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stunting_2020" fill="#ef4444" name="Stunting 2020 (%)" />
                      <Bar dataKey="stunting_2023" fill="#f59e0b" name="Stunting 2023 (%)" />
                      <Bar dataKey="stunting_2025" fill="#10b981" name="Stunting 2025 (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Explainable Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Penurunan Stunting Signifikan di NTT</p>
                      <p className="text-sm text-purple-700 mt-1">
                        NTT berhasil menurunkan stunting dari 42.5% (2020) menjadi 34.8% (2025), penurunan 7.7 poin persentase.
                        Ini hasil dari program intervensi gizi spesifik dan sensitif yang intensif di daerah prioritas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Methodology</p>
                      <p className="text-sm text-purple-700 mt-1">
                        Pengukuran antropometri langsung (tinggi badan, berat badan) dari Survei Status Gizi Indonesia (SSGI).
                        Z-score dihitung dengan WHO Child Growth Standards, cutoff stunting: TB/U {'<'} -2 SD.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {(selectedDataset === "bps-econ-001" || selectedDataset === "bps-econ-002" || selectedDataset === "bps-econ-003" || selectedDataset === "bps-econ-004") && (
            <>
              {selectedDataset === "bps-econ-001" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pertumbuhan Ekonomi Indonesia 2016-2025</CardTitle>
                    <CardDescription>Pertumbuhan PDRB (%) atas dasar harga konstan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analyticsDataPDRB}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tahun" />
                        <YAxis domain={[-3, 6]} />
                        <Tooltip />
                        <Bar dataKey="pertumbuhan" fill="#3b82f6" name="Pertumbuhan PDRB (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              
              {selectedDataset === "bps-econ-002" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tingkat Pengangguran Terbuka (TPT) 2016-2025</CardTitle>
                    <CardDescription>TPT dan TPAK semesteran dari Sakernas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={analyticsDataTPT}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tahun" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={80} />
                        <YAxis yAxisId="left" domain={[0, 10]} />
                        <YAxis yAxisId="right" orientation="right" domain={[60, 75]} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="tpt" stroke="#ef4444" strokeWidth={2} name="TPT (%)" />
                        <Line yAxisId="right" type="monotone" dataKey="tpak" stroke="#3b82f6" strokeWidth={2} name="TPAK (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              
              {selectedDataset === "bps-econ-004" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Kemiskinan dan Ketimpangan 2016-2025</CardTitle>
                    <CardDescription>Persentase penduduk miskin (P0) dan Gini Ratio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={analyticsDataKemiskinan}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tahun" />
                        <YAxis yAxisId="left" domain={[8, 12]} />
                        <YAxis yAxisId="right" orientation="right" domain={[0.35, 0.42]} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="p0" stroke="#10b981" strokeWidth={2} name="Kemiskinan P0 (%)" />
                        <Line yAxisId="right" type="monotone" dataKey="gini" stroke="#f59e0b" strokeWidth={2} name="Gini Ratio" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Explainable Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Dampak Pandemi COVID-19</p>
                      <p className="text-sm text-purple-700 mt-1">
                        Tahun 2020 menunjukkan kontraksi ekonomi -2.07%, TPT melonjak ke 7.07%, dan kemiskinan naik menjadi 9.78%.
                        Recovery dimulai 2021 dengan pertumbuhan 3.70% dan TPT menurun bertahap ke 4.87% (2025).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">Data Sources</p>
                      <p className="text-sm text-purple-700 mt-1">
                        PDRB dari kompilasi survei ekonomi BPS (industri, perdagangan, jasa). TPT dari Sakernas (75.000 RT).
                        Kemiskinan dari Susenas konsumsi (300.000 RT). Semua menggunakan sampling probability terstruktur.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Real-time View */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600 animate-pulse" />
                Real-time Data Stream
              </CardTitle>
              <CardDescription>Live data updates with streaming ingestion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-600 mb-1">Stream Status</p>
                  <p className="text-lg font-bold text-green-700">ACTIVE</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 mb-1">Records/sec</p>
                  <p className="text-lg font-bold text-blue-700">1,248</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs text-purple-600 mb-1">Latency</p>
                  <p className="text-lg font-bold text-purple-700">5.2s</p>
                </div>
              </div>

              {selectedDataset === "bps-edu-001" && (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analyticsDataAPSEducation.slice(-5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" />
                    <YAxis domain={[95, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="aps_7_12" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="APS SD" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {selectedDataset === "bps-econ-002" && (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analyticsDataTPT.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" tick={{ fontSize: 10 }} />
                    <YAxis domain={[4, 8]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="tpt" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="TPT (%)" />
                  </LineChart>
                </ResponsiveContainer>
              )}

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Real-time Processing</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Data streaming dari {dataset?.spatialGranularity || 'multiple sensors'} dengan {dataset?.timeliness || 'low latency'}.
                      Pipeline otomatis melakukan quality checks dan transformasi sebelum visualization.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Automated pattern detection and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <p className="font-medium text-blue-900 mb-2">📊 Trend Analysis</p>
                <p className="text-sm text-blue-700">
                  Dataset menunjukkan pola cyclical dengan peak activity pada jam tertentu. 
                  Variabilitas meningkat 23% dibandingkan periode sebelumnya.
                </p>
              </div>

              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <p className="font-medium text-green-900 mb-2">✅ Data Quality</p>
                <p className="text-sm text-green-700">
                  Completeness: {dataset?.completeness}% | Consistency checks passed | 
                  {dataset?.accuracy ? ` Accuracy: ${dataset.accuracy}` : ' No quality issues detected'}
                </p>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <p className="font-medium text-purple-900 mb-2">🔍 Recommended Actions</p>
                <ul className="text-sm text-purple-700 space-y-1 ml-4 list-disc">
                  {dataset?.recommendedTransforms.map((transform, idx) => (
                    <li key={idx}>{transform}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                <p className="font-medium text-orange-900 mb-2">⚡ Use Cases</p>
                <ul className="text-sm text-orange-700 space-y-1 ml-4 list-disc">
                  {dataset?.useCases.map((useCase, idx) => (
                    <li key={idx}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Explainability Framework */}
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Explainability Framework
              </CardTitle>
              <CardDescription>How insights are derived from data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 mb-2">1. Data Collection</p>
                <p className="text-sm text-gray-600">
                  {dataset?.collectionMethod} menggunakan {dataset?.tools}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">2. Quality Validation</p>
                <p className="text-sm text-gray-600">
                  Completeness: {dataset?.completeness}% | Accuracy: {dataset?.accuracy} | Timeliness: {dataset?.timeliness}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">3. Transformation Pipeline</p>
                <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded font-mono">
                  {dataset?.lineage}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">4. Analytics Output</p>
                <p className="text-sm text-gray-600">
                  Visualizations derived from validated data using statistical aggregations and time-series analysis.
                  All metrics traceable to source data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
