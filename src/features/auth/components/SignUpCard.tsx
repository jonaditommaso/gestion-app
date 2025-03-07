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

const SignUpCard = () => {
    const { mutate, isPending } = useRegister()

    const form = useForm<zod.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    })

    const onSubmit = (values: zod.infer<typeof registerSchema>) => {
        mutate({json: values})
    }

    return (
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
    );
}

export default SignUpCard;