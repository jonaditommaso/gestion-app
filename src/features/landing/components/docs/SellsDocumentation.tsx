'use client'

import { TrendingUp, BarChart3, Target, Users, Kanban, Table2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function SellsDocumentation() {
    const t = useTranslations('landing.docs.sells');

    return {
        "sells-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-green-800">{t('overview.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.main-features')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Kanban className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-1-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Table2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-2-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Target className="h-5 w-5 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-3-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-3-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-4-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-4-description')}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "sells-pipeline": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('pipeline.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('pipeline.description-title')}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">{t('pipeline.subtitle')}</h3>
                    <p className="text-green-800">{t('pipeline.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('pipeline.stages-title')}</h3>
                        <div className="space-y-3">
                            {(['stage-1', 'stage-2', 'stage-3', 'stage-4'] as const).map((key, i) => {
                                const colors = ['bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-green-100 text-green-700'];
                                return (
                                    <div key={key} className={`flex items-center gap-3 p-3 rounded-lg ${colors[i]}`}>
                                        <span className="font-semibold text-sm">{i + 1}</span>
                                        <span className="text-sm">{t(`pipeline.${key}`)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('pipeline.outcomes-title')}</h3>
                        <div className="space-y-3">
                            {(['outcome-1', 'outcome-2', 'outcome-3'] as const).map((key, i) => {
                                const colors = ['bg-emerald-100 text-emerald-700', 'bg-red-100 text-red-700', 'bg-gray-100 text-gray-700'];
                                return (
                                    <div key={key} className={`flex items-center gap-3 p-3 rounded-lg ${colors[i]}`}>
                                        <span className="text-sm">{t(`pipeline.${key}`)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        {t('pipeline.boards-title')}
                    </h3>
                    <p className="text-gray-600 mb-4">{t('pipeline.boards-description')}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        {t('pipeline.deal-detail-title')}
                    </h3>
                    <p className="text-gray-600">{t('pipeline.deal-detail-description')}</p>
                </div>
            </div>
        ),

        "sells-analytics": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('analytics.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('analytics.description-title')}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">{t('analytics.subtitle')}</h3>
                    <p className="text-purple-800">{t('analytics.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('analytics.main-metrics')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('analytics.section-1-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('analytics.section-1-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('analytics.section-2-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('analytics.section-2-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Target className="h-5 w-5 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('analytics.section-3-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('analytics.section-3-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('analytics.section-4-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('analytics.section-4-description')}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
    };
}
