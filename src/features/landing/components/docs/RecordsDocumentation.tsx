import { FileText, Upload, Filter, Search, History, Download } from "lucide-react"
import { useTranslations } from "next-intl";

export default function RecordsDocumentation() {
    const t = useTranslations('landing.docs.records');

    return {
        "records-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('overview.description')}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">{t('overview.dynamic-tables-title')}</h3>
                    <p className="text-green-800">
                        {t('overview.dynamic-tables-description')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.main-features-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Upload className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.import-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.import-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.custom-fields-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.custom-fields-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Filter className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.advanced-filters-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.advanced-filters-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Search className="h-5 w-5 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.smart-search-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.smart-search-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <History className="h-5 w-5 text-red-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.change-history-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.change-history-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Download className="h-5 w-5 text-yellow-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.flexible-export-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.flexible-export-description')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "records-create": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('creation.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('creation.description')}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('creation.creation-process-title')}</h3>
                    <p className="text-blue-800">
                        {t('creation.creation-process-description')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('creation.steps-title')}</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                                1
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('creation.step-1-title')}</h4>
                                <p className="text-gray-600">
                                    {t('creation.step-1-description')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                                2
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('creation.step-2-title')}</h4>
                                <p className="text-gray-600">
                                    {t('creation.step-2-description')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                                3
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('creation.step-3-title')}</h4>
                                <p className="text-gray-600">
                                    {t('creation.step-3-description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('creation.field-types-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{t('creation.basic-fields-title')}</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• {t('creation.basic-field-1')}</li>
                                <li>• {t('creation.basic-field-2')}</li>
                                <li>• {t('creation.basic-field-3')}</li>
                                <li>• {t('creation.basic-field-4')}</li>
                            </ul>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{t('creation.advanced-fields-title')}</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• {t('creation.advanced-field-1')}</li>
                                <li>• {t('creation.advanced-field-2')}</li>
                                <li>• {t('creation.advanced-field-3')}</li>
                                <li>• {t('creation.advanced-field-4')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "records-management": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('management.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('management.description')}
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('management.management-interface-title')}</h3>
                    <p className="text-indigo-800">
                        {t('management.management-interface-description')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('management.functionalities-title')}</h3>

                    <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('management.inline-editing-title')}</h4>
                            <p className="text-gray-600 mb-4">
                                {t('management.inline-editing-description')}
                            </p>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-700">
                                    <strong>Tip:</strong> {t('management.inline-editing-tip')}
                                </p>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('management.custom-views-title')}</h4>
                            <p className="text-gray-600 mb-4">
                                {t('management.custom-views-description')}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-blue-50 p-3 rounded text-center">
                                    <strong className="text-blue-900">{t('management.complete-view')}</strong>
                                    <p className="text-xs text-blue-700">{t('management.complete-view-description')}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded text-center">
                                    <strong className="text-green-900">{t('management.summary-view')}</strong>
                                    <p className="text-xs text-green-700">{t('management.summary-view-description')}</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded text-center">
                                    <strong className="text-purple-900">{t('management.filtered-view')}</strong>
                                    <p className="text-xs text-purple-700">{t('management.filtered-view-description')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('management.batch-operations-title')}</h4>
                            <p className="text-gray-600 mb-4">
                                {t('management.batch-operations-description')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{t('management.batch-edit')}</span>
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">{t('management.batch-delete')}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{t('management.batch-export')}</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{t('management.batch-duplicate')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}