import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Dataset } from "../data/mockDataBPS";
import { TrendingUp, Table as TableIcon, Filter, ChevronDown, ArrowUpDown, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { AdvancedFilters } from "./AdvancedFilters";

interface FilterConfig {
  yearRange?: { start: number; end: number };
  valueRange?: { field: string; min: number; max: number };
  ranking?: { field: string; type: "top" | "bottom"; count: number };
  geoLevel?: "provinsi" | "kabupaten" | "kota" | "all";
  specificProvince?: string;
  categoryFilters?: Record<string, string>;
}

interface DataVisualizationProps {
  dataset: Dataset;
}

export function DataVisualization({ dataset }: DataVisualizationProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [filters, setFilters] = useState<FilterConfig>({ geoLevel: "all" });

  // Determine if dataset has time-series data
  const hasTimeSeriesData = dataset.sampleData.some(row => 'tahun' in row);
  
  // Get unique years and provinces from sample data
  const years = hasTimeSeriesData 
    ? Array.from(new Set(dataset.sampleData.map(row => row.tahun as number))).sort()
    : [];
  
  const provinces = dataset.sampleData.some(row => 'nama_provinsi' in row || 'provinsi' in row || 'nama_wilayah' in row)
    ? Array.from(new Set(dataset.sampleData.map(row => (row.nama_provinsi || row.provinsi || row.nama_wilayah) as string))).sort()
    : [];

  // Determine which numeric fields to plot
  const getNumericFields = () => {
    if (dataset.sampleData.length === 0) return [];
    
    const sample = dataset.sampleData[0];
    return Object.keys(sample).filter(key => {
      const value = sample[key];
      return typeof value === 'number' && 
             key !== 'tahun' && 
             key !== 'kode_provinsi' &&
             key !== 'row_id' &&
             !key.includes('jumlah');
    });
  };

  const numericFields = getNumericFields();

  // Apply advanced filters to data
  const applyAdvancedFilters = (data: any[]) => {
    let filtered = [...data];

    // Year range filter
    if (filters.yearRange && hasTimeSeriesData) {
      filtered = filtered.filter(row => {
        const tahun = row.tahun as number;
        return tahun >= filters.yearRange!.start && tahun <= filters.yearRange!.end;
      });
    }

    // Value range filter
    if (filters.valueRange) {
      const { field, min, max } = filters.valueRange;
      filtered = filtered.filter(row => {
        const value = row[field];
        return typeof value === 'number' && value >= min && value <= max;
      });
    }

    // Geographic level filter
    if (filters.geoLevel && filters.geoLevel !== "all") {
      filtered = filtered.filter(row => {
        const kode = String(row.kode_provinsi || row.kode_wilayah || "");
        if (filters.geoLevel === "provinsi") {
          return kode.length === 2;
        } else if (filters.geoLevel === "kabupaten") {
          return kode.length === 4 && !kode.startsWith("71") && !kode.startsWith("72");
        } else if (filters.geoLevel === "kota") {
          return kode.length === 4 && (kode.startsWith("71") || kode.startsWith("72"));
        }
        return true;
      });
    }

    // Specific province filter
    if (filters.specificProvince) {
      filtered = filtered.filter(row =>
        (row.nama_provinsi || row.provinsi || row.nama_wilayah) === filters.specificProvince
      );
    }

    // Ranking filter (top/bottom)
    if (filters.ranking) {
      const { field, type, count } = filters.ranking;
      
      // Get latest year data for ranking
      const latestYear = Math.max(...filtered.map(r => r.tahun || 0));
      const latestData = filtered.filter(r => !r.tahun || r.tahun === latestYear);
      
      // Calculate average per province
      const provinceMap = new Map<string, { sum: number; count: number }>();
      latestData.forEach(row => {
        const provinceName = row.nama_provinsi || row.provinsi || row.nama_wilayah;
        const value = row[field];
        if (provinceName && typeof value === 'number') {
          const existing = provinceMap.get(provinceName) || { sum: 0, count: 0 };
          provinceMap.set(provinceName, {
            sum: existing.sum + value,
            count: existing.count + 1,
          });
        }
      });

      // Calculate averages and sort
      const rankedProvinces = Array.from(provinceMap.entries())
        .map(([province, data]) => ({
          province,
          average: data.sum / data.count,
        }))
        .sort((a, b) => type === "top" ? b.average - a.average : a.average - b.average)
        .slice(0, count)
        .map(item => item.province);

      // Filter data to only include ranked provinces
      filtered = filtered.filter(row => {
        const provinceName = row.nama_provinsi || row.provinsi || row.nama_wilayah;
        return rankedProvinces.includes(provinceName);
      });
    }

    // Category filters
    if (filters.categoryFilters) {
      for (const [field, value] of Object.entries(filters.categoryFilters)) {
        filtered = filtered.filter(row => row[field] === value);
      }
    }

    return filtered;
  };

  // Prepare chart data based on dataset type
  const prepareChartData = () => {
    if (!hasTimeSeriesData) return [];

    let filteredData = [...dataset.sampleData];

    // Apply basic filters
    if (selectedProvince !== "all") {
      filteredData = filteredData.filter(row => 
        (row.nama_provinsi || row.provinsi || row.nama_wilayah) === selectedProvince
      );
    }

    // Apply advanced filters
    filteredData = applyAdvancedFilters(filteredData);

    // Group by year and calculate averages
    const groupedByYear: Record<number, any> = {};
    
    filteredData.forEach(row => {
      const year = row.tahun as number;
      if (!groupedByYear[year]) {
        groupedByYear[year] = { tahun: year, count: 0, ...row };
      } else {
        // Average numeric values
        Object.keys(row).forEach(key => {
          if (typeof row[key] === 'number' && key !== 'tahun') {
            if (typeof groupedByYear[year][key] === 'number') {
              groupedByYear[year][key] = 
                (groupedByYear[year][key] * groupedByYear[year].count + row[key]) / 
                (groupedByYear[year].count + 1);
            }
          }
        });
      }
      groupedByYear[year].count++;
    });

    return Object.values(groupedByYear).sort((a, b) => a.tahun - b.tahun);
  };

  const chartData = prepareChartData();

  // Prepare table data with advanced filters
  const prepareTableData = () => {
    let data = [...dataset.sampleData];

    // Apply basic filters first
    if (selectedYear !== "all" && hasTimeSeriesData) {
      data = data.filter(row => row.tahun === parseInt(selectedYear));
    }

    if (selectedProvince !== "all") {
      data = data.filter(row => 
        (row.nama_provinsi || row.provinsi || row.nama_wilayah) === selectedProvince
      );
    }

    // Apply advanced filters
    data = applyAdvancedFilters(data);

    return data;
  };

  const tableData = prepareTableData();
  const tableColumns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  // Color palette for lines
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-4">
      {/* Advanced Filters Component */}
      <AdvancedFilters
        numericFields={numericFields}
        years={years}
        provinces={provinces}
        schema={dataset.schema}
        dataset={dataset}
        onFilterChange={setFilters}
        currentFilters={filters}
      />

      <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Data Visualization
          </span>
          <div className="flex gap-2">
            {provinces.length > 0 && (
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">Semua Provinsi</SelectItem>
                  {provinces.map(prov => (
                    <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasTimeSeriesData && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={hasTimeSeriesData ? "chart" : "table"}>
          <TabsList>
            {hasTimeSeriesData && <TabsTrigger value="chart">Grafik</TabsTrigger>}
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="table">Tabel Data</TabsTrigger>
          </TabsList>

          {hasTimeSeriesData && (
            <TabsContent value="chart" className="space-y-4">
              {chartData.length > 0 ? (
                <div className="space-y-6">
                  {numericFields.map((field, idx) => {
                    const fieldInfo = dataset.schema.find(s => s.columnName === field);
                    return (
                      <div key={field}>
                        <h4 className="text-sm font-semibold mb-2 capitalize">
                          {fieldInfo?.definition || field.replace(/_/g, ' ')}
                          {fieldInfo?.unit && <span className="text-gray-500 font-normal ml-2">({fieldInfo.unit})</span>}
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="tahun" 
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey={field} 
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name={fieldInfo?.definition || field}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Pilih filter untuk melihat data</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-4">
            <div className="space-y-4">
              {numericFields.length > 0 ? (
                numericFields.map((field, idx) => {
                  const fieldInfo = dataset.schema.find(s => s.columnName === field);
                  
                  // Prepare ranking data
                  const prepareRankingData = () => {
                    const yearToUse = selectedYear !== "all" ? parseInt(selectedYear) : Math.max(...years);
                    let data = dataset.sampleData.filter(row => 
                      row.tahun === yearToUse || !hasTimeSeriesData
                    );

                    // Apply advanced filters
                    data = applyAdvancedFilters(data);

                    // Calculate average per province
                    const provinceMap = new Map<string, { sum: number; count: number }>();
                    data.forEach(row => {
                      const provinceName = row.nama_provinsi || row.provinsi || row.nama_wilayah;
                      const value = row[field];
                      if (provinceName && typeof value === 'number') {
                        const existing = provinceMap.get(provinceName) || { sum: 0, count: 0 };
                        provinceMap.set(provinceName, {
                          sum: existing.sum + value,
                          count: existing.count + 1,
                        });
                      }
                    });

                    // Convert to array and sort
                    return Array.from(provinceMap.entries())
                      .map(([provinsi, data]) => ({
                        provinsi: provinsi.length > 20 ? provinsi.substring(0, 18) + '...' : provinsi,
                        value: parseFloat((data.sum / data.count).toFixed(2)),
                      }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 15); // Top 15 provinces
                  };

                  const rankingData = prepareRankingData();

                  return (
                    <div key={field} className="border rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-3">
                        Ranking: {fieldInfo?.definition || field.replace(/_/g, ' ')}
                        {fieldInfo?.unit && <span className="text-gray-500 font-normal ml-2">({fieldInfo.unit})</span>}
                      </h4>
                      {rankingData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={rankingData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis 
                              type="category" 
                              dataKey="provinsi" 
                              stroke="#6b7280" 
                              style={{ fontSize: '11px' }}
                              width={120}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            />
                            <Bar 
                              dataKey="value" 
                              fill={colors[idx % colors.length]}
                              name={fieldInfo?.definition || field}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Tidak ada data untuk ditampilkan</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada field numerik untuk ranking</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="rounded-md border overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="bg-blue-900 sticky top-0">
                  <TableRow>
                    {tableColumns.map(col => {
                      const fieldInfo = dataset.schema.find(s => s.columnName === col);
                      return (
                        <TableHead key={col} className="text-white font-semibold whitespace-nowrap">
                          {fieldInfo?.definition || col.replace(/_/g, ' ').toUpperCase()}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, idx) => (
                    <TableRow key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                      {tableColumns.map(col => (
                        <TableCell key={col} className="whitespace-nowrap">
                          {typeof row[col] === 'number' 
                            ? row[col].toLocaleString('id-ID')
                            : row[col]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Menampilkan {tableData.length} dari {dataset.sampleData.length} baris data
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}