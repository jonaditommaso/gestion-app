import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TermsListCardProps {
    title: string;
    icon?: React.ReactNode;
    description1?: string;
    items?: string[];
    subtitle1?: string;
    subtitle2?: string;
    items1?: string[];
    items2?: string[];
    isList?: boolean;
}

const formatListItem = (item: string) => {
    if (item.includes(':')) {
        const [boldPart, ...restParts] = item.split(':');
        const remainingText = restParts.join(':');

        return (
            <>
                <strong>{boldPart}:</strong>{remainingText}
            </>
        );
    }

    return item;
};

const TermsListCard = ({ title, icon, description1, items, subtitle1, subtitle2, items1, items2, isList = false }: TermsListCardProps) => {

    return (
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className={`text-slate-800 ${icon ? 'flex items-center gap-2' : ''}`}>
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 leading-relaxed">
                {description1 && <p>{description1}</p>}

                {/* 2 subtitles case */}
                {subtitle1 && subtitle2 && items1 && items2 ? (
                    <>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">{subtitle1}</h4>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                {items1.map((item, idx) => (
                                    <li key={idx}>{formatListItem(item)}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">{subtitle2}</h4>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                {items2.map((item, idx) => (
                                    <li key={idx}>{formatListItem(item)}</li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : subtitle1 && items ? (
                    /* 1 subtitle case */
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-2">{subtitle1}</h4>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            {items.map((item, idx) => (
                                <li key={idx}>{formatListItem(item)}</li>
                            ))}
                        </ul>
                    </div>
                ) : items ? (
                    /* 0 subtitle case */
                    isList ? (
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            {items.map((item, idx) => (
                                <li key={idx}>{formatListItem(item)}</li>
                            ))}
                        </ul>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <p key={idx}>{formatListItem(item)}</p>
                            ))}
                        </div>
                    )
                ) : null}
            </CardContent>
        </Card>
     );
}

export default TermsListCard;