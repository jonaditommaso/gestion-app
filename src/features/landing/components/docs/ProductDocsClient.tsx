'use client'

import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, CreditCard, Users, TrendingUp, Bot, Shield, LayoutDashboard } from 'lucide-react';
import WorkspacesDocumentation from '@/features/landing/components/docs/WorkspacesDocumentation';
import SellsDocumentation from '@/features/landing/components/docs/SellsDocumentation';
import AIAssistantDocumentation from '@/features/landing/components/docs/AIAssistantDocumentation';
import BillingDocumentation from '@/features/landing/components/docs/BillingDocumentation';
import TeamDocumentation from '@/features/landing/components/docs/TeamDocumentation';
import RolesDocumentation from '@/features/landing/components/docs/RolesDocumentation';
import HomeDocumentation from '@/features/landing/components/docs/HomeDocumentation';
import { useTranslations } from 'next-intl';

export default function ProductDocsClient() {
    const t = useTranslations('landing.docs');
    const [activeSection, setActiveSection] = useState("workspace-overview");
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        workspaces: true,
        sells: false,
        'ai-assistant': false,
        billing: false,
        team: false,
        roles: false,
        home: false,
    });

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const navigation = [
        {
            id: "workspaces",
            title: "Workspaces",
            icon: <Settings className="h-4 w-4" />,
            subsections: [
                { id: "workspace-overview", title: "Visión General" },
                { id: "workspace-creation", title: "Crear Workspace" },
                { id: "workspace-dashboard", title: "Dashboard Principal" },
                { id: "workspace-views", title: "Vistas de Tareas" }
            ]
        },
        {
            id: "sells",
            title: "Ventas & CRM",
            icon: <TrendingUp className="h-4 w-4" />,
            subsections: [
                { id: "sells-overview", title: "Visión General" },
                { id: "sells-pipeline", title: "Pipeline & Tratos" },
                { id: "sells-analytics", title: "Analytics & Reportes" }
            ]
        },
        {
            id: "ai-assistant",
            title: "AI Assistant",
            icon: <Bot className="h-4 w-4" />,
            subsections: [
                { id: "ai-overview", title: "Visión General" },
                { id: "ai-capabilities", title: "Capacidades por Plan" },
                { id: "ai-usage", title: "Cómo Usarlo" }
            ]
        },
        {
            id: "billing",
            title: "Billing Management",
            icon: <CreditCard className="h-4 w-4" />,
            subsections: [
                { id: "billing-overview", title: "Visión General" },
                { id: "billing-operations", title: "Operaciones" },
                { id: "billing-analytics", title: "Analytics y Reportes" }
            ]
        },
        {
            id: "team",
            title: "Team Management",
            icon: <Users className="h-4 w-4" />,
            subsections: [
                { id: "team-overview", title: "Visión General" },
                { id: "team-invitations", title: "Invitaciones" },
                { id: "team-permissions", title: "Permisos" }
            ]
        },
        {
            id: "roles",
            title: "Roles & Permisos",
            icon: <Shield className="h-4 w-4" />,
            subsections: [
                { id: "roles-overview", title: "Visión General" },
                { id: "roles-permissions", title: "Permisos Granulares" }
            ]
        },
        {
            id: "home",
            title: "Home Dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
            subsections: [
                { id: "home-overview", title: "Visión General" },
                { id: "home-widgets", title: "Widgets Disponibles" }
            ]
        },
    ]

    const getContent = () => {
        const workspacesSections = WorkspacesDocumentation();
        const sellsSections = SellsDocumentation();
        const aiSections = AIAssistantDocumentation();
        const billingSections = BillingDocumentation();
        const teamSections = TeamDocumentation();
        const rolesSections = RolesDocumentation();
        const homeSections = HomeDocumentation();

        if (workspacesSections[activeSection as keyof typeof workspacesSections]) {
            return workspacesSections[activeSection as keyof typeof workspacesSections];
        }
        if (sellsSections[activeSection as keyof typeof sellsSections]) {
            return sellsSections[activeSection as keyof typeof sellsSections];
        }
        if (aiSections[activeSection as keyof typeof aiSections]) {
            return aiSections[activeSection as keyof typeof aiSections];
        }
        if (billingSections[activeSection as keyof typeof billingSections]) {
            return billingSections[activeSection as keyof typeof billingSections];
        }
        if (teamSections[activeSection as keyof typeof teamSections]) {
            return teamSections[activeSection as keyof typeof teamSections];
        }
        if (rolesSections[activeSection as keyof typeof rolesSections]) {
            return rolesSections[activeSection as keyof typeof rolesSections];
        }
        if (homeSections[activeSection as keyof typeof homeSections]) {
            return homeSections[activeSection as keyof typeof homeSections];
        }

        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentación de Productos</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Selecciona una sección del menú lateral para explorar las funcionalidades de nuestra plataforma de gestión empresarial.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans mt-12">
            {/* Spacer for fixed navbar */}
            {/* <div className="h-16"></div> */}
            <div className="flex">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 min-h-screen sticky top-16">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                        <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
                    </div>

                    <nav className="p-4">
                        {navigation.map((section) => (
                            <div key={section.id} className="mb-2">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {section.icon}
                                        <span className="font-medium text-gray-900">{section.title}</span>
                                    </div>
                                    {expandedSections[section.id] ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>

                                {expandedSections[section.id] && (
                                    <div className="ml-7 mt-1 space-y-1">
                                        {section.subsections.map((subsection) => (
                                            <button
                                                key={subsection.id}
                                                onClick={() => setActiveSection(subsection.id)}
                                                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                                    activeSection === subsection.id
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                            >
                                                {subsection.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Main content */}
                <div className="flex-1">
                    <div className="max-w-4xl mx-auto p-8">
                        {getContent()}
                    </div>
                </div>
            </div>

            {/* <LandingFooter /> */}
        </div>
    );
}