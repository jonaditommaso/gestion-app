'use client'

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Users, SparklesIcon, ChevronLeft, ChevronRight } from "lucide-react";
import PricingCard from "@/features/landing/components/PricingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from "zod";
import { useCreateTeam } from "@/features/team/api/use-create-team";
import { useStripeCheckout } from "@/features/pricing/api/use-stripe-checkout";
import { useAcceptInvitationToken } from "@/features/team/api/use-accept-invitation-token";

type OnboardingChoice = 'create' | 'join';
type PlanType = 'free' | 'plus' | 'pro';
type CreateStep = 'name' | 'select-plan' | 'confirm';

const formSchema = zod.object({
    company: zod.string().trim().min(1, 'Required'),
});

interface PlanStyle {
    sparkle: string;
    labelKey: 'free-plan-label' | 'plus-plan-label' | 'pro-plan-label';
    border: string;
    bg: string;
    color: string;
}

const planStyle: Record<PlanType, PlanStyle> = {
    'free': {
        sparkle: 'text-emerald-500',
        labelKey: 'free-plan-label',
        border: 'border-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        color: 'text-emerald-700 dark:text-emerald-300',
    },
    'plus': {
        sparkle: 'text-violet-500',
        labelKey: 'plus-plan-label',
        border: 'border-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        color: 'text-violet-700 dark:text-violet-300',
    },
    'pro': {
        sparkle: 'text-blue-500',
        labelKey: 'pro-plan-label',
        border: 'border-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        color: 'text-blue-700 dark:text-blue-300',
    },
};

const carouselPlans: PlanType[] = ['free', 'plus', 'pro'];

const carouselPrices: Record<PlanType, number> = { free: 0, plus: 12, pro: 22 };
const carouselAnnualPrices: Record<PlanType, number> = { free: 0, plus: 9, pro: 18 };
const planDescKey: Record<PlanType, string> = {
    'free': 'pricing-free-description',
    'plus': 'pricing-plus-description',
    'pro': 'pricing-pro-description',
};
interface OnboardingViewProps {
    onSkip?: () => void;
    isNewOrgFlow?: boolean;
}

