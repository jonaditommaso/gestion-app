import { BarChart3, Calendar, FolderOpen, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl";

export default function BillingDocumentation() {
    const t = useTranslations('landing.docs.billing');

    return {
        "billing-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("overview.title")}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t("overview.description-title")}
                    </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">{t("overview.subtitle")}</h3>
                    <p className="text-purple-800">
                        {t("overview.description-subtitle")}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t("overview.main-features")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t("overview.section-1-title")}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t("overview.section-1-description")}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t("overview.section-2-title")}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t("overview.section-2-description")}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t("overview.views")}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex justify-center mb-2">
                                <FolderOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-blue-900 mb-2">{t("overview.details")}</h4>
                            <p className="text-sm text-blue-800">{t("overview.details-description")}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex justify-center mb-2">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-green-900 mb-2">{t("overview.calendar")}</h4>
                            <p className="text-sm text-green-800">{t("overview.calendar-description")}</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex justify-center mb-2">
                                <FolderOpen className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h4 className="font-semibold text-yellow-900 mb-2">{t("overview.categories")}</h4>
                            <p className="text-sm text-yellow-800">{t("overview.categories-description")}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex justify-center mb-2">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-purple-900 mb-2">{t("overview.stats")}</h4>
                            <p className="text-sm text-purple-800">{t("overview.stats-description")}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "billing-operations": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("operations.title")}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t("operations.description-title")}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">{t("operations.subtitle")}</h3>
                    <p className="text-green-800">
                        {t("operations.description-subtitle")}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('operations.section-1-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                            <h4 className="text-xl font-semibold text-green-900 mb-3">{t('operations.section-1-subtitle-1')}</h4>
                            <p className="text-green-800 mb-4">
                                {t('operations.section-1-description-1')}
                            </p>
                            <ul className="space-y-2 text-sm text-green-700">
                                <li>• {t('operations.section-1-item-1')}</li>
                                <li>• {t('operations.section-1-item-2')}</li>
                                <li>• {t('operations.section-1-item-3')}</li>
                                <li>• {t('operations.section-1-item-4')}</li>
                            </ul>
                        </div>

                        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                            <h4 className="text-xl font-semibold text-red-900 mb-3">{t('operations.section-1-subtitle-2')}</h4>
                            <p className="text-red-800 mb-4">
                                {t('operations.section-1-description-2')}
                            </p>
                            <ul className="space-y-2 text-sm text-red-700">
                                <li>• {t('operations.section-1-item-5')}</li>
                                <li>• {t('operations.section-1-item-6')}</li>
                                <li>• {t('operations.section-1-item-7')}</li>
                                <li>• {t('operations.section-1-item-8')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('operations.section-2-title')}</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-blue-800 mb-4">
                            {t('operations.section-2-description')}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm text-center">{t('operations.section-2-item-1')}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm text-center">{t('operations.section-2-item-2')}</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm text-center">{t('operations.section-2-item-3')}</span>
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm text-center">{t('operations.section-2-item-4')}</span>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "billing-analytics": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('analytics.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('analytics.description-title')}
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('analytics.subtitle')}</h3>
                    <p className="text-indigo-800">
                        {t('analytics.description-subtitle')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('analytics.main-metrics')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="text-2xl font-bold text-green-600 mb-2">{t('analytics.section-1-title-1')}</h4>
                            <p className="text-green-800">{t('analytics.section-1-description-1')}</p>
                        </div>
                        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="text-2xl font-bold text-red-600 mb-2">{t('analytics.section-1-title-2')}</h4>
                            <p className="text-red-800">{t('analytics.section-1-description-2')}</p>
                        </div>
                        <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-2xl font-bold text-blue-600 mb-2">{t('analytics.section-1-title-3')}</h4>
                            <p className="text-blue-800">{t('analytics.section-1-description-3')}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('analytics.reports-types')}</h3>
                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('analytics.section-2-title-1')}</h4>
                            <p className="text-gray-600 mb-3">
                                {t('analytics.section-2-description-1')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{t('analytics.section-2-item-1')}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{t('analytics.section-2-item-2')}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{t('analytics.section-2-item-3')}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{t('analytics.section-2-item-4')}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{t('analytics.section-2-item-5')}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('analytics.section-2-title-2')}</h4>
                            <p className="text-gray-600">
                                {t('analytics.section-2-description-2')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}