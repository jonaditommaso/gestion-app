'use client'

import { Bot, Zap, MessageSquare, AlertCircle, CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function AIAssistantDocumentation() {
    const t = useTranslations('landing.docs.ai-assistant');

    return {
        "ai-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-indigo-800">{t('overview.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.main-features')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-1-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Zap className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-2-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Bot className="h-5 w-5 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-3-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-3-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-4-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-4-description')}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "ai-capabilities": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('capabilities.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('capabilities.description-title')}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('capabilities.subtitle')}</h3>
                    <p className="text-indigo-800">{t('capabilities.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-200 rounded-lg">
                                <Zap className="h-5 w-5 text-blue-700" />
                            </div>
                            <h4 className="font-semibold text-blue-900">{t('capabilities.plus-title')}</h4>
                        </div>
                        <p className="text-blue-800 text-sm mb-4">{t('capabilities.plus-description')}</p>
                        <ul className="space-y-2">
                            {(['plus-item-1', 'plus-item-2', 'plus-item-3', 'plus-item-4'] as const).map((key) => (
                                <li key={key} className="flex items-start gap-2 text-sm text-blue-800">
                                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    {t(`capabilities.${key}`)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-200 rounded-lg">
                                <Bot className="h-5 w-5 text-purple-700" />
                            </div>
                            <h4 className="font-semibold text-purple-900">{t('capabilities.pro-title')}</h4>
                        </div>
                        <p className="text-purple-800 text-sm mb-4">{t('capabilities.pro-description')}</p>
                        <ul className="space-y-2">
                            {(['pro-item-1', 'pro-item-2', 'pro-item-3', 'pro-item-4'] as const).map((key) => (
                                <li key={key} className="flex items-start gap-2 text-sm text-purple-800">
                                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                                    {t(`capabilities.${key}`)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ),

        "ai-usage": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('usage.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('usage.description-title')}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('usage.subtitle')}</h3>
                    <p className="text-indigo-800">{t('usage.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('usage.tips-title')}</h3>
                    <div className="space-y-3">
                        {(['tip-1', 'tip-2', 'tip-3', 'tip-4'] as const).map((key, i) => (
                            <div key={key} className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <p className="text-gray-700 text-sm">{t(`usage.${key}`)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        {t('usage.limitations-title')}
                    </h3>
                    <div className="space-y-2">
                        {(['limitation-1', 'limitation-2', 'limitation-3'] as const).map((key) => (
                            <div key={key} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-amber-800 text-sm">{t(`usage.${key}`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    };
}
