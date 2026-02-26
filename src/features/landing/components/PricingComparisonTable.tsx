'use client'
import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type CellValue = string | boolean;

interface ComparisonRow {
    featureKey: string;
    basic: CellValue;
    pro: CellValue;
    proPlus: CellValue;
    enterprise: CellValue;
}

const PricingComparisonTable = () => {
    const t = useTranslations('pricing');

    const rows: ComparisonRow[] = [
        {
            featureKey: 'pricing-compare-users',
            // basic: t('pricing-basic-benefit-1-title'),
            // pro: t('pricing-pro-benefit-1-title'),
            // proPlus: t('pricing-pro-plus-benefit-1-title'),
            // enterprise: t('pricing-enterprise-benefit-1-title'),
            basic: '5',
            pro: '10',
            proPlus: '20',
            enterprise: '50',
        },
        {
            featureKey: 'pricing-compare-tables',
            // basic: t('pricing-basic-benefit-4-title'),
            // pro: t('pricing-pro-benefit-4-title'),
            // proPlus: t('pricing-pro-plus-benefit-4-title'),
            // enterprise: t('pricing-enterprise-benefit-4-title'),
            basic: '3',
            pro: '5',
            proPlus: '8',
            enterprise: '20',
        },
        {
            featureKey: 'pricing-compare-records',
            // basic: t('pricing-basic-benefit-7-title'),
            // pro: t('pricing-pro-benefit-7-title'),
            // proPlus: t('pricing-pro-plus-benefit-7-title'),
            // enterprise: t('pricing-enterprise-benefit-7-title'),
            basic: '5.000',
            pro: '20.000',
            proPlus: '50.000',
            enterprise: '100.000',
        },
        {
            featureKey: 'pricing-compare-storage',
            // basic: t('pricing-basic-benefit-5-title'),
            // pro: t('pricing-pro-benefit-5-title'),
            // proPlus: t('pricing-pro-plus-benefit-5-title'),
            // enterprise: t('pricing-enterprise-benefit-5-title'),
            basic: '1 GB',
            pro: '5 GB',
            proPlus: '10 GB',
            enterprise: '100 GB',
        },
        {
            featureKey: 'pricing-compare-workspaces',
            // basic: t('pricing-basic-benefit-6-title'),
            // pro: t('pricing-pro-benefit-6-title'),
            // proPlus: t('pricing-pro-plus-benefit-6-title'),
            // enterprise: t('pricing-enterprise-benefit-6-title'),
            basic: '1',
            pro: '3',
            proPlus: '5',
            enterprise: '10',
        },
        {
            featureKey: 'pricing-compare-billing',
            basic: true,
            pro: true,
            proPlus: true,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-kanban',
            basic: true,
            pro: true,
            proPlus: true,
            enterprise: true,
        },
    ];

    const renderCell = (value: CellValue) => {
        if (typeof value === 'boolean') {
            return value
                ? <Check className="size-4 text-green-500 mx-auto" />
                : <Minus className="size-4 text-zinc-300 mx-auto" />;
        }
        return <span className="text-sm text-center block">{value}</span>;
    };

    return (
        <div className="container mx-auto px-4 pb-16 mt-10">
            <h2 className="text-3xl font-bold text-center mb-8">{t('pricing-compare-title')}</h2>
            <div className="overflow-x-auto rounded-xl border">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted/50">
                            <th className="text-left py-4 px-5 font-semibold text-zinc-500 w-[30%]">
                                {t('pricing-compare-feature')}
                            </th>
                            <th className="py-4 px-4 text-center font-semibold">
                                {t('pricing-basic-title')}
                            </th>
                            <th className="py-4 px-4 text-center font-semibold">
                                {t('pricing-pro-title')}
                            </th>
                            <th className="py-4 px-4 text-center font-semibold text-blue-600">
                                {t('pricing-pro-plus-title')}
                            </th>
                            <th className="py-4 px-4 text-center font-semibold text-yellow-500">
                                {t('pricing-enterprise-title')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.featureKey} className={cn("border-t", i % 2 !== 0 ? "bg-muted/20" : "")}>
                                <td className="py-3 px-5 text-sm font-medium">{t(row.featureKey)}</td>
                                <td className="py-3 px-4 text-center">{renderCell(row.basic)}</td>
                                <td className="py-3 px-4 text-center">{renderCell(row.pro)}</td>
                                <td className="py-3 px-4 text-center">{renderCell(row.proPlus)}</td>
                                <td className="py-3 px-4 text-center">{renderCell(row.enterprise)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PricingComparisonTable;
