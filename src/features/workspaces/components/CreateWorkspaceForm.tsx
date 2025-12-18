'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createWorkspaceSchema } from "../schema";
import { z as zod } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import { WorkspaceType } from "../types";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useGetWorkspacesCount } from "../api/use-get-workspaces-count";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { FeatureIncluded, FEATURES_INCLUDED } from "../constants/features-included";
//import { toast } from "sonner";

interface CreateWorkspaceFormProps {
    onCancel?: () => void,
    initialValues?: WorkspaceType,
    editMode?: boolean, // problema de importar mutate as edit from useUpdateWorkspace
    workspaceId?: string
}

const CreateWorkspaceForm = ({  }: CreateWorkspaceFormProps) => {
    const { mutate, isPending } = useCreateWorkspace();
    const { data: workspacesCount, isLoading: isLoadingCount } = useGetWorkspacesCount();
    const router = useRouter();
    const t = useTranslations('workspaces')

    const schema = zod.object({
        name: zod.string().trim().min(1, t('field-required'))
    });

    const form = useForm<zod.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: ''
        }
    });

    const onSubmit = (values: zod.infer<typeof createWorkspaceSchema>) => {
        mutate({ json: values }, {
            onSuccess: ({ data }) => {
                form.reset();
                router.push(`/workspaces/${data.$id}`);
            }
        });
    }

    const handleCancel = () => {
        // Si hay historial de navegación, volver atrás
        if (window.history.length > 1) {
            router.back();
        } else {
            // Si no hay historial (entrada directa), ir a /workspaces
            router.push('/workspaces');
        }
    }

    const showCancelButton = workspacesCount && workspacesCount.count > 0;

    //const fullInviteLink = `${window.location.origin}/workspaces/${initialValues?.$id}/join/${initialValues?.inviteCode}`

    // const handleCopyInviteLink = () => {
    //     navigator.clipboard.writeText(fullInviteLink).then(() => toast.success('Código de invitación copiado al portapapeles'))
    // }

    return (
        <div>
            <Card className="w-full h-full">
                <CardHeader className="flex p-6 pb-4">
                    <CardTitle className="text-xl font-semibold text-center">
                        {t('create-workspace')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                        {t('workspace-quick-setup')}
                    </p>
                </CardHeader>
                <CardContent className="pt-2">
                    {/* Features incluidas */}
                    <div className="mb-6 p-2 pb-4 bg-muted/30 rounded-lg border border-muted">
                        <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 size={14} />
                            {t('includes-by-default')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {FEATURES_INCLUDED.map((feature: FeatureIncluded) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-full text-xs border">
                                        <Icon size={14} className="text-primary" />
                                        <span>{t(feature.translationKey)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4 pb-5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground">{t('workspace-name')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('my-workspace')}
                                                    {...field}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                {isLoadingCount ? (
                                    <Skeleton className="w-32 h-10" />
                                ) : showCancelButton && (
                                    <Button type="button" size='lg' variant='outline' onClick={handleCancel} disabled={isPending}>
                                        {t('cancel')}
                                    </Button>
                                )}
                                <Button type="submit" size='lg' disabled={isPending}>
                                    {t('create')}
                                </Button>

                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="flex justify-center mt-10">
                <Image width={400} height={400} alt='new workspace image' src={'/new-workspace.svg'} />
            </div>
        </div>

    );
}

export default CreateWorkspaceForm;