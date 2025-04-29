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
import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const LoginCard = () => {
    const { mutate, isPending } = useLogin();
    const t = useTranslations('auth')

    const form = useForm<zod.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = (values: zod.infer<typeof loginSchema>) => {
        mutate({json: values})
    }

    return (
        <div className="flex gap-36 items-start">
            <div className="">
                <div className="flex justify-center mb-10">
                    <Image width={200} height={200} alt="gestionate logo login" src={'/gestionate-logo.svg'} />
                </div>
                <p className="text-6xl font-bold text-gray-800 text-center">Gestionate</p>
                <p className="text-center text-lg mt-4">{t('initial-login-message')}</p>
            </div>
            <Card className="w-full h-full md:w-[490px] border-none shadow-none">
                <CardHeader className="flex items-center justify-center text-center p-7">
                    <CardTitle className="text-2xl">{t('login')}</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-7">
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Email"
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
                                {t('login')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <Separator />
                <CardContent className="p-7 flex flex-col gap-y-4">
                <Button size='lg' className="w-full" variant='outline' disabled={isPending} onClick={() => signUpWithGoogle()}>
                    <FcGoogle className="mr-2 size-5" />
                    {t('login-with')} Google
                </Button>
                <Button size='lg' className="w-full" variant='outline' disabled={isPending} onClick={() => signUpWithGithub()}>
                    <FaGithub className="mr-2 size-5" />
                    {t('login-with')} Github
                </Button>
                </CardContent>
                <CardFooter className="flex items-center gap-2 justify-center mt-2">
                    <p>{t('dont-have-account')}</p> <Link href={'/signup'} className="underline">{t('signup-button')}</Link>
                </CardFooter>
            </Card>
        </div>

    );
}

export default LoginCard;