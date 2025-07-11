'use client'
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const DiscoverButton = () => {

    const words1 = "Un texto que diga algo por aca".split(" ");
    const words2 = "Lo que deberia acompanar a ese texto que todavia no se bien que va a decir pero tendria que ser algo llamativo".split(" ");

    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <div ref={ref} className="flex flex-col gap-4 max-w-[500px] self-start mt-20">
            <p className="text-3xl font-semibold">
                {words1.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
                    animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ delay: i * 0.045, duration: 0.45, ease: [0.4, 0.0, 0.2, 1] }}
                    style={{ display: "inline-block", marginRight: 6 }}
                >
                    {word}
                </motion.span>
                ))}
            </p>
            <p className="font-medium text-lg">
                {words2.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
                    animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ delay: 0.5 + i * 0.035, duration: 0.38, ease: [0.4, 0.0, 0.2, 1] }}
                    style={{ display: "inline-block", marginRight: 4 }}
                >
                    {word}
                </motion.span>
                ))}
            </p>
            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.1, duration: 0.32, ease: "easeOut" }}
            >
                <Button className="rounded-lg w-fit">Descubre mas</Button>
            </motion.div>
        </div>
    );
}

export default DiscoverButton;