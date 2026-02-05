import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Dataset } from "../data/mockDataBPS";
import { TrendingUp, Table as TableIcon } from "lucide-react";

interface DataVisualizationProps {
  dataset: Dataset;
}

export function DataVisualization({ dataset }: DataVisualizationProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");

  // Determine if dataset has time-series data
  const hasTimeSeriesData = dataset.sampleData.some(row => 'tahun' in row);
  
  // Get unique years and provinces from sample data
  const years = hasTimeSeriesData 
    ? Array.from(new Set(dataset.sampleData.map(row => row.tahun as number))).sort()
    : [];
  
  const provinces = dataset.sampleData.some(row => 'nama_provinsi' in row || 'provinsi' in row)
    ? Array.from(new Set(dataset.sampleData.map(row => (row.nama_provinsi || row.provinsi) as string))).sort()
    : [];

  // Prepare chart data based on dataset type
  const prepareChartData = () => {
    if (!hasTimeSeriesData) return [];

    let filteredData = [...dataset.sampleData];

    // Filter by province if selected
    if (selectedProvince !== "all") {
      filteredData = filteredData.filter(row => 
        (row.nama_provinsi || row.provinsi) === selectedProvince
      );
    }

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

  // Prepare table data
  const prepareTableData = () => {
    let data = [...dataset.sampleData];

    if (selectedYear !== "all" && hasTimeSeriesData) {
      data = data.filter(row => row.tahun === parseInt(selectedYear));
    }

    if (selectedProvince !== "all") {
      data = data.filter(row => 
        (row.nama_provinsi || row.provinsi) === selectedProvince
      );
    }

    return data.slice(0, 100); // Limit to 100 rows for performance
  };

  const tableData = prepareTableData();
  const tableColumns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  // Color palette for lines
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
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
  );
}