'use client'
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const integrations = [
    {
        name: 'Google Meet',
        logo: '/logos/g-meet-logo.png',
        description: 'integration-1',
        status: 'Activo'
    },
    {
        name: 'Google Calendar',
        logo: '/logos/g-calendar-logo.png',
        description: 'integration-2',
        status: 'Activo'
    },
    {
        name: 'Spotify',
        logo: '/logos/spotify-logo.png',
        description: 'integration-3',
        status: 'Próximamente'
    },
    {
        name: 'GitHub',
        logo: '/logos/github-logo.png',
        description: 'integration-4',
        status: 'Beta'
    }
]

const Integrations = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const t = useTranslations('landing')

    return (
        <div ref={ref} className="flex flex-col max-w-[550px]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-6 text-center"
            >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('available-integrations-title')}</h4>
                <p className="text-sm text-gray-600 max-w-[400px] text-center text-balance m-auto">{t('available-integrations-description')}</p>
            </motion.div>

            {/* Integration Grid */}
            <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                {integrations.map((integration, idx) => (
                <div
                    className={`
                    h-[180px] border-gray-200
                    ${idx % 2 === 0 ? 'border-r' : ''}
                    ${idx < 2 ? 'border-b' : ''}
                    flex flex-col items-center justify-center
                    relative overflow-hidden
                    group cursor-pointer
                    bg-white hover:bg-gray-50
                    transition-all duration-300
                    `}
                    key={integration.name}
                >
                    {/* Background image appears only on hover */}
                    <div
                      className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        backgroundImage: 'url(/hero-integrations-bg.jpg)',
                        backgroundSize: '1100px 600px',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: (() => {
                          const col = idx % 2;
                          const row = Math.floor(idx / 2);
                          const x = col === 0 ? '0px' : '-275px';
                          const y = row === 0 ? '0px' : '-180px';
                          return `${x} ${y}`;
                        })(),
                      }}
                    />

                    {/* Blur overlay on hover */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    {/* Content */}
                    <div className="relative z-20 flex flex-col items-center text-center px-4">
                      {/* Logo */}
                      <div className="mb-3">
                        <Image width={48} height={48} alt={integration.name} src={integration.logo} className="rounded-lg transition-transform duration-200 group-hover:scale-110" />
                      </div>

                      {/* Name and description */}
                      <h3 className="font-semibold text-sm mb-1 text-gray-800 group-hover:text-white transition-colors duration-200">
                        {integration.name}
                      </h3>

                      {/* Description - aparece en hover */}
                      <p className="text-xs font-medium text-balance text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all duration-200 mt-5">
                        {t(integration.description)}
                      </p>
                    </div>
                </div>
                ))}
            </div>

            {/* Footer info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
                className="mt-4 text-center"
            >
                <Link href="/products#integrations" className="inline-block px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">
                    <p className="text-sm text-gray-600">
                        {t('featured-integrations')} •
                        <span className="font-medium text-blue-600 ml-1">{t('many-more-integrations')}</span>
                    </p>
                </Link>
            </motion.div>
        </div>
    );
}

export default Integrations;