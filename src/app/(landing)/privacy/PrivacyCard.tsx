import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrivacyCardProps {
    title: string;
    icon: React.ReactNode;
    description1: string;
    description2?: string;
}

const PrivacyCard = ({ title, icon, description1, description2 }: PrivacyCardProps) => {
    return (
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                    {description1}
                </p>
                <p>
                    {description2}
                </p>
            </CardContent>
        </Card>
    );
}

export default PrivacyCard;