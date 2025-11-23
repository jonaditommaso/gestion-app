import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Play, BookOpen, Target } from 'lucide-react';
import { stats } from './stats';
import QuickStat from '@/features/landing/components/getting-started/QuickStat';
import { steps } from './steps';
import StepCard from '@/features/landing/components/getting-started/StepCard';
import { features } from './features';
import FeatureCard from '@/features/landing/components/getting-started/FeatureCard';

const GettingStartedView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing.getting-started');

    if(user) redirect('/');

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800'>
            {/* Documentation Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]" /> */}
                {/* <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" /> */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                {/* <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" /> */}

                <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="flex items-center gap-x-3 rounded-full bg-blue-500/10 px-4 py-2 ring-1 ring-blue-500/20">
                                <BookOpen className="h-4 w-4 text-blue-400" />
                                <div className="text-sm font-medium text-blue-300">
                                    {t('hero-badge')}
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
                            {t('hero-title-1')}{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                                Gestionate
                            </span>{' '}
                            {t('hero-title-2')}
                        </h1>

                        <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
                            {t('hero-description')}
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#getting-started" className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 inline-flex items-center justify-center gap-x-2">
                                <Play className="h-4 w-4" />
                                {t('hero-button-start')}
                            </a>
                            <a href="#features" className="rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/5 transition-all duration-200 inline-flex items-center justify-center gap-x-2">
                                <Target className="h-4 w-4" />
                                {t('hero-button-features')}
                            </a>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
                            {stats.map(stat => <QuickStat key={stat.id} {...stat} /> )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Getting Started Section */}
            <div id="first-steps" className="py-24 sm:py-32 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:40px_40px]" />
                {/* <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" /> */}
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <div className="mb-4 flex justify-center">
                            <div className="flex items-center gap-x-2 rounded-full bg-blue-100/80 px-4 py-2 ring-1 ring-blue-200">
                                <Play className="h-4 w-4 text-blue-600" />
                                {/* TODO: hacer navegacion suave a #first-steps */}
                                <a className="text-sm font-medium text-blue-800 transition-all duration-200" href="#first-steps">{t('first-steps-badge')}</a>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                            {t('first-steps-title-1')}{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                                {t('first-steps-title-2')}
                            </span>
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-400">
                            {t('first-steps-description')}
                        </p>
                    </div>

                    {/* Step-by-step guide */}
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        {steps.map(step => (
                            <StepCard
                                key={step.id}
                                step={step.stepNumber}
                                title={step.title}
                                description={step.description}
                                mainColor={step.mainColor}
                                items={step.items}
                            />
                        ))}
                    </div>

                </div>
            </div>

            {/* Key Features Section */}
            <div id="features" className="py-20 sm:py-24 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <div className="mb-4 flex justify-center">
                            <div className="flex items-center gap-x-2 rounded-full bg-purple-100/80 px-4 py-2 ring-1 ring-purple-200">
                                <Target className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">{t('key-features-badge')}</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-balance">
                            {t('key-features-title-1')}{' '}
                            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-500 bg-clip-text text-transparent">
                                {t('key-features-title-2')}
                            </span>
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600 text-balance">
                            {t('key-features-description')}
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {features.map(feature => (
                            <FeatureCard
                                key={feature.id}
                                title={feature.title}
                                description={feature.description}
                                color={feature.color}
                                items={feature.items}
                                icon={feature.icon}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA Section */}
            <div className="py-20 sm:py-24 relative overflow-hidden" style={{ backgroundImage: "linear-gradient(180deg, #0f172a 10%, #171321 50%)" }}>
                {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]" /> */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                {/* <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" /> */}

                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                                {t('next-steps-title-1')}{' '}
                            </span>
                            {t('next-steps-title-2')}
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-300 max-w-xl mx-auto text-balance">
                            {t('next-steps-description')}
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/docs" className="rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center gap-x-2">
                                <BookOpen className="h-4 w-4" />
                                {t('next-steps-docs-button')}
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        {/* <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-lg mx-auto">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">15 días</div>
                                <div className="text-sm text-gray-300">Prueba gratuita</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">Sin tarjeta</div>
                                <div className="text-sm text-gray-300">Requerida</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">24/7</div>
                                <div className="text-sm text-gray-300">Soporte</div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default GettingStartedView;