import { LucideIcon } from "lucide-react";

export interface QualityDimension {
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    textColor: string;
}

export interface QualityCheck {
    title: string;
    description: string;
}

export interface QualityMetric {
    label: string;
    value: number;
    color: string;
}

export interface DatasetQuality {
    id: string;
    name: string;
    category: string;
    completeness: number;
}
