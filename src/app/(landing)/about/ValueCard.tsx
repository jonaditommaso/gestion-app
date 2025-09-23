import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface ValueCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    bgColor: string;
    hoverBgColor: string;
    iconColor: string;
}

const ValueCard = ({ icon, title, description, bgColor, hoverBgColor, iconColor }: ValueCardProps) => {
    return (
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 ${hoverBgColor} transition-colors`}>
                    <div className={iconColor}>
                        {icon}
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
                <p className="text-slate-600">{description}</p>
            </CardContent>
        </Card>
    );
};

export default ValueCard;