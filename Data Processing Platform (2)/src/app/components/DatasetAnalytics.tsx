import { APSAnalytics } from "./APSAnalytics";
import { RLSHLSAnalytics } from "./RLSHLSAnalytics";
import { KemiskinanAnalytics } from "./KemiskinanAnalytics";
import { PovertyAnalytics } from "./PovertyAnalytics";
import { PDRBAnalytics } from "./PDRBAnalytics";
import { AHHAnalytics } from "./AHHAnalytics";
import { getMethodology, hasAnalytics } from "../config/analyticsMethodology";
import type { Dataset } from "../data/mockDataBPS";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, BookOpen, Target } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DatasetAnalyticsProps {
  dataset: Dataset;
}

/**
 * DatasetAnalytics - Universal analytics component
 * Routes to specific analytics implementation based on dataset ID
 * Displays methodology documentation for transparency
 */
export function DatasetAnalytics({ dataset }: DatasetAnalyticsProps) {
  // Check if analytics is supported for this dataset
  if (!hasAnalytics(dataset.id)) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analytics Belum Tersedia</AlertTitle>
        <AlertDescription>
          Analisis lanjutan untuk dataset ini sedang dalam pengembangan.
          Gunakan visualisasi data standar di tab "Data & Chart".
        </AlertDescription>
      </Alert>
    );
  }

  const methodology = getMethodology(dataset.id);

  if (!methodology) return null;

  return (
    <Tabs defaultValue="analytics" className="space-y-4">
      <TabsList>
        <TabsTrigger value="analytics">Analisis Interaktif</TabsTrigger>
        <TabsTrigger value="methodology" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Metodologi
        </TabsTrigger>
      </TabsList>

      {/* Analytics Tab - Shown First */}
      <TabsContent value="analytics" className="space-y-6">
        {/* Methodology Running Indicator */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                Metodologi Analisis Tetap Aktif
              </p>
              <p className="text-xs text-green-700">
                Semua analisis menggunakan formula yang telah divalidasi dan terdokumentasi. 
                <button 
                  onClick={() => {
                    const methodologyTab = document.querySelector('[value="methodology"]') as HTMLElement;
                    if (methodologyTab) methodologyTab.click();
                  }}
                  className="underline ml-1 hover:text-green-900 font-medium"
                >
                  Lihat metodologi →
                </button>
              </p>
            </div>
            <div className="flex-shrink-0">
              <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                {methodology.analyses.length} Analisis
              </Badge>
            </div>
          </div>
        </div>

        {/* Route to specific analytics implementation */}
        {dataset.id === "bps-edu-001" && <APSAnalytics dataset={dataset} />}
        {dataset.id === "bps-edu-002" && <RLSHLSAnalytics dataset={dataset} />}
        {dataset.id === "bps-health-001" && <AHHAnalytics dataset={dataset} />}
        {dataset.id === "bps-econ-001" && <PDRBAnalytics dataset={dataset} />}
        {dataset.id === "bps-econ-003" && <PovertyAnalytics dataset={dataset} />}
        {dataset.id === "bps-econ-004" && <KemiskinanAnalytics dataset={dataset} />}
        
        {/* Placeholder for other datasets - will be implemented */}
        {!["bps-edu-001", "bps-edu-002", "bps-health-001", "bps-econ-001", "bps-econ-003", "bps-econ-004"].includes(dataset.id) && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Implementasi Dalam Pengembangan</AlertTitle>
            <AlertDescription className="text-amber-800">
              Metodologi untuk dataset ini sudah didefinisikan dan terdokumentasi. 
              Implementasi visualisasi interaktif sedang dalam proses development.
              Lihat tab "Metodologi" untuk detail formula dan interpretasi yang akan diterapkan.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {/* Methodology Tab - Background */}
      <TabsContent value="methodology" className="space-y-6">
        {/* Methodology Documentation */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BookOpen className="w-5 h-5" />
              Metodologi Analisis Tetap (Fixed Methodology)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900 mb-3">
                <strong>Dataset:</strong> {methodology.datasetName}
              </p>
              <p className="text-sm text-blue-800 mb-4">
                Setiap dataset memiliki metodologi analisis yang tetap dan terdokumentasi untuk memastikan 
                konsistensi, akurasi, dan reproducibility. Berikut adalah 3 analisis utama yang diterapkan:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {methodology.analyses.map((analysis, idx) => (
                  <div key={analysis.id} className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Analisis {idx + 1}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{analysis.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{analysis.description}</p>
                    <div className="bg-gray-50 rounded px-2 py-1 mb-2">
                      <code className="text-xs text-blue-600">{analysis.formula}</code>
                    </div>
                    {analysis.unit && (
                      <p className="text-xs text-gray-500 mb-2">Unit: {analysis.unit}</p>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-green-700">
                        ✓ <strong>Good:</strong> {analysis.interpretation.good}
                      </p>
                      <p className="text-xs text-amber-700">
                        ◆ <strong>Medium:</strong> {analysis.interpretation.medium}
                      </p>
                      <p className="text-xs text-red-700">
                        ✗ <strong>Bad:</strong> {analysis.interpretation.bad}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Composite Scoring Methodology */}
            <div className="bg-white/80 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Composite Scoring Formula</h4>
              </div>
              <p className="text-sm text-purple-800 mb-2">
                <strong>Formula:</strong> {methodology.compositeScoring.formula}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {methodology.compositeScoring.weights.map((w) => (
                  <Badge key={w.metric} variant="secondary" className="text-xs">
                    {w.metric}: {(w.weight * 100).toFixed(0)}%
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-600">
                <strong>Normalisasi:</strong> {methodology.compositeScoring.normalization}
              </p>
            </div>

            {/* Clustering Methodology */}
            <div className="bg-white/80 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Clustering Methodology</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Method:</span>
                  <p className="font-medium text-gray-900">{methodology.clustering.method}</p>
                </div>
                <div>
                  <span className="text-gray-600">Clusters:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {methodology.clustering.clusters.map((cluster) => (
                      <Badge key={cluster} variant="outline" className="text-xs">
                        {cluster}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Criteria:</span>
                  <p className="font-medium text-gray-900">{methodology.clustering.criteria}</p>
                </div>
              </div>
            </div>

            {/* Scientific References */}
            <div className="bg-white/80 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Scientific Basis & Standards</h4>
              <div className="text-xs text-gray-700 space-y-1">
                {dataset.id === "bps-edu-001" && (
                  <>
                    <p>• <strong>Gender Parity Index:</strong> UNESCO Education for All Global Monitoring Report Standards</p>
                    <p>• <strong>Participation Rates:</strong> Sustainable Development Goal 4 (Quality Education)</p>
                    <p>• <strong>Statistical Methods:</strong> Min-Max Normalization, Percentile-based Clustering</p>
                  </>
                )}
                {dataset.id === "bps-edu-002" && (
                  <>
                    <p>• <strong>Education Gap Analysis:</strong> HDI methodology for measuring education expectations</p>
                    <p>• <strong>Gender Gap:</strong> UNDP Gender Development Index standards</p>
                    <p>• <strong>SDG Target:</strong> SDG 4.6 - Literacy and numeracy skills for all by 2030</p>
                  </>
                )}
                {dataset.id === "bps-health-002" && (
                  <>
                    <p>• <strong>Stunting Classification:</strong> WHO Child Growth Standards 2006</p>
                    <p>• <strong>Prevalence Thresholds:</strong> WHO Public Health Significance Cutoffs</p>
                    <p>• <strong>SDG Target:</strong> SDG 2.2 - End all forms of malnutrition by 2030</p>
                  </>
                )}
                {dataset.id === "bps-econ-001" && (
                  <>
                    <p>• <strong>Growth Analysis:</strong> Standard economic growth accounting</p>
                    <p>• <strong>Diversification:</strong> Herfindahl-Hirschman Index (HHI)</p>
                    <p>• <strong>Convergence:</strong> Beta-convergence regression analysis</p>
                  </>
                )}
                {dataset.id === "bps-econ-004" && (
                  <>
                    <p>• <strong>Poverty Measurement:</strong> World Bank poverty assessment methodology</p>
                    <p>• <strong>SDG Target:</strong> SDG 1.2 - Reduce poverty by at least half by 2030</p>
                    <p>• <strong>Rural-Urban Analysis:</strong> Spatial inequality measures</p>
                  </>
                )}
                {dataset.id === "bps-econ-003" && (
                  <>
                    <p>• <strong>Poverty Measurement:</strong> World Bank poverty assessment methodology</p>
                    <p>• <strong>SDG Target:</strong> SDG 1.2 - Reduce poverty by at least half by 2030</p>
                    <p>• <strong>Rural-Urban Analysis:</strong> Spatial inequality measures</p>
                  </>
                )}
                {dataset.id === "bps-econ-002" && (
                  <>
                    <p>• <strong>Herfindahl-Hirschman Index (HHI):</strong> Standard economic diversification measure</p>
                    <p>• <strong>SDG Target:</strong> SDG 8.2 - Achieve higher levels of economic productivity</p>
                    <p>• <strong>Interpretation:</strong> Higher HHI indicates less diversification, lower HHI indicates more diversification</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}