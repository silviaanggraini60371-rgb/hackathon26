import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Filter, X, TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { CategorySpecificFilters } from "./CategorySpecificFilters";
import type { Dataset } from "../data/mockDataBPS";

interface FilterConfig {
  yearRange?: { start: number; end: number };
  valueRange?: { field: string; min: number; max: number };
  ranking?: { field: string; type: "top" | "bottom"; count: number };
  geoLevel?: "provinsi" | "kabupaten" | "kota" | "all";
  specificProvince?: string;
  categoryFilters?: Record<string, string>;
}

interface AdvancedFiltersProps {
  numericFields: string[];
  years: number[];
  provinces: string[];
  schema: Array<{ columnName: string; definition: string; unit?: string }>;
  dataset: Dataset;
  onFilterChange: (filters: FilterConfig) => void;
  currentFilters: FilterConfig;
}

export function AdvancedFilters({
  numericFields,
  years,
  provinces,
  schema,
  dataset,
  onFilterChange,
  currentFilters,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterConfig>(currentFilters);

  const getFieldLabel = (field: string) => {
    const fieldInfo = schema.find(s => s.columnName === field);
    return fieldInfo?.definition || field.replace(/_/g, ' ');
  };

  const getFieldUnit = (field: string) => {
    const fieldInfo = schema.find(s => s.columnName === field);
    return fieldInfo?.unit || "";
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterConfig = {
      geoLevel: "all"
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.keys(localFilters).filter(key => {
    const value = localFilters[key as keyof FilterConfig];
    if (key === 'geoLevel' && value === 'all') return false;
    if (key === 'categoryFilters') {
      return Object.keys(value as Record<string, string> || {}).length > 0;
    }
    return value !== undefined && value !== null;
  }).length;

  return (
    <Card className="mb-4 border-2 border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">Filter Lanjutan</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {activeFilterCount} aktif
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Tutup" : "Buka"} Filter
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Rentang Tahun */}
          {years.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Rentang Tahun</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Tahun Mulai</Label>
                  <Select
                    value={localFilters.yearRange?.start?.toString() || years[0]?.toString()}
                    onValueChange={(value) =>
                      setLocalFilters({
                        ...localFilters,
                        yearRange: {
                          start: parseInt(value),
                          end: localFilters.yearRange?.end || years[years.length - 1],
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Tahun Akhir</Label>
                  <Select
                    value={localFilters.yearRange?.end?.toString() || years[years.length - 1]?.toString()}
                    onValueChange={(value) =>
                      setLocalFilters({
                        ...localFilters,
                        yearRange: {
                          start: localFilters.yearRange?.start || years[0],
                          end: parseInt(value),
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Rentang Nilai */}
          {numericFields.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Filter Rentang Nilai</Label>
              <div className="space-y-3">
                <Select
                  value={localFilters.valueRange?.field || "none"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      valueRange: value !== "none"
                        ? {
                            field: value,
                            min: localFilters.valueRange?.min || 0,
                            max: localFilters.valueRange?.max || 100,
                          }
                        : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih field untuk filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada filter</SelectItem>
                    {numericFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {getFieldLabel(field)} {getFieldUnit(field) && `(${getFieldUnit(field)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {localFilters.valueRange?.field && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Nilai Minimum</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={localFilters.valueRange.min}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            valueRange: {
                              ...localFilters.valueRange!,
                              min: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Nilai Maksimum</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={localFilters.valueRange.max}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            valueRange: {
                              ...localFilters.valueRange!,
                              max: parseFloat(e.target.value) || 100,
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ranking (Top/Bottom) */}
          {numericFields.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Ranking Provinsi</Label>
              <div className="space-y-3">
                <Select
                  value={localFilters.ranking?.field || "none"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      ranking: value !== "none"
                        ? {
                            field: value,
                            type: localFilters.ranking?.type || "top",
                            count: localFilters.ranking?.count || 10,
                          }
                        : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metrik untuk ranking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada ranking</SelectItem>
                    {numericFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {getFieldLabel(field)} {getFieldUnit(field) && `(${getFieldUnit(field)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {localFilters.ranking?.field && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Jenis Ranking</Label>
                      <Select
                        value={localFilters.ranking.type}
                        onValueChange={(value: "top" | "bottom") =>
                          setLocalFilters({
                            ...localFilters,
                            ranking: {
                              ...localFilters.ranking!,
                              type: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              Tertinggi
                            </div>
                          </SelectItem>
                          <SelectItem value="bottom">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-red-600" />
                              Terendah
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Jumlah Provinsi</Label>
                      <Input
                        type="number"
                        min="1"
                        max="34"
                        value={localFilters.ranking.count}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            ranking: {
                              ...localFilters.ranking!,
                              count: parseInt(e.target.value) || 10,
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Geographic Level Filter */}
          {provinces.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Tingkat Wilayah Geografis
              </Label>
              <Select
                value={localFilters.geoLevel || "all"}
                onValueChange={(value: "provinsi" | "kabupaten" | "kota" | "all") =>
                  setLocalFilters({
                    ...localFilters,
                    geoLevel: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tingkat</SelectItem>
                  <SelectItem value="provinsi">Provinsi</SelectItem>
                  <SelectItem value="kabupaten">Kabupaten</SelectItem>
                  <SelectItem value="kota">Kota</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                *Fitur ini akan memfilter berdasarkan kode wilayah (2 digit: Provinsi, 4 digit: Kab/Kota)
              </p>
            </div>
          )}

          {/* Provinsi Spesifik */}
          {provinces.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Provinsi Spesifik</Label>
              <Select
                value={localFilters.specificProvince || "all"}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    specificProvince: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Semua Provinsi</SelectItem>
                  {provinces.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Specific Filters */}
          <CategorySpecificFilters
            dataset={dataset}
            onFilterChange={(categoryFilters) =>
              setLocalFilters({
                ...localFilters,
                categoryFilters,
              })
            }
            currentFilters={localFilters.categoryFilters}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleApplyFilters} className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              Terapkan Filter
            </Button>
            <Button onClick={handleResetFilters} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Reset Filter
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}