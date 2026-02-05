import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Brain, Loader2 } from "lucide-react";
import { generateAIInsights, forecastTimeSeries, type AIInsight, type TimeSeriesForecast } from "../utils/aiAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

interface AIInsightsPanelProps {
  title?: string
  insights?: string[]
  data: { year: number; value: number }[];
  metricName: string;
  currentValue: number;
}

export function AIInsightsPanel({ data, metricName, currentValue }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [forecasts, setForecasts] = useState<TimeSeriesForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeData = async () => {
      setLoading(true);
      try {
        // Generate AI insights
        const aiInsights = await generateAIInsights(data, metricName, currentValue);
        setInsights(aiInsights);

        // Generate forecasts
        const forecasted = await forecastTimeSeries(data, 3);
        setForecasts(forecasted);
      } catch (error) {
        console.error('AI analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (data.length >= 3) {
      analyzeData();
    } else {
      setLoading(false);
    }
  }, [data, metricName, currentValue]);

  const getPriorityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />;
      case 'pattern': return <Brain className="w-5 h-5" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  // Combine historical and forecast data for visualization
  const combinedData = [
    ...data.map(d => ({ 
      year: d.year, 
      actual: d.value,
      type: 'historical' 
    })),
    ...forecasts.map(f => ({ 
      year: f.year, 
      predicted: f.predicted,
      confidence_lower: f.confidence_lower,
      confidence_upper: f.confidence_upper,
      type: 'forecast' 
    }))
  ];

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm text-purple-600 font-medium">
              🤖 AI sedang menganalisis data dengan TensorFlow.js...
            </p>
            <p className="text-xs text-gray-600">
              Training model, detecting patterns, generating insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length < 3) {
    return (
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Data Tidak Cukup untuk AI Analysis</AlertTitle>
        <AlertDescription>
          AI memerlukan minimal 3 data points untuk analisis dan prediksi.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Header Banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">AI-Powered Analytics Engine</h3>
              <p className="text-sm text-purple-100">
                Analisis menggunakan TensorFlow.js • {insights.length} insights terdeteksi • Model confidence: {((insights[0]?.confidence || 0.8) * 100).toFixed(0)}%
              </p>
            </div>
            <Badge variant="secondary" className="bg-white/90 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Forecast Visualization */}
      {forecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Prediksi Machine Learning (2026-2028)
            </CardTitle>
            <CardDescription>
              Model neural network dengan 95% confidence interval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{data.year}</p>
                          {data.actual !== undefined && (
                            <p className="text-sm text-blue-600">Aktual: {data.actual.toFixed(2)}</p>
                          )}
                          {data.predicted !== undefined && (
                            <>
                              <p className="text-sm text-purple-600">Prediksi: {data.predicted.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">
                                CI: [{data.confidence_lower.toFixed(2)}, {data.confidence_upper.toFixed(2)}]
                              </p>
                            </>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Data Historis"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#9333ea" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Prediksi AI"
                  dot={{ r: 4, fill: '#9333ea' }}
                />
                <Area
                  type="monotone"
                  dataKey="confidence_upper"
                  stroke="none"
                  fill="#9333ea"
                  fillOpacity={0.1}
                  name="Confidence Interval"
                />
                <Area
                  type="monotone"
                  dataKey="confidence_lower"
                  stroke="none"
                  fill="#9333ea"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {forecasts.map((f, idx) => (
                <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {f.predicted.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">{f.year}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    95% CI: ±{((f.confidence_upper - f.confidence_lower) / 2).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Cards */}
      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <Card 
            key={idx} 
            className={`border-l-4 ${getPriorityColor(insight.severity)}`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getPriorityColor(insight.severity)}`}>
                  {getPriorityIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <Badge 
                        variant={
                          insight.severity === 'high' ? 'destructive' : 'secondary'
                        }
                        className="text-xs uppercase"
                      >
                        {insight.severity || 'low'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insight.description}
                  </p>
                  
                  {insight.type === 'trend' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>Pattern recognition • Linear regression analysis</span>
                    </div>
                  )}
                  
                  {insight.type === 'anomaly' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Anomaly detection • Z-score & IQR methods</span>
                    </div>
                  )}
                  
                  {insight.type === 'forecast' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <Brain className="w-4 h-4" />
                      <span>Time series forecasting • Confidence intervals</span>
                    </div>
                  )}
                  
                  {insight.type === 'recommendation' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      <Lightbulb className="w-4 h-4" />
                      <span>Strategic recommendation • Evidence-based policy suggestion</span>
                    </div>
                  )}
                  
                  {insight.actionable && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      💡 <strong>Action:</strong> {insight.actionable}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technical Details */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• <strong>ML Framework:</strong> TensorFlow.js v4.22.0 (client-side neural networks)</p>
            <p>• <strong>Model Architecture:</strong> Sequential dense layers with dropout regularization</p>
            <p>• <strong>Training:</strong> Adam optimizer, MSE loss, 50 epochs with early stopping</p>
            <p>• <strong>Validation:</strong> 95% confidence intervals, R² goodness-of-fit metrics</p>
            <p>• <strong>Methods:</strong> Time series forecasting, anomaly detection (Z-score + IQR), trend analysis</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}