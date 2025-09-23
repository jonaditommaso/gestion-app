import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Lightbulb, Heart } from 'lucide-react';
import ValueCard from './ValueCard';
import StatCard from './StatCard';

export default async function AboutPage() {
    const user = await getCurrent();

    if(user) redirect('/');

    const t = await getTranslations('landing.about');

    // Value cards data
    const valueCards = [
        {
            id: 1,
            icon: <Users className="w-8 h-8" />,
            titleKey: 'value-1-title',
            descriptionKey: 'value-1-description',
            bgColor: 'bg-blue-100',
            hoverBgColor: 'group-hover:bg-blue-200',
            iconColor: 'text-blue-600',
        },
        {
            id: 2,
            icon: <Target className="w-8 h-8" />,
            titleKey: 'value-2-title',
            descriptionKey: 'value-2-description',
            bgColor: 'bg-green-100',
            hoverBgColor: 'group-hover:bg-green-200',
            iconColor: 'text-green-600',
        },
        {
            id: 3,
            icon: <Lightbulb className="w-8 h-8" />,
            titleKey: 'value-3-title',
            descriptionKey: 'value-3-description',
            bgColor: 'bg-yellow-100',
            hoverBgColor: 'group-hover:bg-yellow-200',
            iconColor: 'text-yellow-600',
        },
        {
            id: 4,
            icon: <Heart className="w-8 h-8" />,
            titleKey: 'value-4-title',
            descriptionKey: 'value-4-description',
            bgColor: 'bg-red-100',
            hoverBgColor: 'group-hover:bg-red-200',
            iconColor: 'text-red-600',
        },
    ];

    // Stat cards data
    const statCards = [
        {
            id: 1,
            number: '10+',
            descriptionKey: 'stat-1-description',
            gradientColors: 'bg-gradient-to-br from-blue-500 to-purple-600',
        },
        {
            id: 2,
            number: '5+',
            descriptionKey: 'stat-2-description',
            gradientColors: 'bg-gradient-to-br from-green-500 to-blue-600',
        },
        {
            id: 3,
            number: '24/7',
            descriptionKey: 'stat-3-description',
            gradientColors: 'bg-gradient-to-br from-purple-500 to-pink-600',
        },
    ];

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-32"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-8 text-center max-w-5xl px-6">
                    <div className="mb-8 flex justify-center">
                        <div className="flex items-center gap-x-3 rounded-full bg-blue-500/10 px-4 py-2 ring-1 ring-blue-500/20">
                            <Users className="h-4 w-4 text-blue-400" />
                            <div className="text-sm font-medium text-blue-300">
                                {t('badge')}
                            </div>
                        </div>
                    </div>
                    <h1 className='text-7xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-5xl leading-tight'>
                        {t('title-1')} <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('title-2')}</span>, {t('title-3')}
                    </h1>
                    <p className='text-2xl font-normal text-balance opacity-90 max-sm:text-xl max-w-4xl leading-relaxed'>
                        {t('description')}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-6xl mx-auto px-6 space-y-20">

                    {/* Our Story */}
                    <section className="text-center">
                        <h2 className="text-5xl font-bold text-slate-800 mb-12">{t('our-story-title')}</h2>
                        <div className="max-w-4xl mx-auto space-y-8">
                            <p className="text-xl text-slate-600 leading-relaxed">
                                {t('our-story-p1')}
                            </p>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                {t('our-story-p2')}
                            </p>
                        </div>
                    </section>

                    {/* Our Values */}
                    <section>
                        <h2 className="text-5xl font-bold text-slate-800 mb-16 text-center">{t('our-values-title')}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {valueCards.map((card) => (
                                <ValueCard
                                    key={card.id}
                                    icon={card.icon}
                                    title={t(card.titleKey)}
                                    description={t(card.descriptionKey)}
                                    bgColor={card.bgColor}
                                    hoverBgColor={card.hoverBgColor}
                                    iconColor={card.iconColor}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Our Mission */}
                    <section className="text-center">
                        <h2 className="text-5xl font-bold text-slate-800 mb-12">{t('our-mission-title')}</h2>
                        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <CardContent className="p-16">
                                <h3 className="text-3xl font-semibold mb-6">
                                    {t('mission-title')}
                                </h3>
                                <p className="text-xl opacity-90 max-w-4xl mx-auto leading-relaxed">
                                    {t('mission-description')}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Team Stats */}
                    <section className="text-center">
                        <h2 className="text-5xl font-bold text-slate-800 mb-12">{t('meet-team-title')}</h2>
                        <div className="max-w-4xl mx-auto mb-16">
                            <p className="text-xl text-slate-600 leading-relaxed">
                                {t('meet-team-description')}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {statCards.map((card) => (
                                <StatCard
                                    key={card.id}
                                    number={card.number}
                                    description={t(card.descriptionKey)}
                                    gradientColors={card.gradientColors}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
