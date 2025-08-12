'use client'

import Image from "next/image";
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from "react";
import { useTranslations } from "next-intl";
import LandingSignUp from "./LandingSignUp";
import { Separator } from "@/components/ui/separator";
import DemoButton from "./DemoButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { presentationItems } from "../presentationItems";

function HeroSection() {
    const t = useTranslations('landing');

    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // Fade out as you scroll down (from 1 to 0 between 0 and 0.4 scroll progress)
    const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    return (
        <div
            ref={ref}
            className="flex flex-col items-center text-white bg-[#11314a] w-full pb-20"
            style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black  90%)" }}
        >
            <div className="sticky top-16">
                <motion.div
                style={{ opacity }}
                className="flex flex-col justify-center mt-36 max-sm:mt-24 gap-4"
                >
                <p className="text-6xl font-bold text-balance text-center whitespace-pre-line tracking-tighter max-sm:text-[28px]">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{t("title-1")}</span> {t("title-2")}
                </p>
                <p className="font-medium mt-5 text-center max-sm:text-sm text-lg text-blue-100/80">
                    <span className="underline decoration-cyan-400 decoration-2 underline-offset-4">{t("subtitle-1")}</span> {t("subtitle-2")}, <span className="underline decoration-purple-400 decoration-2 underline-offset-4">{t("subtitle-3")}</span> {t("subtitle-4")}
                </p>
                </motion.div>

                <div className="flex gap-20 w-[75%] justify-center m-auto max-sm:pb-1 max-sm:flex-col max-sm:gap-10">
                <motion.div style={{ opacity }} className="flex w-full max-w-sm items-center space-x-2">
                    <div className="flex flex-col items-center gap-2 w-[450px]">
                    <LandingSignUp />
                    <Separator />
                    <DemoButton text={t("button-get-demo-1")} />
                    </div>
                </motion.div>
                </div>
            </div>

            <div
                className="mt-48 p-8 border rounded-lg z-10"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, #22314a  90%)" }}
            >
                <Image
                    width={1000}
                    height={1000}
                    alt={"home"}
                    src={"/present-workspaces.png"}
                    className="border rounded-md"
                />
            </div>
            <Tabs defaultValue="all-in-one" className="mt-10 z-20 w-[60%] m-auto">
                <div className="flex flex-col items-center w-full">
                    <TabsList className="border rounded-md p-6 px-4 border-[#eee]/15 inline-flex w-auto min-w-[220px] max-w-full m-auto">
                        {presentationItems.map((item, index) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                            >
                                <TabsTrigger
                                    value={item}
                                    className="text-lg transition-all duration-300 transform
                                        data-[state=active]:bg-white data-[state=active]:text-[#11314a] data-[state=active]:scale-105
                                        data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground
                                        data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white
                                        data-[state=inactive]:hover:scale-105 data-[state=inactive]:hover:shadow-lg
                                        relative overflow-hidden"
                                >
                                    <span className="relative z-10">{t(`hero.tabs-title.${item}`)}</span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0"
                                        whileHover={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </TabsTrigger>
                            </motion.div>
                        ))}
                    </TabsList>
                    <div className="w-full flex justify-center">
                        {presentationItems.map((item) => (
                            <TabsContent
                                className="w-full max-w-[min(100%,_var(--tablist-width,700px))] text-balance text-center px-2"
                                value={item}
                                key={item}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {t(`hero.tabs-description.${item}`)}
                                </motion.div>
                            </TabsContent>
                        ))}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

export default HeroSection;