interface StatCardProps {
    number: string;
    description: string;
    gradientColors: string;
}

const StatCard = ({ number, description, gradientColors }: StatCardProps) => {
    return (
        <div className="text-center">
            <div className={`w-24 h-24 ${gradientColors} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <span className="text-2xl font-bold text-white">{number}</span>
            </div>
            <p className="text-slate-600 text-sm">{description}</p>
        </div>
    );
};

export default StatCard;