import { Users, Shield, Mail, Activity, UserCheck, Settings } from "lucide-react"
import { useTranslations } from "next-intl"

export default function TeamDocumentation() {
    const t = useTranslations('landing.docs.team');

    return {
        "team-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("overview.title")}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t("overview.description-title")}
                    </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">{t("overview.subtitle")}</h3>
                    <p className="text-orange-800">
                        {t("overview.description-subtitle")}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t("overview.main-features")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t("overview.section-1-title")}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t("overview.section-1-description")}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t("overview.section-2-title")}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t("overview.section-2-description")}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t("overview.section-3-title")}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t("overview.section-3-description")}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Settings className="h-5 w-5 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t("overview.section-4-title")}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t("overview.section-4-description")}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t("overview.predefined-roles")}</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="h-5 w-5 text-red-500" />
                                <h4 className="font-semibold text-gray-900">{t("overview.role-1-title")}</h4>
                            </div>
                            <p className="text-gray-600">{t("overview.role-1-description")}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <h4 className="font-semibold text-gray-900">{t("overview.role-2-title")}</h4>
                            </div>
                            <p className="text-gray-600">{t("overview.role-2-description")}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
                            <div className="flex items-center gap-3 mb-2">
                                <UserCheck className="h-5 w-5 text-green-500" />
                                <h4 className="font-semibold text-gray-900">{t("overview.role-3-title")}</h4>
                            </div>
                            <p className="text-gray-600">{t("overview.role-3-description")}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border-l-4 border-gray-400">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="h-5 w-5 text-gray-500" />
                                <h4 className="font-semibold text-gray-900">{t("overview.role-4-title")}</h4>
                            </div>
                            <p className="text-gray-600">{t("overview.role-4-description")}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "team-invitations": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("invitations.title")}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t("invitations.description-title")}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("invitations.subtitle")}</h3>
                    <p className="text-blue-800">
                        {t("invitations.description-subtitle")}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t("invitations.process-title")}</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                1
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("invitations.section-1-title")}</h4>
                                <p className="text-gray-600">
                                    {t("invitations.section-1-description")}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                2
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("invitations.section-2-title")}</h4>
                                <p className="text-gray-600">
                                    {t("invitations.section-2-description")}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                3
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("invitations.section-3-title")}</h4>
                                <p className="text-gray-600">
                                    {t("invitations.section-3-description")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t("invitations.active-members")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">{t("invitations.modify-roles-title")}</h4>
                            <p className="text-gray-600 mb-3">
                                {t("invitations.modify-roles-description")}
                            </p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">{t("invitations.revoke-access-title")}</h4>
                            <p className="text-gray-600 mb-3">
                                {t("invitations.revoke-access-description")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "team-permissions": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("permissions.title")}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t("permissions.description-title")}
                    </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">{t("permissions.subtitle")}</h3>
                    <p className="text-red-800">
                        {t("permissions.description-subtitle")}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t("permissions.categories-title")}</h3>

                    <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t("permissions.workspaces-title")}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm text-center">{t("permissions.workspaces-permission-1")}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm text-center">{t("permissions.workspaces-permission-2")}</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm text-center">{t("permissions.workspaces-permission-3")}</span>
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm text-center">{t("permissions.workspaces-permission-4")}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t("permissions.records-title")}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm text-center">{t("permissions.records-permission-1")}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm text-center">{t("permissions.records-permission-2")}</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm text-center">{t("permissions.records-permission-3")}</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm text-center">{t("permissions.records-permission-4")}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t("permissions.billing-title")}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm text-center">{t("permissions.billing-permission-1")}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm text-center">{t("permissions.billing-permission-2")}</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm text-center">{t("permissions.billing-permission-3")}</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm text-center">{t("permissions.billing-permission-4")}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">{t("permissions.administration-title")}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm text-center">{t("permissions.administration-permission-1")}</span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm text-center">{t("permissions.administration-permission-2")}</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm text-center">{t("permissions.administration-permission-3")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t("permissions.best-practices-title")}</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <ul className="space-y-2 text-yellow-800">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{t("permissions.best-practice-1")}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{t("permissions.best-practice-2")}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{t("permissions.best-practice-3")}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{t("permissions.best-practice-4")}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}