import { QualityDimension, QualityCheck } from "../types/quality";

export const QUALITY_DIMENSIONS: QualityDimension[] = [
    {
        name: "Completeness",
        color: "bg-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-900",
        description: "Persentase nilai non-null per kolom. Dihitung sebagai: (total_non_null / total_records) × 100. Missing values diidentifikasi berdasarkan missing_value_indicator di schema."
    },
    {
        name: "Accuracy",
        color: "bg-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-900",
        description: "Margin of error dan confidence intervals dari data collection. Untuk sensor data, diukur dengan kalibrasi terhadap reference stations. Survey data menggunakan sampling error estimates."
    },
    {
        name: "Timeliness",
        color: "bg-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        textColor: "text-orange-900",
        description: "Latency dari kejadian nyata sampai data tersedia di platform. Dihitung sebagai: 100 - (average_latency_minutes / max_acceptable_latency × 100). Real-time data target < 10 min."
    },
    {
        name: "Consistency",
        color: "bg-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        textColor: "text-purple-900",
        description: "Persentase records yang memenuhi consistency rules dan validation constraints. Contoh: timestamp <= current_time, geographic codes valid, logical relationships terpenuhi."
    }
];

export const AUTOMATED_CHECKS: QualityCheck[] = [
    {
        title: "Schema Validation",
        description: "Verifikasi tipe data, format, dan struktur kolom"
    },
    {
        title: "Outlier Detection",
        description: "Deteksi nilai anomali menggunakan IQR dan z-score"
    },
    {
        title: "Duplicate Detection",
        description: "Identifikasi dan remove duplicate records berdasarkan primary key"
    },
    {
        title: "Referential Integrity",
        description: "Validasi foreign keys dan cross-table relationships"
    },
    {
        title: "Range Validation",
        description: "Cek nilai berada dalam range yang diharapkan (min/max)"
    },
    {
        title: "Freshness Check",
        description: "Monitoring latency dan update frequency sesuai SLA"
    }
];
