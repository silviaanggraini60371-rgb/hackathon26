import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockDatasets } from "../../data/mockDataBPS";
import { Search, Filter, Calendar, MapPin, Database, ExternalLink, Download } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { exportToCSV, exportToJSON, exportToExcel } from "../../utils/dataExport";
import { useState } from "react";

export function Datasets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [licenseFilter, setLicenseFilter] = useState("all");

  const categories = ["all", ...Array.from(new Set(mockDatasets.map(d => d.category)))];
  const licenses = ["all", ...Array.from(new Set(mockDatasets.map(d => d.license)))];

  const filteredDatasets = mockDatasets.filter(dataset => {
    const matchesSearch = dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || dataset.category === categoryFilter;
    const matchesLicense = licenseFilter === "all" || dataset.license === licenseFilter;
    return matchesSearch && matchesCategory && matchesLicense;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Katalog Dataset</h2>
        <p className="text-gray-500 mt-1">
          Browse dan eksplorasi {mockDatasets.length} dataset dengan metadata lengkap
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari dataset, kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "Semua Kategori" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* License Filter */}
            <div className="relative">
              <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Lisensi" />
                </SelectTrigger>
                <SelectContent>
                  {licenses.map((lic) => (
                    <SelectItem key={lic} value={lic}>
                      {lic === "all" ? "Semua Lisensi" : lic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(categoryFilter !== "all" || licenseFilter !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary">Category: {categoryFilter}</Badge>
              )}
              {licenseFilter !== "all" && (
                <Badge variant="secondary">License: {licenseFilter}</Badge>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setLicenseFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Menampilkan <span className="font-semibold">{filteredDatasets.length}</span> dataset
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDatasets.map((dataset) => (
          <Card key={dataset.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{dataset.category}</Badge>
                    <Badge variant="outline">{dataset.license}</Badge>
                  </div>
                  <Link to={`/datasets/${dataset.id}`}>
                    <CardTitle className="text-xl hover:text-blue-600 transition-colors cursor-pointer">
                      {dataset.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="mt-2 line-clamp-2">
                    {dataset.description}
                  </CardDescription>
                </div>
                <Link to={`/datasets/${dataset.id}`}>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Geographic Coverage</p>
                    <p className="text-sm font-medium">{dataset.geographicCoverage}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Temporal Range</p>
                    <p className="text-sm font-medium">{dataset.temporalGranularity}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Format</p>
                    <p className="text-sm font-medium">{dataset.format}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-wrap gap-1">
                  {dataset.keywords.slice(0, 4).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {dataset.keywords.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dataset.keywords.length - 4}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {new Date(dataset.lastModified).toLocaleDateString('id-ID')}
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Completeness</p>
                  <p className="text-sm font-semibold text-green-600">{dataset.completeness}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Publisher</p>
                  <p className="text-sm font-semibold truncate">{dataset.publisher.split(' ')[0]}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">File Size</p>
                  <p className="text-sm font-semibold">{dataset.fileSize}</p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => exportToCSV(dataset, 1000)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => exportToJSON(dataset, 1000)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => exportToExcel(dataset, 1000)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada dataset yang sesuai dengan filter</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setLicenseFilter("all");
              }}
              className="text-blue-600 hover:text-blue-700 mt-2"
            >
              Reset filters
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}