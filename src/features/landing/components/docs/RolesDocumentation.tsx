'use client'

import { Shield, Users, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function RolesDocumentation() {
    const t = useTranslations('landing.docs.roles');

    return {
        "roles-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-slate-700">{t('overview.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.roles-title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {([
                            { key: 'role-1', color: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-200' },
                            { key: 'role-2', color: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-200' },
                            { key: 'role-3', color: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-200' },
                            { key: 'role-4', color: 'bg-gray-100', iconColor: 'text-gray-600', border: 'border-gray-200' },
                        ] as const).map(({ key, color, iconColor, border }) => (
                            <div key={key} className={`border ${border} rounded-lg p-6`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 ${color} rounded-lg`}>
                                        <Shield className={`h-5 w-5 ${iconColor}`} />
                                    </div>
                                    <h4 className="font-bold text-gray-900">{t(`overview.${key}-title`)}</h4>
                                </div>
                                <p className="text-gray-600 text-sm">{t(`overview.${key}-description`)}</p>
                            </div>
                        ))}
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

        "roles-permissions": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('permissions.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('permissions.description-title')}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('permissions.subtitle')}</h3>
                    <p className="text-slate-700">{t('permissions.description-subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('permissions.categories-title')}</h3>
                    <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-blue-600" />
                                {t('permissions.tasks-title')}
                            </h4>
                            <ul className="space-y-1">
                                {(['tasks-item-1', 'tasks-item-2', 'tasks-item-3', 'tasks-item-4'] as const).map((key) => (
                                    <li key={key} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        {t(`permissions.${key}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-red-600" />
                                {t('permissions.billing-title')}
                            </h4>
                            <ul className="space-y-1">
                                {(['billing-item-1', 'billing-item-2', 'billing-item-3', 'billing-item-4'] as const).map((key) => (
                                    <li key={key} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                        {t(`permissions.${key}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-green-600" />
                                {t('permissions.sells-title')}
                            </h4>
                            <ul className="space-y-1">
                                {(['sells-item-1', 'sells-item-2', 'sells-item-3', 'sells-item-4'] as const).map((key) => (
                                    <li key={key} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        {t(`permissions.${key}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                {t('permissions.admin-title')}
                            </h4>
                            <ul className="space-y-1">
                                {(['admin-item-1', 'admin-item-2'] as const).map((key) => (
                                    <li key={key} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                        {t(`permissions.${key}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('permissions.best-practices-title')}</h3>
                    <div className="space-y-3">
                        {(['best-practice-1', 'best-practice-2', 'best-practice-3', 'best-practice-4'] as const).map((key, i) => (
                            <div key={key} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <p className="text-gray-700 text-sm">{t(`permissions.${key}`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    };
}
