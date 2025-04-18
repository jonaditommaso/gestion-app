'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createWorkspaceSchema } from "../schema";
import { z as zod } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import { WorkspaceType } from "../types";
import { useTranslations } from "next-intl";
import Image from "next/image";
//import { toast } from "sonner";

interface CreateWorkspaceFormProps {
    onCancel?: () => void,
    initialValues?: WorkspaceType,
    editMode?: boolean, // problema de importar mutate as edit from useUpdateWorkspace
    workspaceId?: string
}

const CreateWorkspaceForm = ({ onCancel,  }: CreateWorkspaceFormProps) => {
    const { mutate, isPending } = useCreateWorkspace();
    const router = useRouter();
    const t = useTranslations('workspaces')

    const form = useForm<zod.infer<typeof createWorkspaceSchema>>({
        resolver: zodResolver(createWorkspaceSchema),
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

    //const fullInviteLink = `${window.location.origin}/workspaces/${initialValues?.$id}/join/${initialValues?.inviteCode}`

    // const handleCopyInviteLink = () => {
    //     navigator.clipboard.writeText(fullInviteLink).then(() => toast.success('Código de invitación copiado al portapapeles'))
    // }

    return (
        <div>
            <Card className="w-full h-full">
                <CardHeader className="flex p-3">
                    <CardTitle className="text-xl font-semibold text-center">
                        {t('create-workspace')}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <Separator />
                </div>
                <CardContent className="pt-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* <FormLabel>Nombre del workspace</FormLabel> */}
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
                            <div className="py-5 px-0">
                                <Separator  />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <Button type="button" size='lg' variant='outline' onClick={onCancel} disabled={isPending}>
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" size='lg' disabled={isPending}>
                                    {t('create')}
                                </Button>

                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="flex justify-center mt-20">
                <Image width={400} height={400} alt='new workspace image' src={'/new-workspace.svg'} />
            </div>
        </div>

    );
}

export default CreateWorkspaceForm;