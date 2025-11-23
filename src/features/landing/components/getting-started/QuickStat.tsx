import { getTranslations } from "next-intl/server";

interface QuickStatProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
}

const QuickStat = async ({ icon, title, subtitle, color }: QuickStatProps) => {
    const t = await getTranslations('landing.getting-started');

    const bgColor = `bg-${color}-500/20`;

    return (
        <div className={"bg-white/5 rounded-lg p-6 border border-white/10"}>
            <div className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl mx-auto mb-4`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-white">{t(title)}</p>
            <p className="text-sm text-gray-400">{t(subtitle)}</p>
        </div>
    );
}

export default QuickStat;