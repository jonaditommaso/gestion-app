'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const SignUpCard = () => {
    const { mutate, isPending } = useRegister();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan")

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
                    <CardTitle className="text-2xl">Bienvenido</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-7">
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Nombre"
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
                                                placeholder="Contraseña"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button size='lg' className="w-full" disabled={isPending}>
                                Registrarse
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <Separator />
                <CardContent className="p-7 flex flex-col gap-y-4">
                <Button size='lg' className="w-full" variant='outline' disabled={isPending}>
                    <FcGoogle className="mr-2 size-5" />
                    Iniciar sesion con Google
                </Button>
                <Button size='lg' className="w-full" variant='outline' disabled={isPending}>
                    <FaGithub className="mr-2 size-5" />
                    Iniciar sesion con Github
                </Button>
                </CardContent>
            </Card>
            <div className="md:w-[490px] text-balance mt-4 text-center">
                <p className="text-xs">* Si creas una cuenta, pero no escoges un plan, se creara una cuenta con plan free de manera automatica. Puedes modificarlo siempre que quieras.</p>
            </div>
        </div>
    );
}

export default SignUpCard;