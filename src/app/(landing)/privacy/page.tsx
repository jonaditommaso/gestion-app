import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { privacyData } from './privacyData';
import PrivacyCard from './PrivacyCard';
import PrivacyListCard from './PrivacyListCard';

const PrivacyView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing.privacy')

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen'>
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-20"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-6 text-center max-w-3xl mt-20 px-6">
                    <div className="mb-8 flex justify-center">
                        <div className="flex items-center gap-x-3 rounded-full bg-blue-500/10 px-4 py-2 ring-1 ring-blue-500/20">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <div className="text-sm font-medium text-blue-300">
                                {t('badge')}
                            </div>
                        </div>
                    </div>
                    <h1 className='text-6xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-4xl'>
                        {t('title-1')} {' '}
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                            {t('title-2')}
                        </span>{' '}
                    </h1>
                    <p className='text-xl font-normal text-balance opacity-90 max-sm:text-lg'>
                        {t('description')}
                    </p>
                    <p className='text-lg opacity-75'>{t('updated')}</p>
                </div>
            </div>

            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-4xl mx-auto px-6 space-y-8">
                    <PrivacyCard
                        key='our-commitment'
                        title={t('card-1-title')}
                        icon={<Shield className="w-5 h-5 text-blue-600" />}
                        description1={t('card-1-description-1')}
                        description2={t('card-1-description-2')}
                    />

                    {privacyData.map(card => (
                        <PrivacyListCard
                            key={card.id}
                            title={t(card.title)}
                            icon={card.icon}
                            description1={t(card.description1)}
                            items={card.items?.map(item => t(item))}
                            subtitle1={card.subtitle1 ? t(card.subtitle1) : undefined}
                            subtitle2={card.subtitle2 ? t(card.subtitle2) : undefined}
                            items1={card.items1?.map(item => t(item))}
                            items2={card.items2?.map(item => t(item))}
                        />
                    ))}

                    <Card className="border-0 shadow-md bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-xl font-semibold mb-4">{t('questions-title')}</h3>
                            <p className="opacity-90 mb-4 text-balance">
                                {t('questions-description')}
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold">{t('questions-contact')}</p>
                                <p className="opacity-75 text-sm">{t('questions-info')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}

export default PrivacyView;
