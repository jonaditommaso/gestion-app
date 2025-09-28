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

    const roundedBgColor = `from-${mainColor}-500/10`;
    const stepBgColor = `bg-${mainColor}-100 group-hover:bg-${mainColor}-200`;
    const stepTextColor = `text-${mainColor}-600`;

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${roundedBgColor} to-transparent rounded-bl-full`} />
            <div className="relative">
                <div className="flex items-center gap-x-4 mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stepBgColor} transition-colors`}>
                        <span className={`text-xl font-bold ${stepTextColor}`}>{step}</span>
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