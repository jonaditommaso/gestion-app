'use client'

import { Archive, Filter, Inbox, MailPlus, Reply, Send, Star } from "lucide-react"
import { useTranslations } from "next-intl"

export default function MessagesDocumentation() {
    const t = useTranslations('landing.docs.messages');

    return {
        "messages-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-cyan-800">{t('overview.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.main-features')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-cyan-100 rounded-lg">
                                    <Inbox className="h-5 w-5 text-cyan-700" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-1-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Filter className="h-5 w-5 text-blue-700" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-2-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Star className="h-5 w-5 text-amber-700" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-3-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-3-description')}</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Archive className="h-5 w-5 text-purple-700" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-4-title')}</h4>
                            </div>
                            <p className="text-gray-600">{t('overview.section-4-description')}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "messages-inbox": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('inbox.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('inbox.description-title')}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('inbox.subtitle')}</h3>
                    <p className="text-blue-800">{t('inbox.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('inbox.tabs-title')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(['tab-1', 'tab-2', 'tab-3', 'tab-4', 'tab-5'] as const).map((key) => (
                            <div key={key} className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 text-center">
                                {t(`inbox.${key}`)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('inbox.filters-title')}</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            {(['filter-1', 'filter-2', 'filter-3', 'filter-4'] as const).map((key) => (
                                <li key={key}>• {t(`inbox.${key}`)}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('inbox.bulk-actions-title')}</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            {(['bulk-1', 'bulk-2', 'bulk-3', 'bulk-4'] as const).map((key) => (
                                <li key={key}>• {t(`inbox.${key}`)}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ),

        "messages-compose": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('compose.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('compose.description-title')}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-3">{t('compose.subtitle')}</h3>
                    <p className="text-emerald-800">{t('compose.description-subtitle')}</p>
                </div>

                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <MailPlus className="h-4 w-4 text-emerald-700" />
                            {t('compose.section-1-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('compose.section-1-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Reply className="h-4 w-4 text-blue-700" />
                            {t('compose.section-2-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('compose.section-2-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Send className="h-4 w-4 text-violet-700" />
                            {t('compose.section-3-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('compose.section-3-description')}</p>
                    </div>
                </div>
            </div>
        )
    }
}
