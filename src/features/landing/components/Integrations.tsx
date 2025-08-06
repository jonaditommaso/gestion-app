'use client'
import Image from "next/image";
import { motion } from "motion/react";

const integrations = [
    {
        name: 'Google Meet',
        logo: '/logos/g-meet-logo.png',
        description: 'Conecta tu cuenta de Google Meet para gestionar reuniones.',
    },
    {
        name: 'Google Calendar',
        logo: '/logos/g-calendar-logo.png',
        description: 'Sincroniza tus eventos con Google Calendar.',
    },
    {
        name: 'Spotify',
        logo: '/logos/spotify-logo.png',
        description: 'Integra Spotify para gestionar tu música.',
    },
    {
        name: 'GitHub',
        logo: '/logos/github-logo.png',
        description: 'Conecta tu cuenta de GitHub para gestionar repositorios.',
    }
]

const Integrations = () => {
    return (
        <div className="flex flex-wrap max-w-[600px] shadow-xl">
            {integrations.map((integration, idx) => (
            <div
                className={`
                h-[350px] w-[300px] border border-neutral-400
                ${idx % 2 === 0 ? 'border-r-0' : ''}
                ${idx < 2 ? 'border-b-0' : ''}
                flex items-center justify-center
                relative overflow-hidden
                group cursor-pointer
                bg-white/40
                `}
                key={integration.name}
            >
                {/* Background image appears only on hover */}
                <div
                  className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    backgroundImage: 'url(/hero-integrations-bg.jpg)',
                    backgroundSize: '1200px 700px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: (() => {
                      // 2 columnas x 2 filas
                      const col = idx % 2;
                      const row = Math.floor(idx / 2);
                      // Ajusta estos valores según el tamaño real de tu imagen y grid
                      const x = col === 0 ? '0px' : '-300px';
                      const y = row === 0 ? '0px' : '-350px';
                      return `${x} ${y}`;
                    })(),
                  }}
                ></div>
                {/* Blur overlay on hover */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" />
                <motion.div
                  className="relative z-20 flex flex-col items-center w-full h-full justify-center"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  variants={{}}
                >
                  <motion.div
                    variants={{
                      rest: { scale: 1, filter: 'blur(0px)', opacity: 1 },
                      hover: { scale: 1.13, filter: 'blur(0px)', opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } },
                    }}
                    transition={{ duration: 0.32 }}
                    className="flex flex-col items-center"
                  >
                    <Image width={90} height={90} alt={integration.name} src={integration.logo} />
                  </motion.div>
                  {/* Nombre siempre visible, animando color con motion */}
                  <motion.h3
                    className="mt-4 font-semibold text-lg"
                    style={{ position: 'relative', zIndex: 40 }}
                    variants={{
                      rest: { color: '#1a1a1a', opacity: 1, y: 0 }, // neutral-800
                      hover: { color: '#fafafa', opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } }, // neutral-100
                    }}
                  >
                    {integration.name}
                  </motion.h3>
                  <motion.p
                    className="mt-2 text-center text-neutral-200 px-4"
                    variants={{
                      rest: { opacity: 0, y: 16 },
                      hover: { opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.32, ease: 'easeOut' } },
                    }}
                  >
                    {integration.description}
                  </motion.p>
                </motion.div>
            </div>
            ))}
        </div>
    );
}

export default Integrations;