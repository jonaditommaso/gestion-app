import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface FeatureCardProps {
    title: string;
    description: string;
    items: string[];
    icon: React.ReactNode;
    color: string;
}

const FeatureCard = async ({ title, description, icon, items, color }: FeatureCardProps) => {
    const t = await getTranslations('landing.getting-started');

    // Mapeo completo de colores para evitar problemas con el purging de Tailwind
    const colorMap: Record<string, { cardContainer: string; bubble: string; background: string; text: string }> = {
        blue: {
            cardContainer: 'from-blue-50 to-blue-100/50',
            bubble: 'from-blue-500/10',
            background: 'bg-blue-600',
            text: 'text-blue-600'
        },
        purple: {
            cardContainer: 'from-purple-50 to-purple-100/50',
            bubble: 'from-purple-500/10',
            background: 'bg-purple-600',
            text: 'text-purple-600'
        },
        green: {
            cardContainer: 'from-green-50 to-green-100/50',
            bubble: 'from-green-500/10',
            background: 'bg-green-600',
            text: 'text-green-600'
        },
        orange: {
            cardContainer: 'from-orange-50 to-orange-100/50',
            bubble: 'from-orange-500/10',
            background: 'bg-orange-600',
            text: 'text-orange-600'
        },
        red: {
            cardContainer: 'from-red-50 to-red-100/50',
            bubble: 'from-red-500/10',
            background: 'bg-red-600',
            text: 'text-red-600'
        },
        indigo: {
            cardContainer: 'from-indigo-50 to-indigo-100/50',
            bubble: 'from-indigo-500/10',
            background: 'bg-indigo-600',
            text: 'text-indigo-600'
        }
    };

    const colorClasses = colorMap[color] || colorMap.blue;

    return (
        <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses.cardContainer} p-8 hover:shadow-xl transition-all duration-300 cursor-default h-[400px]`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses.bubble} to-transparent rounded-bl-full`} />
            <div className="relative">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses.background} group-hover:scale-110 transition-transform duration-300`}>
                    {/* <FolderPlus className="h-6 w-6 text-white" /> */}
                    {icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{t(title)}</h3>
                <p className="mt-3 text-gray-600 leading-6">
                    {t(description)}
                </p>
                <div className="mt-6 space-y-3">
                    {items.map(item => (
                        <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className={`h-4 w-4 ${colorClasses.text}`} />
                            {t(item)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FeatureCard;