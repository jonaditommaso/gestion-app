import { getTranslations } from "next-intl/server";

interface StepItemProps {
    icon: React.ReactNode;
    iconColor: string;
    text: string;
    id: string;
}

interface StepCardProps {
    step: number;
    title: string;
    description: string;
    mainColor: string;
    items: StepItemProps[];
}


const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const StepItem = ({ icon, iconColor, text }: Omit<StepItemProps, 'id'>) => {
    const hasColon = text.includes(':');

    if (hasColon) {
        const parts = text.split(':');
        const beforeColon = parts[0];
        const afterColon = parts.slice(1).join(':').trim(); // multiples ':' case

        return (
            <div className="flex items-center gap-x-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColor}`}>
                    {icon}
                </div>
                <span className="text-sm text-gray-700">
                    <strong>{beforeColon}:</strong> {formatText(afterColon)}
                </span>
            </div>
        );
    } else {
        return (
            <div className="flex items-center gap-x-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColor}`}>
                    {icon}
                </div>
                <span className="text-sm text-gray-700">
                    {formatText(text)}
                </span>
            </div>
        );
    }
};

const StepCard = async ({ step, title, description, items, mainColor }: StepCardProps) => {
    const t = await getTranslations('landing.getting-started');

    // Mapeo completo de colores para evitar problemas con el purging de Tailwind
    const colorMap: Record<string, { roundedBg: string; stepBg: string; stepText: string }> = {
        blue: {
            roundedBg: 'from-blue-500/10',
            stepBg: 'bg-blue-100 group-hover:bg-blue-200',
            stepText: 'text-blue-600'
        },
        purple: {
            roundedBg: 'from-purple-500/10',
            stepBg: 'bg-purple-100 group-hover:bg-purple-200',
            stepText: 'text-purple-600'
        },
        green: {
            roundedBg: 'from-green-500/10',
            stepBg: 'bg-green-100 group-hover:bg-green-200',
            stepText: 'text-green-600'
        },
        orange: {
            roundedBg: 'from-orange-500/10',
            stepBg: 'bg-orange-100 group-hover:bg-orange-200',
            stepText: 'text-orange-600'
        },
        red: {
            roundedBg: 'from-red-500/10',
            stepBg: 'bg-red-100 group-hover:bg-red-200',
            stepText: 'text-red-600'
        },
        indigo: {
            roundedBg: 'from-indigo-500/10',
            stepBg: 'bg-indigo-100 group-hover:bg-indigo-200',
            stepText: 'text-indigo-600'
        }
    };

    const colorClasses = colorMap[mainColor] || colorMap.blue;

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses.roundedBg} to-transparent rounded-bl-full`} />
            <div className="relative">
                <div className="flex items-center gap-x-4 mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses.stepBg} transition-colors`}>
                        <span className={`text-xl font-bold ${colorClasses.stepText}`}>{step}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{t(title)}</h3>
                        <p className="text-sm text-gray-500">{t(description)}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {items.map(item => (
                        <StepItem
                            key={item.id}
                            icon={item.icon}
                            iconColor={item.iconColor}
                            text={t(item.text)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StepCard;