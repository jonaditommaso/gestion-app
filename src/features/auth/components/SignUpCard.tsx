'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { z as zod } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form'
import { useRegister } from "../api/use-register";
import { registerSchema } from "../schemas";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

const SignUpCard = () => {
    const { mutate, isPending } = useRegister();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") || 'free';
    const t = useTranslations('auth');
    const isMobile = useIsMobile();
    const googleSignUpWarning = t('google-signup-test-warning');

    const [planSelected, setPlanSelected] = useState<null | string>(null);

    useEffect(() => {
        if (plan) {
            setPlanSelected(plan);
        }

        return () => {
          localStorage.removeItem("email");
        };
      }, [plan]);

    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("email") || "" : ""

    const form = useForm<zod.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            company: '',
            name: '',
            email: storedEmail,
            password: '',
            plan: 'free'
        }
    })

    const onSubmit = (values: zod.infer<typeof registerSchema>) => {
        mutate(
            { json: {...values, plan: planSelected === 'pro' ? planSelected : 'free'} }
        )
    }

    return (
        <div>
            {/* <PlanSelected planSelected={planSelected} setPlanSelected={setPlanSelected} /> */}

            <Card className="w-full h-full md:w-[490px] border-none shadow-none">
                <CardHeader className="flex items-center justify-center text-center p-7 max-sm:p-4">
                    <CardTitle className="text-2xl flex items-center gap-4 max-sm:text-lg">{t('welcome')} <Image src='/gestionate-logo.svg' height={40} width={40} alt="gestionate-logo" /></CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-7">
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                name="company"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('company-name')}
                                                disabled={isPending}
                                                className="max-sm:text-sm max-sm:h-8"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('user-name')}
                                                disabled={isPending}
                                                className="max-sm:text-sm max-sm:h-8"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t('your-email')}
                                                disabled={isPending}
                                                className="max-sm:text-sm max-sm:h-8"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={t('password')}
                                                disabled={isPending}
                                                className="max-sm:text-sm max-sm:h-8"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button size={isMobile ? 'sm' : 'lg'} className="w-full" disabled={isPending}>
                                {t('signup-button')}
                            </Button>

                            {!searchParams.get("plan") && (
                                <div className="text-center text-sm text-muted-foreground mt-2">
                                    <p>{t('default-free-plan-info')}</p>
                                    <Link
                                        href="/pricing"
                                        className="underline text-primary hover:text-primary/80"
                                    >
                                        {t('view-plans')}
                                    </Link>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
                <Separator />
                <CardContent className="p-7 flex flex-col gap-y-4">
                <div className="flex items-center gap-2">
                    <Button size={isMobile ? 'sm' : 'lg'} className="flex-1" variant='outline' disabled={isPending} onClick={() => signUpWithGoogle(plan)}>
                        <FcGoogle className="mr-2 size-5" />
                        {t('register-with')} Google
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="text-amber-500 text-lg leading-none cursor-help"
                                    aria-label={googleSignUpWarning}
                                >
                                    ⚠️
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <p>{googleSignUpWarning}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Button size={isMobile ? 'sm' : 'lg'} className="w-full" variant='outline' disabled={isPending} onClick={() => signUpWithGithub(plan)}>
                    <FaGithub className="mr-2 size-5" />
                    {t('register-with')} Github
                </Button>
                </CardContent>
                <CardFooter className="flex items-center gap-2 justify-center mt-2 max-sm:text-sm">
                    <p>{t('already-have-account')}</p> <Link href={'/login'} className="underline">{t('login')}</Link>
                </CardFooter>
            </Card>
            {/* <div className="md:w-[490px] text-balance mt-4 text-center">
                <p className="text-xs">* {t('signup-info')}</p>
            </div> */}
        </div>
    );
}

export default SignUpCard;