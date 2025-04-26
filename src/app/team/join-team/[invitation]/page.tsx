'use client'
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { registerByInvitationFormSchema } from "@/features/auth/schemas";
import { useGetInvitation } from "@/features/team/api/use-get-invitation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from 'zod';
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import FadeLoader from "react-spinners/FadeLoader";
import { useRegisterByInvitation } from "@/features/auth/api/use-register-by-invitation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

const JoinTeamView = () => {
    const params = useParams();
    const { data, isPending } = useGetInvitation(typeof params.invitation === 'string' ? params.invitation : '');
    const { mutate: register, isPending: isCreating } = useRegisterByInvitation();
    const t = useTranslations('team')

    const form = useForm<zod.infer<typeof registerByInvitationFormSchema>>({
        resolver: zodResolver(registerByInvitationFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    useEffect(() => {
        if(!data) return;
        if (data.email) {
            form.setValue('email', data.email)
        }
    }, [data]);

    if(isPending) return (
        <div className="w-full flex justify-center">
            <FadeLoader color="#999" width={3} className="mt-5" />
        </div>
    )

    if (!data) return null //make a view for this
    // prever tambien que el token ya haya sido utilizado para mostrarlo tambien

    const onSubmit = (values: zod.infer<typeof registerByInvitationFormSchema>) => {
        register(
            { json: {
                ...values,
                teamId: data.teamId,
                teamName: data.teamName,
                inviteId: data.$id
            } }
        )
    }

    return (
        <Card className="flex flex-col items-center justify-center w-[400px] p-4 gap-4 m-auto">
            <CardTitle>{t('join-to')} {data.teamName}</CardTitle>
            <CardDescription>{t('invitation-recived-by')} <span className="font-medium">{data.invitedByName}</span> {t('in-order-to-join')} <span className="font-medium">{data.teamName}</span>. {t('invitation-description')}</CardDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
                    <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="email"
                                        disabled
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
                                        placeholder={t('name-placeholder')}
                                        disabled={isCreating}
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
                                        placeholder={t('enter-new-password-placeholder')}
                                        disabled={isCreating}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Separator />
                    <Button className="w-full" disabled={isCreating} type="submit">{t('create-account')}</Button>
                </form>
            </Form>
        </Card>
    );
}

export default JoinTeamView;