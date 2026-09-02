'use client'

import { AlertTriangle, BarChart3, CreditCard, Crown, Users } from "lucide-react"
import { useTranslations } from "next-intl"

export default function OrganizationDocumentation() {
    const t = useTranslations('landing.docs.organization');

    return {
        "organization-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-violet-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-violet-800">{t('overview.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2 text-violet-700">
                            <Crown className="h-4 w-4" />
                            <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{t('overview.section-1-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2 text-blue-700">
                            <Users className="h-4 w-4" />
                            <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{t('overview.section-2-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2 text-emerald-700">
                            <CreditCard className="h-4 w-4" />
                            <h4 className="font-semibold text-gray-900">{t('overview.section-3-title')}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{t('overview.section-3-description')}</p>
                    </div>
                </div>
            </div>
        ),

        "organization-usage": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('usage.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('usage.description-title')}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('usage.subtitle')}</h3>
                    <p className="text-blue-800">{t('usage.description-subtitle')}</p>
                </div>

                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-700" />
                            {t('usage.section-1-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('usage.section-1-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-700" />
                            {t('usage.section-2-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('usage.section-2-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('usage.section-3-title')}</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            {(['section-3-item-1', 'section-3-item-2', 'section-3-item-3'] as const).map((key) => (
                                <li key={key}>• {t(`usage.${key}`)}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ),

        "organization-billing": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('billing.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('billing.description-title')}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">{t('billing.subtitle')}</h3>
                    <p className="text-red-800">{t('billing.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-700" />
                            {t('billing.section-1-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('billing.section-1-description')}</p>
                    </div>

                    <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-700" />
                            {t('billing.section-2-title')}
                        </h4>
                        <p className="text-sm text-red-800">{t('billing.section-2-description')}</p>
                    </div>
                </div>
            </div>
        )
    }
}
