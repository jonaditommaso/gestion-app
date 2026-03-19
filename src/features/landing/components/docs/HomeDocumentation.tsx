'use client'

import { LayoutDashboard, StickyNote, MessageSquare, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function HomeDocumentation() {
    const t = useTranslations('landing.docs.home');

    return {
        "home-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-orange-800">{t('overview.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.features-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <StickyNote className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-1-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-2-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <LayoutDashboard className="h-5 w-5 text-orange-600" />
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

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-amber-900 mb-1">{t('overview.plan-note-title')}</h4>
                            <p className="text-amber-800 text-sm">{t('overview.plan-note-description')}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "home-widgets": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('widgets.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('widgets.description-title')}</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">{t('widgets.subtitle')}</h3>
                    <p className="text-orange-800">{t('widgets.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('widgets.personal-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {([
                            'widget-notes', 'widget-messages', 'widget-send', 'widget-shortcut',
                            'widget-meet', 'widget-calendar', 'widget-events', 'widget-todo',
                        ] as const).map((key) => (
                            <div key={key} className="border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t(`widgets.${key}-title`)}</p>
                                    <p className="text-gray-500 text-xs mt-1">{t(`widgets.${key}-description`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('widgets.business-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {([
                            'widget-billing', 'widget-health', 'widget-velocity', 'widget-pipeline',
                            'widget-activity', 'widget-payments',
                        ] as const).map((key) => (
                            <div key={key} className="border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t(`widgets.${key}-title`)}</p>
                                    <p className="text-gray-500 text-xs mt-1">{t(`widgets.${key}-description`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('widgets.quick-actions-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['widget-new-deal', 'widget-new-task', 'widget-new-billing'] as const).map((key) => (
                            <div key={key} className="border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{t(`widgets.${key}-title`)}</p>
                                    <p className="text-gray-500 text-xs mt-1">{t(`widgets.${key}-description`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    };
}