const OnboardingView = ({ onSkip, isNewOrgFlow = false }: OnboardingViewProps) => {
    const t = useTranslations('onboarding');
    const tPricing = useTranslations('pricing');
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPlan = (searchParams.get('plan') as PlanType) ?? 'free';
    const urlBilling = (searchParams.get('billing') as 'monthly' | 'annual') ?? 'monthly';
    const urlPaid = searchParams.get('paid') === 'true';
    const urlCompany = searchParams.get('company') ?? '';
    const urlSessionId = searchParams.get('session_id') ?? '';
    const urlInviteToken = searchParams.get('invite_token') ?? '';

    const [choice, setChoice] = useState<OnboardingChoice>('create');
    const [createStep, setCreateStep] = useState<CreateStep>(isNewOrgFlow ? 'name' : 'confirm');
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [billing, setBilling] = useState<'monthly' | 'annual'>(isNewOrgFlow ? 'monthly' : urlBilling);
    const [joinToken, setJoinToken] = useState(urlInviteToken);

    const form = useForm<zod.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { company: '' },
    });

    const effectivePlan: PlanType = isNewOrgFlow ? selectedPlan : urlPlan;
    const effectiveBilling: 'monthly' | 'annual' = isNewOrgFlow ? billing : urlBilling;
    const billingCycle: 'MONTHLY' | 'YEARLY' = effectiveBilling === 'annual' ? 'YEARLY' : 'MONTHLY';

    const { mutate: stripeCheckout } = useStripeCheckout();
    const { mutate: acceptInvitationToken, isPending: isJoining } = useAcceptInvitationToken();
    const { mutate, isPending } = useCreateTeam({
        onSuccess: () => {
            router.push('/');
        },
    });

    const hasMutatedRef = useRef(false);
    useEffect(() => {
        if (urlPaid && urlCompany && urlSessionId && !hasMutatedRef.current) {
            hasMutatedRef.current = true;
            mutate({ json: { company: urlCompany, plan: urlPlan, billingCycle, stripeSessionId: urlSessionId } });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = (values: zod.infer<typeof formSchema>) => {
        if (effectivePlan !== 'free') {
            stripeCheckout({
                json: {
                    plan: effectivePlan,
                    billing: effectiveBilling,
                    company: values.company,
                }
            });
        } else {
            mutate({ json: { company: values.company, plan: effectivePlan, billingCycle } });
        }
    };

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        } else {
            router.push('/');
        }
    };

    const handleJoinOrganization = () => {
        if (!joinToken.trim()) return;

        acceptInvitationToken(
            { json: { token: joinToken.trim() } },
            {
                onSuccess: () => {
                    router.push('/');
                }
            }
        );
    };

    const handleSelectPlanFromCarousel = () => {
        setSelectedPlan(carouselPlans[carouselIndex]);
        setCreateStep('confirm');
    };

    const title = isNewOrgFlow ? t('add-org-title') : t('title');
    const subtitle = isNewOrgFlow ? t('add-org-subtitle') : t('subtitle');

    const renderPlanBadge = (plan: PlanType) => {
        const ps = planStyle[plan];
        return (
            <div className={['flex items-center gap-3 rounded-xl px-5 py-4 border-2', ps.border, ps.bg].join(' ')}>
                <SparklesIcon className={`size-5 flex-shrink-0 ${ps.sparkle}`} />
                <p className={`font-semibold text-base ${ps.color}`}>{t(ps.labelKey)}</p>
            </div>
        );
    };

    const renderRightPanelCreate = () => {
        // ── Original flow: plan from URL, no step logic ──
        if (!isNewOrgFlow) {
            return (
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-semibold">{t('create-team-title')}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{t('create-team-subtitle')}</p>
                    </div>
                    <Form {...form}>
                        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                name="company"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('org-name-placeholder')}
                                                disabled={isPending}
                                                className="h-11 bg-card"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-muted-foreground">{t('your-plan')}</p>
                                {renderPlanBadge(urlPlan)}
                            </div>
                            <Button type="submit" size="lg" disabled={isPending}>
                                {t('create-and-continue')}
                            </Button>
                            {urlPlan !== 'free' && (
                                <p className="text-xs text-muted-foreground text-center">
                                    {t('payment-redirect-notice')}
                                </p>
                            )}
                        </form>
                    </Form>
                </div>
            );
        }

        // ── New-org flow: step "name" ──
        if (createStep === 'name') {
            return (
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-semibold">{t('create-team-title')}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{t('create-team-subtitle')}</p>
                    </div>
                    <Form {...form}>
                        <form className="flex flex-col gap-4">
                            <FormField
                                name="company"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('org-name-placeholder')}
                                                className="h-11 bg-card"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                size="lg"
                                variant="outline"
                                // disabled={!companyValue?.trim()}
                                onClick={() => { setCarouselIndex(0); setCreateStep('select-plan'); }}
                            >
                                {/* <SparklesIcon className="size-4 mr-2" /> */}
                                {t('choose-plan-button')}
                            </Button>
                        </form>
                    </Form>
                </div>
            );
        }

        // ── New-org flow: step "select-plan" ──
        if (createStep === 'select-plan') {
            const currentPlan = carouselPlans[carouselIndex];
            const displayPrice = billing === 'annual' ? carouselAnnualPrices[currentPlan] : carouselPrices[currentPlan];
            return (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg self-center">
                        <button
                            type="button"
                            onClick={() => setBilling('monthly')}
                            className={[
                                'px-3 py-1 rounded-md text-xs font-medium capitalize transition-all duration-200',
                                billing === 'monthly'
                                    ? 'bg-background shadow text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                        >
                            {t('billing-monthly')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setBilling('annual')}
                            className={[
                                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium capitalize transition-all duration-200',
                                billing === 'annual'
                                    ? 'bg-background shadow text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                        >
                            {t('billing-annual')}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold">
                                {tPricing('pricing-annual-save')}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setCarouselIndex(i => (i - 1 + carouselPlans.length) % carouselPlans.length)}
                        >
                            <ChevronLeft className="size-5" />
                        </Button>

                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={`${carouselIndex}-${billing}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18 }}
                                className="flex-1 min-w-0"
                            >
                                <PricingCard
                                    type={currentPlan}
                                    description={planDescKey[currentPlan]}
                                    price={displayPrice}
                                    textButton=""
                                    billing={billing}
                                    compact
                                />
                            </motion.div>
                        </AnimatePresence>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setCarouselIndex(i => (i + 1) % carouselPlans.length)}
                        >
                            <ChevronRight className="size-5" />
                        </Button>
                    </div>

                    <Button type="button" size="lg" onClick={handleSelectPlanFromCarousel}>
                        {t('select-and-continue')}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/pricing')}>
                        {t('compare-plans')}
                    </Button>
                </div>
            );
        }

        // ── New-org flow: step "confirm" ──
        const ps = planStyle[selectedPlan] ?? planStyle['free'];
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-xl font-semibold">{t('create-team-title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('create-team-subtitle')}</p>
                </div>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            name="company"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder={t('org-name-placeholder')}
                                            disabled={isPending}
                                            className="h-11 bg-card"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">{t('your-plan')}</p>
                                <button
                                    type="button"
                                    onClick={() => setCreateStep('select-plan')}
                                    className="text-xs text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                                >
                                    {t('change-plan')}
                                </button>
                            </div>
                            <div className={['flex items-center gap-3 rounded-xl px-5 py-4 border-2', ps.border, ps.bg].join(' ')}>
                                <SparklesIcon className={`size-5 flex-shrink-0 ${ps.sparkle}`} />
                                <p className={`font-semibold text-base ${ps.color}`}>{t(ps.labelKey)}</p>
                            </div>
                        </div>
                        <Button type="submit" size="lg" disabled={isPending}>
                            {t('create-and-continue')}
                        </Button>
                        {selectedPlan !== 'free' && (
                            <p className="text-xs text-muted-foreground text-center">
                                {t('payment-redirect-notice')}
                            </p>
                        )}
                    </form>
                </Form>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="bg-card rounded-3xl shadow-xl border overflow-hidden flex flex-col md:flex-row min-h-[520px]">

                {/* Left panel */}
                <div className="flex flex-col justify-between gap-6 p-8 md:w-[45%] md:border-r">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <Image src="/gestionate-logo.svg" width={36} height={36} alt="Gestionate" />
                            <span className="font-semibold text-lg">Gestionate</span>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => setChoice('create')}
                                className={[
                                    'relative flex items-center gap-4 rounded-xl border-2 p-4 text-left',
                                    'transition-all duration-200 focus:outline-none',
                                    choice === 'create'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-background hover:border-primary/40',
                                ].join(' ')}
                            >
                                <div className={[
                                    'flex items-center justify-center rounded-lg p-2 flex-shrink-0 transition-colors duration-200',
                                    choice === 'create'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                ].join(' ')}>
                                    <Building2 className="size-5" />
                                </div>
                                <div>
                                    <p className={[
                                        'font-semibold text-sm transition-colors duration-200',
                                        choice === 'create' ? 'text-foreground' : 'text-muted-foreground',
                                    ].join(' ')}>
                                        {t('create-org')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {t('create-org-description')}
                                    </p>
                                </div>
                                {choice === 'create' && (
                                    <span className="absolute top-3 right-3 size-2 rounded-full bg-primary" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setChoice('join')}
                                className={[
                                    'relative flex items-center gap-4 rounded-xl border-2 p-4 text-left',
                                    'transition-all duration-200 focus:outline-none',
                                    choice === 'join'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-background hover:border-primary/40',
                                ].join(' ')}
                            >
                                <div className={[
                                    'flex items-center justify-center rounded-lg p-2 flex-shrink-0 transition-colors duration-200',
                                    choice === 'join'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                ].join(' ')}>
                                    <Users className="size-5" />
                                </div>
                                <div>
                                    <p className={[
                                        'font-semibold text-sm transition-colors duration-200',
                                        choice === 'join' ? 'text-foreground' : 'text-muted-foreground',
                                    ].join(' ')}>
                                        {t('join-org')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {t('join-org-description')}
                                    </p>
                                </div>
                                {choice === 'join' && (
                                    <span className="absolute top-3 right-3 size-2 rounded-full bg-primary" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSkip}
                        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors self-start"
                    >
                        {isNewOrgFlow ? t('back') : t('skip')}
                    </button>
                </div>

                {/* Right panel */}
                <div className="flex flex-col justify-center p-8 md:w-[55%] bg-muted/30 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${choice}-${createStep}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                            {choice === 'create' ? renderRightPanelCreate() : (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-xl font-semibold">{t('join-org')}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{t('join-token-description')}</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Input
                                            value={joinToken}
                                            onChange={event => setJoinToken(event.target.value)}
                                            placeholder={t('join-token-placeholder')}
                                            className="h-11 bg-card"
                                        />

                                        <Button
                                            onClick={handleJoinOrganization}
                                            size="lg"
                                            disabled={isJoining || !joinToken.trim()}
                                        >
                                            {t('join-with-token')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;
