'use client'

import { ReactNode, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft, ChevronRight, Rocket, CreditCard, Bot,
    Users, Building2, Sparkles, Headphones, GraduationCap,
    type LucideIcon
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { OrganizationPlan } from "@/features/team/types"

const PLAN_NAME_REGEX = /\b(FREE|PLUS|PRO|Enterprise|ENTERPRISE)\b/g

function renderWithBold(text: string): ReactNode {
    const parts = text.split(PLAN_NAME_REGEX)
    return parts.map((part, i) =>
        /^(FREE|PLUS|PRO|Enterprise|ENTERPRISE)$/.test(part)
            ? <strong key={i} className="font-semibold text-foreground">{part}</strong>
            : <span key={i}>{part}</span>
    )
}

type Slide = {
    image: string
    imageWidth: number
    imageHeight: number
    Icon: LucideIcon
    title: string
    description: string
    planLabel?: string
}

interface UpgradeCarouselDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    plan: OrganizationPlan
}

const UpgradeCarouselDialog = ({ open, onOpenChange, plan }: UpgradeCarouselDialogProps) => {
    const t = useTranslations('upgrade-carousel')
    const router = useRouter()
    const [current, setCurrent] = useState(0)

    const slidesByPlan: Record<string, Slide[]> = {
        FREE: [
            {
                image: '/introduction.svg',
                imageWidth: 200,
                imageHeight: 200,
                Icon: Rocket,
                title: t('free-intro-title'),
                description: t('free-intro-description'),
            },
            {
                image: '/present-billing.png',
                imageWidth: 300,
                imageHeight: 180,
                Icon: CreditCard,
                planLabel: 'PLUS',
                title: t('free-slide-1-title'),
                description: t('free-slide-1-description'),
            },
            {
                image: '/team.svg',
                imageWidth: 200,
                imageHeight: 200,
                Icon: Users,
                planLabel: 'PLUS',
                title: t('free-slide-3-title'),
                description: t('free-slide-3-description'),
            },
            {
                image: '/ia-chat.svg',
                imageWidth: 200,
                imageHeight: 200,
                Icon: Bot,
                planLabel: 'PRO',
                title: t('free-slide-4-title'),
                description: t('free-slide-4-description'),
            },
        ],
        PLUS: [
            {
                image: '/introduction.svg',
                imageWidth: 200,
                imageHeight: 200,
                Icon: Sparkles,
                title: t('plus-intro-title'),
                description: t('plus-intro-description'),
            },
            {
                image: '/present-workspaces.png',
                imageWidth: 300,
                imageHeight: 180,
                Icon: Building2,
                planLabel: 'PRO',
                title: t('plus-slide-1-title'),
                description: t('plus-slide-1-description'),
            },
            {
                image: '/ia-chat.svg',
                imageWidth: 200,
                imageHeight: 200,
                Icon: Bot,
                planLabel: 'PRO',
                title: t('plus-slide-2-title'),
                description: t('plus-slide-2-description'),
            },
        ],
        PRO: [
            {
                image: '/introduction.svg',
                imageWidth: 300,
                imageHeight: 300,
                Icon: Rocket,
                title: t('pro-intro-title'),
                description: t('pro-intro-description'),
            },
            {
                image: '/team.svg',
                imageWidth: 350,
                imageHeight: 350,
                Icon: Users,
                planLabel: 'Enterprise',
                title: t('pro-slide-1-title'),
                description: t('pro-slide-1-description'),
            },
            {
                image: '/onboarding-steps.svg',
                imageWidth: 300,
                imageHeight: 300,
                Icon: GraduationCap,
                planLabel: 'Enterprise',
                title: t('pro-slide-3-title'),
                description: t('pro-slide-3-description'),
            },
            {
                image: '/group-solution.svg',
                imageWidth: 300,
                imageHeight: 300,
                Icon: Headphones,
                planLabel: 'Enterprise',
                title: t('pro-slide-4-title'),
                description: t('pro-slide-4-description'),
            },
        ],
    }

    const slides: Slide[] = slidesByPlan[plan] ?? slidesByPlan['FREE']

    const handlePrev = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    const handleNext = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))

    const handleClose = (isOpen: boolean) => {
        onOpenChange(isOpen)
        if (!isOpen) setCurrent(0)
    }

    const slide = slides[current]

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[540px] max-w-[95vw] p-0 overflow-hidden gap-0">
                <DialogTitle className="sr-only">{t('dialog-title')}</DialogTitle>
                <DialogDescription className="sr-only">{t('dialog-description')}</DialogDescription>

                <div className="flex flex-col h-[580px]">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 flex items-center justify-center flex-1 shrink-0">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            width={slide.imageWidth}
                            height={slide.imageHeight}
                            className="object-contain max-h-56"
                        />
                    </div>

                    <div className="h-[220px] overflow-y-auto px-7 pt-5 pb-2 shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 shrink-0">
                                <slide.Icon size={15} className="text-amber-500" />
                            </div>
                            {slide.planLabel && (
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                    {slide.planLabel}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold mb-2 leading-snug">{slide.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {renderWithBold(slide.description)}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-3 shrink-0">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`rounded-full transition-all duration-200 ${
                                    i === current
                                        ? 'bg-amber-500 w-5 h-2'
                                        : 'bg-muted hover:bg-muted-foreground/30 w-2 h-2'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3 px-7 pb-6 pt-1 shrink-0">
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={handlePrev}>
                                <ChevronLeft size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleNext}>
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                        <Button
                            className="ml-auto bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => {
                                onOpenChange(false)
                                router.push('/pricing')
                            }}
                        >
                            {t('upgrade-button')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UpgradeCarouselDialog
