import { qualityMetricsHistory, mockDatasets, Dataset } from "../data/mockDataBPS";
import { DatasetQuality } from "../types/quality";
import { CheckCircle, AlertTriangle, XCircle, LucideIcon } from "lucide-react";

export interface QualityBadge {
    variant: "default" | "secondary" | "outline" | "destructive";
    label: string;
    icon: LucideIcon;
}




export interface UseQualityMetricsReturn {
    latestMetrics: typeof qualityMetricsHistory[0];
    avgQuality: number;
    datasetQualityBreakdown: DatasetQuality[];
    getQualityColor: (score: number) => string;
    getQualityBadge: (score: number) => QualityBadge;
    overallBadge: QualityBadge;
}

export function useQualityMetrics(): UseQualityMetricsReturn {
    // Calculate current quality metrics
    const latestMetrics = qualityMetricsHistory[qualityMetricsHistory.length - 1];
    const avgQuality = (latestMetrics.completeness + latestMetrics.accuracy + latestMetrics.timeliness + latestMetrics.consistency) / 4;

    const datasetQualityBreakdown: DatasetQuality[] = mockDatasets.map((ds: Dataset) => ({
        name: ds.title.substring(0, 30) + (ds.title.length > 30 ? '...' : ''),
        completeness: ds.completeness,
        category: ds.category,
        id: ds.id,
    }));

    const getQualityColor = (score: number) => {
        if (score >= 95) return "text-green-600";
        if (score >= 85) return "text-blue-600";
        if (score >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    const getQualityBadge = (score: number): QualityBadge => {
        if (score >= 95) return { variant: "default", label: "Excellent", icon: CheckCircle };
        if (score >= 85) return { variant: "secondary", label: "Good", icon: CheckCircle };
        if (score >= 75) return { variant: "outline", label: "Fair", icon: AlertTriangle };
        return { variant: "destructive", label: "Poor", icon: XCircle };
    };

    const overallBadge = getQualityBadge(avgQuality);

    return {
        latestMetrics,
        avgQuality,
        datasetQualityBreakdown,
        getQualityColor,
        getQualityBadge,
        overallBadge
    };
}
