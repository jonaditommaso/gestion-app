'use client'

import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, FileText, CreditCard, Users } from 'lucide-react';
import WorkspacesDocumentation from '@/features/landing/components/docs/WorkspacesDocumentation';
import RecordsDocumentation from '@/features/landing/components/docs/RecordsDocumentation';
import BillingDocumentation from '@/features/landing/components/docs/BillingDocumentation';
import TeamDocumentation from '@/features/landing/components/docs/TeamDocumentation';
import { useTranslations } from 'next-intl';

export default function ProductDocsClient() {
    const t = useTranslations('landing.docs');
    const [activeSection, setActiveSection] = useState("workspace-overview");
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        workspaces: true,
        records: false,
        billing: false,
        team: false
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
            id: "records",
            title: "Records",
            icon: <FileText className="h-4 w-4" />,
            subsections: [
                { id: "records-overview", title: "Visión General" },
                { id: "records-create", title: "Crear Tablas" },
                { id: "records-management", title: "Gestión de Datos" }
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
        }
    ]

    const getContent = () => {
        const workspacesSections = WorkspacesDocumentation();
        const recordsSections = RecordsDocumentation();
        const billingSections = BillingDocumentation();
        const teamSections = TeamDocumentation();

        // Mapear secciones de workspaces
        if (workspacesSections[activeSection as keyof typeof workspacesSections]) {
            return workspacesSections[activeSection as keyof typeof workspacesSections];
        }

        // Mapear secciones de records
        if (recordsSections[activeSection as keyof typeof recordsSections]) {
            return recordsSections[activeSection as keyof typeof recordsSections];
        }

        // Mapear secciones de billing
        if (billingSections[activeSection as keyof typeof billingSections]) {
            return billingSections[activeSection as keyof typeof billingSections];
        }

        // Mapear secciones de team
        if (teamSections[activeSection as keyof typeof teamSections]) {
            return teamSections[activeSection as keyof typeof teamSections];
        }

        // Contenido por defecto
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