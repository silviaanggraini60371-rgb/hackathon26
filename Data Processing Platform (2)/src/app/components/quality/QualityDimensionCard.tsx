import { QualityDimension } from "../../types/quality";

interface QualityDimensionCardProps {
    dimension: QualityDimension;
}

export function QualityDimensionCard({ dimension }: QualityDimensionCardProps) {
    return (
        <div className={`p-4 ${dimension.bgColor} border ${dimension.borderColor} rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 ${dimension.color} rounded-full`}></div>
                <p className={`font-semibold ${dimension.textColor}`}>{dimension.name}</p>
            </div>
            <p className={`text-sm ${dimension.textColor.replace('900', '700')}`}>
                {dimension.description}
            </p>
        </div>
    );
}
