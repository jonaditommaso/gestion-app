'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { upsertSsoConfigSchema } from '@/features/sso/schemas';
import { useUpsertSsoConfig } from '@/features/sso/api/use-upsert-sso-config';
import { SSOConfig } from '@/features/sso/types';

type FormValues = z.infer<typeof upsertSsoConfigSchema>;

interface SSOConfigFormProps {
    config: SSOConfig | null;
}

const SSOConfigForm = ({ config }: SSOConfigFormProps) => {
    const t = useTranslations('sso');
    const { mutate, isPending } = useUpsertSsoConfig();

    const form = useForm<FormValues>({
        resolver: zodResolver(upsertSsoConfigSchema),
        defaultValues: {
            domain: config?.domain ?? '',
            enabled: config?.enabled ?? false,
            provider: config?.provider ?? 'GOOGLE_WORKSPACE',
        },
    });

    const enabled = form.watch('enabled');

    const onSubmit = (values: FormValues) => {
        mutate(
            { json: values },
            {
                onSuccess: () => toast.success(t('saved')),
                onError: () => toast.error(t('save-error')),
            }
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/40">
                <ShieldCheck className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('domain-label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="acme.com"
                                        maxLength={50}
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label>{t('enforce-label')}</Label>
                            <p className="text-sm text-muted-foreground">{t('enforce-description')}</p>
                        </div>
                        <FormField
                            control={form.control}
                            name="enabled"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {enabled && (
                        <div className="flex items-center gap-2 p-3 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                            <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400 text-xs shrink-0">
                                {t('warning-badge')}
                            </Badge>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                {t('enforce-warning')}
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="self-start" disabled={isPending}>
                        {t('save')}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default SSOConfigForm;
