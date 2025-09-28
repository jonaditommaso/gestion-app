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

    const colorClasses = {
        cardContainer: `from-${color}-50 to-${color}-100/50`,
        bubble: `from-${color}-500/10`,
        background: `bg-${color}-600`,
        text: `text-${color}-600`
    }

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