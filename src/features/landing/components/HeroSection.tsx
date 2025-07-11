'use client'

import Image from "next/image";
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from "react";
import { useTranslations } from "next-intl";
import LandingSignUp from "./LandingSignUp";
import { Separator } from "@/components/ui/separator";
import DemoButton from "./DemoButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { presentationContentDescription, presentationItems } from "../presentationItems";

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
                    {t("title")}
                </p>
                <p className="font-semibold mt-5 text-center max-sm:text-xs text-xl">
                    {t("subtitle")}
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
                        {presentationItems.map((item) => (
                            <TabsTrigger
                                value={item.value}
                                className="text-lg data-[state=active]:bg-white data-[state=active]:text-[#11314a] data-[state=inactive]:bg-transparent data-[state=inactive]text-muted-foreground transition-colors"
                                key={item.value}
                            >
                                {item.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="w-full flex justify-center">
                        {presentationContentDescription.map((content) => (
                            <TabsContent
                                className="w-full max-w-[min(100%,_var(--tablist-width,600px))] text-balance text-center px-2"
                                value={content.value}
                                key={content.value}
                            >
                                {content.description}
                            </TabsContent>
                        ))}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

export default HeroSection;