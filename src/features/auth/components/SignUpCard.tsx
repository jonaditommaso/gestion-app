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
import PlanSelected from "./PlanSelected";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";
import Image from "next/image";
import Link from "next/link";

const SignUpCard = () => {
    const { mutate, isPending } = useRegister();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");
    const t = useTranslations('auth');

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
            <PlanSelected planSelected={planSelected} setPlanSelected={setPlanSelected} />

            <Card className="w-full h-full md:w-[490px] border-none shadow-none">
                <CardHeader className="flex items-center justify-center text-center p-7">
                    <CardTitle className="text-2xl flex items-center gap-4">{t('welcome')} <Image src='/gestionate-logo.svg' height={40} width={40} alt="gestionate-logo" /></CardTitle>
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
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button size='lg' className="w-full" disabled={isPending}>
                                {t('signup-button')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <Separator />
                {/* <CardContent className="p-7 flex flex-col gap-y-4">
                <Button size='lg' className="w-full" variant='outline' disabled={isPending} onClick={() => signUpWithGoogle()}>
                    <FcGoogle className="mr-2 size-5" />
                    {t('login-with')} Google
                </Button>
                <Button size='lg' className="w-full" variant='outline' disabled={isPending} onClick={() => signUpWithGithub()}>
                    <FaGithub className="mr-2 size-5" />
                    {t('login-with')} Github
                </Button>
                </CardContent> */}
                <CardFooter className="flex items-center gap-2 justify-center mt-2">
                    <p>{t('already-have-account')}</p> <Link href={'/login'} className="underline">{t('login')}</Link>
                </CardFooter>
            </Card>
            <div className="md:w-[490px] text-balance mt-4 text-center">
                <p className="text-xs">* {t('signup-info')}</p>
            </div>
        </div>
    );
}

export default SignUpCard;