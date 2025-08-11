'use client'
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const integrations = [
    {
        name: 'Google Meet',
        logo: '/logos/g-meet-logo.png',
        description: 'Reuniones integradas automáticamente en tu workspace',
        status: 'Activo'
    },
    {
        name: 'Google Calendar',
        logo: '/logos/g-calendar-logo.png',
        description: 'Sincronización de eventos y recordatorios',
        status: 'Activo'
    },
    {
        name: 'Spotify',
        logo: '/logos/spotify-logo.png',
        description: 'Control de música para ambientes de trabajo',
        status: 'Próximamente'
    },
    {
        name: 'GitHub',
        logo: '/logos/github-logo.png',
        description: 'Gestión de repositorios y commits',
        status: 'Beta'
    }
]

const Integrations = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <div ref={ref} className="flex flex-col max-w-[550px]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-6 text-center"
            >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Aplicaciones integradas</h4>
                <p className="text-sm text-gray-600">Inicia sesión una vez y gestiona todo desde un lugar</p>
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
                      <p className="text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all duration-200">
                        {integration.description}
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
                <p className="text-sm text-gray-600">
                    <span className="font-medium">4</span> aplicaciones integradas •
                    <span className="font-medium text-blue-600 ml-1">Muchas más disponibles</span>
                </p>
            </motion.div>
        </div>
    );
}

export default Integrations;