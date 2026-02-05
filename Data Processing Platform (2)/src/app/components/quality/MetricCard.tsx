interface MetricCardProps {
    label: string;
    value: number;
    colorClass: string;
}

export function MetricCard({ label, value, colorClass }: MetricCardProps) {
    return (
        <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>
                {value}%
            </p>
        </div>
    );
}
