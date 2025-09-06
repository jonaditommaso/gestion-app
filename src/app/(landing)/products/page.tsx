import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building, CheckCircle, BookOpenText, LayoutDashboard, Rocket } from 'lucide-react';
import { productsData } from './productsData';
import { featuresDifference } from './featuresDifference';
import IntegrationsSection from './IntegrationsSection';

const ProductsView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing')

    if(user) redirect('/');

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
                                    {t('products-badge')}
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl whitespace-pre-line">
                            {t('products-title-1')} {' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                                {t('products-title-2')}
                            </span>{' '}
                            {t('products-title-3')}
                        </h1>

                        <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto whitespace-pre-line">
                            {t('products-description')}
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#workspaces" className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 inline-flex items-center justify-center gap-x-4">
                                {t('products-cta-1')}
                                <LayoutDashboard className="h-5 w-5" />
                            </a>
                            <Link
                                href="/docs"
                                className="rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/5 transition-all duration-200 inline-flex items-center justify-center gap-x-4"
                            >
                                {t('products-cta-2')}
                                <BookOpenText className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Overview Grid */}
            <div className="bg-white py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {t('products-overview-title')}
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600 whitespace-pre-line">
                            {t('products-overview-description')}
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">


                        {productsData.map((product) => (
                            <div key={product.id} id={product.id} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${product.bgColor} p-8 hover:shadow-xl transition-all duration-300 cursor-default`}>
                                <div className="absolute top-4 right-4">
                                    {product.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t(product.title)}</h3>
                                <p className="text-gray-600 mb-6">{t(product.description)}</p>
                                <ul className="space-y-2">
                                    {product.items.map((item, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle className={`h-4 w-4 ${product.color}`} />
                                            {t(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-20 sm:py-24 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:40px_40px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex items-center gap-x-2 rounded-full bg-blue-100/80 px-4 py-2 ring-1 ring-blue-200">
                                <Rocket className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">{t('products-badge-tech')}</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {t('products-tech-title-1')}{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                                {t('products-tech-title-2')}
                            </span>
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            {t('products-tech-description')}
                        </p>
                    </div>


                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {featuresDifference.map(feature=> (
                            <div className="group relative" key={feature.id}>
                                <div className={`relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg ${feature.hoverRingColor} transition-all duration-300 cursor-default`}>
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.bubbleColor} to-transparent rounded-bl-full`} />
                                    <div className="relative">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-gray-900">{t(feature.title)}</h3>
                                        <p className="mt-3 text-gray-600 leading-6">
                                            {t(feature.description)}
                                        </p>
                                        <div className="mt-6 space-y-2">
                                            {feature.items.map(item => (
                                                <div className="flex items-center gap-2 text-sm text-gray-700" key={item}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                    {t(item)}
                                                </div>

                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Integrations Section */}
            <IntegrationsSection />

            <LandingFooter />
        </div>
    );
}

export default ProductsView;