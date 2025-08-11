import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Code, Zap, Shield, Users } from 'lucide-react';

const DocsView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing')

    if(user) redirect('/');

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800'>
            {/* Documentation Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />

                <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 flex items-center gap-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                <Code className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-sm font-medium text-gray-400">
                                Documentación
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Guía completa de{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                                Gestionate
                            </span>
                        </h1>

                        <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl">
                            Todo lo que necesitas saber para implementar y maximizar el potencial de tu plataforma de gestión empresarial. Desde la configuración inicial hasta funciones avanzadas.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <a
                                href="#introduction"
                                className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 inline-flex items-center justify-center gap-x-2"
                            >
                                <Code className="h-4 w-4" />
                                Comenzar tutorial
                            </a>
                            <a
                                href="#how-it-works"
                                className="rounded-lg border border-white/20 px-6 py-3 text-base font-semibold text-white hover:bg-white/5 transition-all duration-200 inline-flex items-center justify-center gap-x-2"
                            >
                                <Zap className="h-4 w-4" />
                                Ver proceso
                            </a>
                        </div>

                        {/* Quick navigation cards */}
                        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <a href="#introduction" className="group relative rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-200">
                                <div className="flex items-center gap-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                                        <Shield className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Introducción</h3>
                                        <p className="text-xs text-gray-400">Primeros pasos</p>
                                    </div>
                                </div>
                            </a>

                            <a href="#how-it-works" className="group relative rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-200">
                                <div className="flex items-center gap-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                                        <Zap className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Funcionamiento</h3>
                                        <p className="text-xs text-gray-400">Proceso completo</p>
                                    </div>
                                </div>
                            </a>

                            <a href="#customize" className="group relative rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-200">
                                <div className="flex items-center gap-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                                        <Users className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Personalización</h3>
                                        <p className="text-xs text-gray-400">Configuración avanzada</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 sm:py-32 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600">Todo lo que necesitas</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Herramientas poderosas para equipos modernos
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Descubre cómo Gestionate puede transformar la manera en que tu equipo colabora y gestiona proyectos.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <Code className="h-5 w-5 flex-none text-blue-600" />
                                    Introducción
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">{t("docs-intro-description")}</p>
                                    <p className="mt-6">
                                        <a href="#introduction" className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                                            Aprende más <span aria-hidden="true">→</span>
                                        </a>
                                    </p>
                                </dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <Zap className="h-5 w-5 flex-none text-blue-600" />
                                    Cómo funciona
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">{t("docs-how-it-works-description")}</p>
                                    <p className="mt-6">
                                        <a href="#how-it-works" className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                                            Ver proceso <span aria-hidden="true">→</span>
                                        </a>
                                    </p>
                                </dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <Users className="h-5 w-5 flex-none text-blue-600" />
                                    Personalización
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">{t("docs-now-what-description-1")} Gestionate {t("docs-now-what-description-2")}</p>
                                    <p className="mt-6">
                                        <a href="#customize" className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                                            Personalizar <span aria-hidden="true">→</span>
                                        </a>
                                    </p>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="bg-gray-50">
                {/* Introduction Section */}
                <div id="introduction" className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl">
                            <div className="text-center mb-16">
                                <h2 className="text-base font-semibold leading-7 text-blue-600">Comienza aquí</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    {t("docs-intro-title")}
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                                    <span className="font-semibold">Gestionate</span> {t("docs-intro-description")}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-8">
                                    <div className="flex gap-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                            <Shield className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Seguro y confiable</h3>
                                            <p className="mt-2 text-gray-600">Tus datos están protegidos con encriptación de extremo a extremo y sistemas de backup automáticos.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                            <Zap className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Rápido y eficiente</h3>
                                            <p className="mt-2 text-gray-600">Optimizado para equipos que necesitan resultados inmediatos con sincronización en tiempo real.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                            <Users className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Colaboración fluida</h3>
                                            <p className="mt-2 text-gray-600">Herramientas diseñadas para maximizar la productividad del equipo y facilitar la comunicación.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 ring-1 ring-gray-200">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-x-3">
                                                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                                                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                                                <div className="h-3 bg-blue-300 rounded w-1/2"></div>
                                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                                                <div className="space-y-2 mt-6">
                                                    <div className="h-8 bg-blue-100 rounded flex items-center px-3">
                                                        <div className="h-2 bg-blue-400 rounded w-1/3"></div>
                                                    </div>
                                                    <div className="h-8 bg-green-100 rounded flex items-center px-3">
                                                        <div className="h-2 bg-green-400 rounded w-1/4"></div>
                                                    </div>
                                                    <div className="h-8 bg-purple-100 rounded flex items-center px-3">
                                                        <div className="h-2 bg-purple-400 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How it works Section */}
                <div id="how-it-works" className="py-24 sm:py-32 bg-white">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl">
                            <div className="text-center mb-16">
                                <h2 className="text-base font-semibold leading-7 text-blue-600">Proceso simple</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    {t("docs-how-it-works-title")}
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                                    {t("docs-how-it-works-description")}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="relative">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg mb-6 mx-auto">
                                        1
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Configuración inicial</h3>
                                    <p className="text-gray-600 text-center">Crea tu workspace y configura tu equipo. Define roles, permisos y estructura organizacional en minutos.</p>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                            <span className="text-sm text-gray-600">Crear workspace</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                            <span className="text-sm text-gray-600">Configurar permisos</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                            <span className="text-sm text-gray-600">Personalizar interfaz</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600 text-white font-bold text-lg mb-6 mx-auto">
                                        2
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Invitar colaboradores</h3>
                                    <p className="text-gray-600 text-center">Invita a colaboradores y asigna permisos específicos. Gestiona equipos y departamentos de manera eficiente.</p>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                            <span className="text-sm text-gray-600">Enviar invitaciones</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                            <span className="text-sm text-gray-600">Asignar roles</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                            <span className="text-sm text-gray-600">Crear equipos</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600 text-white font-bold text-lg mb-6 mx-auto">
                                        3
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Gestionar proyectos</h3>
                                    <p className="text-gray-600 text-center">Comienza a gestionar proyectos y tareas. Utiliza todas las herramientas disponibles para maximizar la productividad.</p>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                            <span className="text-sm text-gray-600">Crear proyectos</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                            <span className="text-sm text-gray-600">Asignar tareas</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                            <span className="text-sm text-gray-600">Monitorear progreso</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customize Section */}
                <div id="customize" className="py-24 sm:py-32 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl">
                            <div className="text-center mb-16">
                                <h2 className="text-base font-semibold leading-7 text-blue-600">Haz que sea tuyo</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    {t("docs-now-what-title")}
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                                    {t("docs-now-what-description-1")} <span className="font-semibold">Gestionate</span> {t("docs-now-what-description-2")}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades principales</h3>
                                    <div className="space-y-6">
                                        <div className="flex gap-x-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                                <Code className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-gray-900">Gestión de proyectos</h4>
                                                <p className="text-sm text-gray-600">Crea, organiza y monitorea proyectos con herramientas avanzadas de seguimiento.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-x-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                                                <Users className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-gray-900">Colaboración en equipo</h4>
                                                <p className="text-sm text-gray-600">Facilita la comunicación y coordinación entre miembros del equipo.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-x-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                                                <Shield className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-gray-900">Seguridad empresarial</h4>
                                                <p className="text-sm text-gray-600">Protección de datos con estándares de seguridad de nivel empresarial.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-x-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                                                <Zap className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-gray-900">Automatización</h4>
                                                <p className="text-sm text-gray-600">Automatiza procesos repetitivos y optimiza flujos de trabajo.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">¿Listo para comenzar?</h3>
                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                                        <p className="text-gray-700 mb-6">
                                            Empieza a utilizar Gestionate hoy mismo y experimenta una nueva forma de gestionar tu empresa.
                                        </p>
                                        <div className="space-y-4">
                                            <Link
                                                href="/"
                                                className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 text-center"
                                            >
                                                Comenzar ahora
                                            </Link>
                                            <a
                                                href="#introduction"
                                                className="block w-full rounded-lg border border-blue-300 px-6 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200 text-center"
                                            >
                                                Revisar documentación
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default DocsView;