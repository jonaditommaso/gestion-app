'use client'
import { motion } from 'motion/react';
import DemoButton from "./DemoButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

const CTAFooter = () => {
    const t = useTranslations('landing');

    return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}>

        <div className="text-white flex flex-col items-center my-20 m-auto w-full gap-4">
            <p className="font-semibold text-3xl tracking-tight">{t('footer-cta-title')}</p>
            <p className="text-muted-foreground w-[800px] text-center text-balance">{t('footer-cta-description')}</p>
            <div className="flex gap-4">
                <Link href={'/pricing'}>
                    <Button variant='secondary' size='lg'>{t('get-started')} <ArrowRight /></Button>
                </Link>
                <DemoButton text={t('button-get-demo-2')} fit />
            </div>
        </div>
          </motion.div>

    );
}

export default CTAFooter;