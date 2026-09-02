'use client'

import { KeyRound, Languages, ShieldCheck, UserCog } from "lucide-react"
import { useTranslations } from "next-intl"

export default function SettingsDocumentation() {
    const t = useTranslations('landing.docs.settings');

    return {
        "settings-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-slate-700">{t('overview.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UserCog className="h-5 w-5 text-blue-700" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                        </div>
                        <p className="text-gray-600">{t('overview.section-1-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                        </div>
                        <p className="text-gray-600">{t('overview.section-2-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Languages className="h-5 w-5 text-amber-700" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{t('overview.section-3-title')}</h4>
                        </div>
                        <p className="text-gray-600">{t('overview.section-3-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <KeyRound className="h-5 w-5 text-violet-700" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{t('overview.section-4-title')}</h4>
                        </div>
                        <p className="text-gray-600">{t('overview.section-4-description')}</p>
                    </div>
                </div>
            </div>
        ),

        "settings-security": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('security.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('security.description-title')}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-3">{t('security.subtitle')}</h3>
                    <p className="text-emerald-800">{t('security.description-subtitle')}</p>
                </div>

                <div className="space-y-4">
                    {(['section-1', 'section-2', 'section-3'] as const).map((key, index) => (
                        <div key={key} className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {index + 1}. {t(`security.${key}-title`)}
                            </h4>
                            <p className="text-gray-600 text-sm">{t(`security.${key}-description`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),

        "settings-sso": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('sso.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('sso.description-title')}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('sso.subtitle')}</h3>
                    <p className="text-indigo-800">{t('sso.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-6">
                        <h4 className="font-semibold text-indigo-900 mb-3">{t('sso.availability-title')}</h4>
                        <ul className="space-y-2 text-sm text-indigo-800">
                            {(['availability-1', 'availability-2', 'availability-3'] as const).map((key) => (
                                <li key={key}>• {t(`sso.${key}`)}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">{t('sso.flow-title')}</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            {(['flow-1', 'flow-2', 'flow-3'] as const).map((key) => (
                                <li key={key}>• {t(`sso.${key}`)}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}
