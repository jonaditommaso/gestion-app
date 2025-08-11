'use client'
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Zap } from 'lucide-react';

const DiscoverButton = () => {

    const words1 = "Integraciones que".split(" ");
    const words2 = "potencian tu flujo".split(" ");
    const description = "Conecta tus herramientas favoritas y automatiza procesos para maximizar la productividad de tu equipo.";

    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <div ref={ref} className="flex flex-col gap-6 max-w-[450px] self-start">
            {/* Header badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                className="flex items-center gap-2 w-fit"
            >
                <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 ring-1 ring-blue-200">
                    <Zap className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">Integra tus apps</span>
                </div>
            </motion.div>

            {/* Animated title */}
            <div className="space-y-2">
                <h3 className="text-3xl font-bold leading-tight">
                    {words1.map((word, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
                        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
                        style={{ display: "inline-block", marginRight: 8 }}
                    >
                        {word}
                    </motion.span>
                    ))}
                </h3>
                <h3 className="text-3xl font-bold leading-tight text-gray-800">
                    {words2.map((word, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
                        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
                        style={{ display: "inline-block", marginRight: 8 }}
                    >
                        {word}
                    </motion.span>
                    ))}
                </h3>
            </div>

            {/* Description */}
            <motion.p
                className="text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
            >
                {description}
            </motion.p>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
                className="grid grid-cols-2 gap-4 py-4"
            >
                <div>
                    <div className="text-2xl font-bold text-gray-900">100+</div>
                    <div className="text-sm text-gray-600">Integraciones</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-sm text-gray-600">Sincronización</div>
                </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.3, duration: 0.4, ease: "easeOut" }}
            >
                <Button className="rounded-lg w-fit group transition-all duration-200 hover:shadow-lg hover:scale-105">
                    Explorar integraciones
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </motion.div>
        </div>
    );
}

export default DiscoverButton;