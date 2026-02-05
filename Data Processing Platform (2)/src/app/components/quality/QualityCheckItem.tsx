import { QualityCheck } from "../../types/quality";
import { CheckCircle } from "lucide-react";

interface QualityCheckItemProps {
    check: QualityCheck;
}

export function QualityCheckItem({ check }: QualityCheckItemProps) {
    return (
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-medium text-green-900">{check.title}</p>
                <p className="text-sm text-green-700">{check.description}</p>
            </div>
        </div>
    );
}
