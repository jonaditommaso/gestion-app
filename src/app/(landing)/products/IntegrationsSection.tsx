'use client'

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { productsIntegrations } from './products-integrations';

const IntegrationsSection = () => {
    const t = useTranslations('landing');

    return (
        <div className="bg-white py-20 sm:py-24" id='integrations'>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {t('our-integrations')}
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600 whitespace-pre-line ">
                        {t('our-integrations-description')}
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-6">
                    {productsIntegrations.map((integration) => (
                        <div key={integration.name} className="col-span-2 lg:col-span-1 cursor-default group">
                            <div
                                className="relative flex h-16 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden"
                                style={{
                                    backgroundColor: `var(--hover-bg, rgb(249 250 251))`,
                                    color: `var(--text-color, rgb(75 85 99))`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.setProperty('--hover-bg', integration.bgColor);
                                    e.currentTarget.style.setProperty('--text-color', integration.color);
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.setProperty('--hover-bg', 'rgb(249 250 251)');
                                    e.currentTarget.style.setProperty('--text-color', 'rgb(75 85 99)');
                                }}
                            >
                                <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-90 group-hover:-right-2 transition-all duration-700 ease-out">
                                    <Image
                                        src={integration.logo}
                                        alt={integration.name}
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 object-contain filter drop-shadow-lg"
                                    />
                                </div>

                                <div className="text-sm font-semibold transition-all duration-400 ease-out group-hover:opacity-0 group-hover:-translate-x-8 relative z-10">
                                    {integration.name}
                                </div>

                                {/* Efecto de resplandor sutil */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsSection;
