import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Dataset } from "../data/mockDataBPS";

interface CategorySpecificFiltersProps {
  dataset: Dataset;
  onFilterChange: (filters: Record<string, string>) => void;
  currentFilters?: Record<string, string>;
}

export function CategorySpecificFilters({ dataset, onFilterChange, currentFilters }: CategorySpecificFiltersProps) {
  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>(currentFilters || {});

  // Detect available categorical fields
  const getCategoricalFields = () => {
    if (dataset.sampleData.length === 0) return [];
    
    const sample = dataset.sampleData[0];
    const categoricalFields: { field: string; label: string; values: string[] }[] = [];

    // Check for kelompok_umur
    if ('kelompok_umur' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.kelompok_umur as string))).sort();
      categoricalFields.push({
        field: 'kelompok_umur',
        label: 'Kelompok Umur',
        values
      });
    }

    // Check for jenis_kelamin
    if ('jenis_kelamin' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.jenis_kelamin as string))).sort();
      categoricalFields.push({
        field: 'jenis_kelamin',
        label: 'Jenis Kelamin',
        values
      });
    }

    // Check for metode
    if ('metode' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.metode as string))).sort();
      categoricalFields.push({
        field: 'metode',
        label: 'Metode Estimasi',
        values
      });
    }

    // Check for kategori_gizi
    if ('kategori_gizi' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.kategori_gizi as string))).sort();
      categoricalFields.push({
        field: 'kategori_gizi',
        label: 'Kategori Gizi',
        values
      });
    }

    // Check for indikator
    if ('indikator' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.indikator as string))).sort();
      categoricalFields.push({
        field: 'indikator',
        label: 'Indikator',
        values
      });
    }

    // Check for sektor_ekonomi
    if ('sektor_ekonomi' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.sektor_ekonomi as string))).sort();
      categoricalFields.push({
        field: 'sektor_ekonomi',
        label: 'Sektor Ekonomi',
        values
      });
    }

    // Check for wilayah (urban/rural)
    if ('wilayah' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.wilayah as string))).sort();
      categoricalFields.push({
        field: 'wilayah',
        label: 'Wilayah',
        values
      });
    }

    // Check for tingkat_pendidikan
    if ('tingkat_pendidikan' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.tingkat_pendidikan as string))).sort();
      categoricalFields.push({
        field: 'tingkat_pendidikan',
        label: 'Tingkat Pendidikan',
        values
      });
    }

    // Check for status_pekerjaan
    if ('status_pekerjaan' in sample) {
      const values = Array.from(new Set(dataset.sampleData.map(row => row.status_pekerjaan as string))).sort();
      categoricalFields.push({
        field: 'status_pekerjaan',
        label: 'Status Pekerjaan',
        values
      });
    }

    return categoricalFields;
  };

  const categoricalFields = getCategoricalFields();

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = {
      ...categoryFilters,
      [field]: value === "all" ? "" : value
    };
    
    // Remove empty values
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key]) delete newFilters[key];
    });

    setCategoryFilters(newFilters);
    onFilterChange(newFilters);
  };

  if (categoricalFields.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categoricalFields.map(({ field, label, values }) => (
        <div key={field} className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
          <Select
            value={categoryFilters[field] || "all"}
            onValueChange={(value) => handleFilterChange(field, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Semua ${label}`} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">Semua {label}</SelectItem>
              {values.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}