import { Table, Kanban, Calendar, Users, GripVertical, Filter, Settings, Share2, GitBranch } from "lucide-react"
import { useTranslations } from "next-intl"

export default function WorkspacesDocumentation() {
    const t = useTranslations('landing.docs.workspaces');

    return {
        "workspace-overview": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('overview.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('overview.description-title')}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('overview.subtitle')}</h3>
                    <p className="text-blue-800">
                        {t('overview.description-subtitle')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('overview.main-features')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Table className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-1-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.section-1-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-2-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.section-2-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Kanban className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-3-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.section-3-description')}
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{t('overview.section-4-title')}</h4>
                            </div>
                            <p className="text-gray-600">
                                {t('overview.section-4-description')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "workspace-creation": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('creation.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('creation.description-title')}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">{t('creation.subtitle')}</h3>
                    <p className="text-green-800 mb-4">
                        {t('creation.description-subtitle')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('creation.creation-steps')}</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                1
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('creation.section-1-title')}</h4>
                                <p className="text-gray-600">
                                    {t('creation.section-1-description')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                2
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('creation.section-2-title')}</h4>
                                <p className="text-gray-600">
                                    {t('creation.section-2-description')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                3
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('creation.section-3-title')}</h4>
                                <p className="text-gray-600">
                                    {t('creation.section-3-description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "workspace-dashboard": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('dashboard.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('dashboard.description-title')}
                    </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">{t('dashboard.subtitle')}</h3>
                    <p className="text-purple-800">
                        {t('dashboard.description-subtitle')}
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('dashboard.main-elements')}</h3>
                    <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('dashboard.section-1-title')}</h4>
                            <p className="text-gray-600 mb-4">
                                {t('dashboard.section-1-description')}
                            </p>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-700">
                                    <strong>{t('dashboard.section-1-subtitle')}:</strong> {t('dashboard.section-1-subtitle-description')}
                                </p>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('dashboard.section-2-title')}</h4>
                            <p className="text-gray-600 mb-4">
                                {t('dashboard.section-2-description')}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-md">
                                    <h5 className="font-semibold text-blue-900 mb-2">{t('dashboard.section-2-subtitle-1')}</h5>
                                    <p className="text-sm text-blue-800">{t('dashboard.section-2-subtitle-1-description')}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-md">
                                    <h5 className="font-semibold text-green-900 mb-2">{t('dashboard.section-2-subtitle-2')}</h5>
                                    <p className="text-sm text-green-800">{t('dashboard.section-2-subtitle-2-description')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),

        "workspace-views": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('views.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('views.description-title')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                        <div className="flex items-center gap-3 mb-4">
                            <Table className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-semibold text-blue-900">{t('views.table')}</h3>
                        </div>
                        <p className="text-blue-800 mb-4">
                            {t('views.table-description')}
                        </p>
                        <div className="space-y-2 text-sm text-blue-700">
                            <div>• {t('views.table-item-1')}</div>
                            <div>• {t('views.table-item-2')}</div>
                            <div>• {t('views.table-item-3')}</div>
                            <div>• {t('views.table-item-4')}</div>
                        </div>
                    </div>

                    <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                        <div className="flex items-center gap-3 mb-4">
                            <Kanban className="h-6 w-6 text-purple-600" />
                            <h3 className="text-xl font-semibold text-purple-900">{t('views.kanban')}</h3>
                        </div>
                        <p className="text-purple-800 mb-4">
                            {t('views.kanban-description')}
                        </p>
                        <div className="space-y-2 text-sm text-purple-700">
                            <div>• {t('views.kanban-item-1')}</div>
                            <div>• {t('views.kanban-item-2')}</div>
                            <div>• {t('views.kanban-item-3')}</div>
                            <div>• {t('views.kanban-item-4')}</div>
                        </div>
                    </div>

                    <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-6 w-6 text-orange-600" />
                            <h3 className="text-xl font-semibold text-orange-900">{t('views.calendar')}</h3>
                        </div>
                        <p className="text-orange-800 mb-4">
                            {t('views.calendar-description')}
                        </p>
                        <div className="space-y-2 text-sm text-orange-700">
                            <div>• {t('views.calendar-item-1')}</div>
                            <div>• {t('views.calendar-item-2')}</div>
                            <div>• {t('views.calendar-item-3')}</div>
                            <div>• {t('views.calendar-item-4')}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('views.kanban-states-title')}</h3>
                    <div className="grid grid-cols-5 gap-2 mb-4 text-xs">
                        <div className="bg-pink-100 text-pink-800 p-3 rounded text-center font-medium">{t('views.state-1')}</div>
                        <div className="bg-red-100 text-red-800 p-3 rounded text-center font-medium">{t('views.state-2')}</div>
                        <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-center font-medium">{t('views.state-3')}</div>
                        <div className="bg-blue-100 text-blue-800 p-3 rounded text-center font-medium">{t('views.state-4')}</div>
                        <div className="bg-green-100 text-green-800 p-3 rounded text-center font-medium">{t('views.state-5')}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                            <GripVertical className="h-4 w-4" />
                            {t('views.drag-drop-title')}
                        </h4>
                        <p className="text-sm text-yellow-800">
                            {t('views.drag-drop-description')}
                        </p>
                    </div>
                </div>
            </div>
        ),

        "workspace-advanced": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('advanced.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('advanced.description-title')}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('advanced.subtitle')}</h3>
                    <p className="text-indigo-800">{t('advanced.description-subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-6">
                        <h4 className="font-semibold text-indigo-900 mb-2">{t('advanced.section-1-title')}</h4>
                        <p className="text-sm text-indigo-800">{t('advanced.section-1-description')}</p>
                    </div>

                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {t('advanced.section-2-title')}
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li>• {t('advanced.section-2-item-1')}</li>
                            <li>• {t('advanced.section-2-item-2')}</li>
                            <li>• {t('advanced.section-2-item-3')}</li>
                            <li>• {t('advanced.section-2-item-4')}</li>
                        </ul>
                    </div>

                    <div className="border border-purple-200 bg-purple-50 rounded-lg p-6">
                        <h4 className="font-semibold text-purple-900 mb-2">{t('advanced.section-3-title')}</h4>
                        <p className="text-sm text-purple-800">{t('advanced.section-3-description')}</p>
                    </div>
                </div>
            </div>
        ),

        "workspace-settings": (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('settings.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('settings.description-title')}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('settings.subtitle')}</h3>
                    <p className="text-slate-700">{t('settings.description-subtitle')}</p>
                </div>

                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-slate-600" />
                            {t('settings.section-1-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('settings.section-1-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('settings.section-2-title')}</h4>
                        <p className="text-gray-600 text-sm">{t('settings.section-2-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-slate-700" />
                            {t('settings.section-3-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('settings.section-3-description')}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-blue-700" />
                            {t('settings.section-4-title')}
                        </h4>
                        <p className="text-gray-600 text-sm">{t('settings.section-4-description')}</p>
                    </div>
                </div>
            </div>
        )
    }
}