'use client'
import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type CellValue = string | boolean;

interface ComparisonRow {
    featureKey: string;
    free: CellValue;
    plus: CellValue;
    pro: CellValue;
    enterprise: CellValue;
}

const PricingComparisonTable = () => {
    const t = useTranslations('pricing');

    const rows: ComparisonRow[] = [
        {
            featureKey: 'pricing-compare-users',
            free: '3',
            plus: '10',
            pro: '25',
            enterprise: t('pricing-compare-unlimited'),
        },
        {
            featureKey: 'pricing-compare-workspaces',
            free: '1',
            plus: '3',
            pro: t('pricing-compare-unlimited'),
            enterprise: t('pricing-compare-unlimited'),
        },
        {
            featureKey: 'pricing-compare-pipelines',
            free: '1',
            plus: '1',
            pro: t('pricing-compare-unlimited'),
            enterprise: t('pricing-compare-unlimited'),
        },
        {
            featureKey: 'pricing-compare-tasks',
            free: t('pricing-compare-tasks-free'),
            plus: t('pricing-compare-tasks-full'),
            pro: t('pricing-compare-tasks-full'),
            enterprise: t('pricing-compare-tasks-full'),
        },
        {
            featureKey: 'pricing-compare-billing',
            free: false,
            plus: true,
            pro: true,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-messaging',
            free: false,
            plus: true,
            pro: true,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-ai',
            free: false,
            plus: t('pricing-compare-ai-basic'),
            pro: t('pricing-compare-ai-full'),
            enterprise: t('pricing-compare-ai-full'),
        },
        {
            featureKey: 'pricing-compare-permissions',
            free: false,
            plus: t('pricing-compare-permissions-basic'),
            pro: t('pricing-compare-permissions-granular'),
            enterprise: t('pricing-compare-permissions-granular'),
        },
        {
            featureKey: 'pricing-compare-exports',
            free: false,
            plus: false,
            pro: true,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-sso',
            free: false,
            plus: false,
            pro: false,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-sla',
            free: false,
            plus: false,
            pro: false,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-priority-support',
            free: false,
            plus: false,
            pro: false,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-data-retention',
            free: false,
            plus: false,
            pro: false,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-custom-billing',
            free: false,
            plus: false,
            pro: false,
            enterprise: true,
        },
        {
            featureKey: 'pricing-compare-account-manager',
            free: false,
            plus: false,
            pro: false,
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
                                Free
                            </th>
                            <th className="py-4 px-4 text-center font-semibold">
                                Plus
                            </th>
                            <th className="py-4 px-4 text-center font-semibold text-blue-600">
                                Pro
                            </th>
                            <th className="py-4 px-4 text-center font-semibold text-yellow-500">
                                Enterprise
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.featureKey} className={cn("border-t", i % 2 !== 0 ? "bg-muted/20" : "")}>
                                <td className="py-3 px-5 text-sm font-medium">{t(row.featureKey)}</td>
                                <td className="py-3 px-4 text-center">{renderCell(row.free)}</td>
                                <td className="py-3 px-4 text-center text-balance">{renderCell(row.plus)}</td>
                                <td className="py-3 px-4 text-center text-balance">{renderCell(row.pro)}</td>
                                <td className="py-3 px-4 text-center text-balance">{renderCell(row.enterprise)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PricingComparisonTable;
