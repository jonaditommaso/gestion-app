import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building, Star, ArrowRight, Code, Database, CreditCard, Package, Users, Shield, Zap, BarChart3, CheckCircle } from 'lucide-react';

const ProductsView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing')

    if(user) redirect('/');

    const productFeatures = {
        workspaces: [
            "Gestión de equipos y roles",
            "Colaboración en tiempo real",
            "Dashboard personalizable",
            "Integraciones avanzadas"
        ],
        records: [
            "Almacenamiento seguro en la nube",
            "Organización automática",
            "Búsqueda inteligente",
            "Control de versiones"
        ],
        billing: [
            "Facturación automatizada",
            "Reportes financieros",
            "Gestión de pagos",
            "Análisis de ingresos"
        ],
        inventory: [
            "Control de stock en tiempo real",
            "Alertas de inventario",
            "Gestión de proveedores",
            "Análisis de rotación"
        ]
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-800'>
            {/* Products Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />

                <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="flex items-center gap-x-3 rounded-full bg-blue-500/10 px-4 py-2 ring-1 ring-blue-500/20">
                                <Building className="h-4 w-4 text-blue-400" />
                                <div className="text-sm font-medium text-blue-300">
                                    Soluciones empresariales
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Productos que{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                                transforman
                            </span>{' '}
                            tu negocio
                        </h1>

                        <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
                            Descubre nuestra suite completa de herramientas diseñadas para potenciar la productividad, optimizar procesos y hacer crecer tu empresa.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#workspaces"
                                className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 inline-flex items-center justify-center gap-x-2"
                            >
                                <Star className="h-4 w-4" />
                                Explorar productos
                            </a>
                            <Link
                                href="/docs"
                                className="rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/5 transition-all duration-200 inline-flex items-center justify-center gap-x-2"
                            >
                                Ver documentación
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-white">4</div>
                                <div className="text-sm text-gray-400">Productos principales</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">99.9%</div>
                                <div className="text-sm text-gray-400">Tiempo de actividad</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-sm text-gray-400">Soporte técnico</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Overview Grid */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Suite completa de productos
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Herramientas integradas que cubren todas las necesidades de tu negocio
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">
                        {/* Workspaces Card */}
                        <div id="workspaces" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-4 right-4">
                                <Code className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('products-workspaces-title')}</h3>
                            <p className="text-gray-600 mb-6">{t('products-workspaces-description')}</p>
                            <ul className="space-y-2">
                                {productFeatures.workspaces.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Records Card */}
                        <div id="registers" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 p-8 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-4 right-4">
                                <Database className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('records')}</h3>
                            <p className="text-gray-600 mb-6">{t('products-records-description')}</p>
                            <ul className="space-y-2">
                                {productFeatures.records.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Billing Card */}
                        <div id="billing" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 p-8 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-4 right-4">
                                <CreditCard className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('facturation')}</h3>
                            <p className="text-gray-600 mb-6">{t('products-billing-description')}</p>
                            <ul className="space-y-2">
                                {productFeatures.billing.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="h-4 w-4 text-purple-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Inventory Card */}
                        <div id="inventory" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 p-8 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-4 right-4">
                                <Package className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('products-innventory-title')}</h3>
                            <p className="text-gray-600 mb-6">{t('products-innventory-description')}</p>
                            <ul className="space-y-2">
                                {productFeatures.inventory.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="h-4 w-4 text-orange-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-24 sm:py-32 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:40px_40px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex items-center gap-x-2 rounded-full bg-blue-100/80 px-4 py-2 ring-1 ring-blue-200">
                                <Zap className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Tecnología avanzada</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Características que nos{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                                diferencian
                            </span>
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Funcionalidades avanzadas diseñadas para empresas que buscan excelencia operacional y crecimiento sostenible
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        <div className="group relative">
                            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-blue-300 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 group-hover:scale-110 transition-transform duration-300">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Seguridad empresarial</h3>
                                    <p className="mt-3 text-gray-600 leading-6">
                                        Encriptación AES-256, autenticación multi-factor y cumplimiento SOC 2 Type II.
                                        Tus datos están protegidos con los más altos estándares de la industria.
                                    </p>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                            Backup automático cada 15 minutos
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                            Auditoría completa de accesos
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                            Cumplimiento GDPR y CCPA
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-emerald-300 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Rendimiento extremo</h3>
                                    <p className="mt-3 text-gray-600 leading-6">
                                        Arquitectura distribuida con CDN global y cache inteligente.
                                        Respuesta bajo 200ms desde cualquier parte del mundo.
                                    </p>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                            99.99% de tiempo de actividad garantizado
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                            Auto-escalado según demanda
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                            Sincronización en tiempo real
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-purple-300 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 group-hover:scale-110 transition-transform duration-300">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Inteligencia artificial</h3>
                                    <p className="mt-3 text-gray-600 leading-6">
                                        Machine learning integrado para predicciones, automatización de tareas y
                                        recomendaciones personalizadas que optimizan tu flujo de trabajo.
                                    </p>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                            Análisis predictivo avanzado
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                            Automatización inteligente
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                            Insights personalizados
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional stats row */}
                    <div className="mt-20 grid grid-cols-2 gap-8 lg:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">50M+</div>
                            <div className="text-sm text-gray-600 mt-1">Documentos procesados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">200ms</div>
                            <div className="text-sm text-gray-600 mt-1">Tiempo de respuesta</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">99.99%</div>
                            <div className="text-sm text-gray-600 mt-1">Disponibilidad</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">150+</div>
                            <div className="text-sm text-gray-600 mt-1">Países soportados</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration & Testimonial Section */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Integra con tus herramientas favoritas
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Conecta Gestionate con más de 100 aplicaciones que ya usas
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-6">
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="text-sm font-semibold text-gray-600">Slack</div>
                            </div>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="text-sm font-semibold text-gray-600">Trello</div>
                            </div>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="text-sm font-semibold text-gray-600">GitHub</div>
                            </div>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="text-sm font-semibold text-gray-600">Google</div>
                            </div>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="text-sm font-semibold text-gray-600">Notion</div>
                            </div>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="text-sm font-semibold text-gray-600">Zapier</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-20">
                        <div className="relative isolate overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-16 shadow-2xl rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
                            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />

                            <div className="relative mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    &ldquo;Gestionate transformó completamente nuestra operación&rdquo;
                                </h2>
                                <p className="mt-6 text-lg leading-8 text-gray-300">
                                    Desde que implementamos Gestionate, hemos reducido el tiempo de gestión administrativa en un 60%
                                    y mejorado la colaboración entre equipos significativamente.
                                </p>
                                <div className="mt-8 flex items-center gap-x-4 lg:justify-start justify-center">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                        M
                                    </div>
                                    <div>
                                        <div className="text-base font-semibold text-white">María González</div>
                                        <div className="text-sm text-gray-400">CEO, TechStartup Inc.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative mt-16 h-80 lg:mt-8">
                                <div className="absolute inset-0 rounded-md bg-white/5 ring-1 ring-white/10 backdrop-blur"></div>
                                <div className="absolute inset-4 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA Section */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            ¿Listo para revolucionar tu negocio?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
                            Únete a más de 10,000 empresas que ya confían en Gestionate para optimizar sus operaciones y acelerar su crecimiento.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/signup"
                                className="rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 inline-flex items-center gap-x-2 group"
                            >
                                <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                Comenzar prueba gratuita
                            </Link>
                            <Link
                                href="/docs"
                                className="text-base font-semibold leading-6 text-gray-700 hover:text-blue-600 transition-colors duration-200 inline-flex items-center gap-x-2"
                            >
                                Explorar documentación
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">30 días</div>
                                <div className="text-sm text-gray-600">Prueba gratuita</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">Sin tarjeta</div>
                                <div className="text-sm text-gray-600">Requerida</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">Soporte 24/7</div>
                                <div className="text-sm text-gray-600">Incluido</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default ProductsView;