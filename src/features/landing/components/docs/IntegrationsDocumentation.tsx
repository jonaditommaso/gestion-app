'use client'

import { AlertCircle, CalendarCheck2, CheckCircle2, Clock3, HardDrive, Music2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { FiGithub } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";

export default function IntegrationsDocumentation() {
    const t = useTranslations('landing.docs.integrations');

    return {
        "integrations-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-sky-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-sky-800">{t('overview.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">{t('overview.available-title')}</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <FiGithub className="h-4 w-4 text-gray-700 mt-0.5 shrink-0" />
                                {t('overview.available-1')}
                            </li>
                            <li className="flex items-start gap-2">
                                <CalendarCheck2 className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
                                {t('overview.available-2')}
                            </li>
                            <li className="flex items-start gap-2">
                                <HardDrive className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                                {t('overview.available-3')}
                            </li>
                        </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">{t('overview.limited-title')}</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <Music2 className="h-4 w-4 text-pink-700 mt-0.5 shrink-0" />
                                {t('overview.limited-1')}
                            </li>
                            <li className="flex items-start gap-2">
                                <FaYoutube className="h-4 w-4 text-red-700 mt-0.5 shrink-0" />
                                {t('overview.limited-2')}
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock3 className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                                {t('overview.limited-3')}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        ),

        "integrations-status": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('status.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('status.description-title')}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-3">{t('status.subtitle')}</h3>
                    <p className="text-amber-800">{t('status.description-subtitle')}</p>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-100 text-sm font-semibold text-gray-800">
                        <div className="p-3">{t('status.header-1')}</div>
                        <div className="p-3">{t('status.header-2')}</div>
                        <div className="p-3">{t('status.header-3')}</div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {(['row-1', 'row-2', 'row-3', 'row-4', 'row-5'] as const).map((row) => (
                            <div key={row} className="grid grid-cols-3 text-sm">
                                <div className="p-3 text-gray-900">{t(`status.${row}-name`)}</div>
                                <div className="p-3 text-gray-700 flex items-center gap-2">
                                    {row === 'row-4' || row === 'row-5' ? (
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    )}
                                    {t(`status.${row}-state`)}
                                </div>
                                <div className="p-3 text-gray-600">{t(`status.${row}-notes`)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
