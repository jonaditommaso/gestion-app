import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useAddShortcut } from "../../api/use-add-shortcut";
import { z as zod } from 'zod';
import { shortcutSchema } from "../../schemas";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

interface ShortcutFormProps {
    form:  UseFormReturn<{
        link: string;
        text: string;
    }>,
    setPopoverIsOpen: Dispatch<SetStateAction<boolean>>
}

const ShortcutForm = ({ form, setPopoverIsOpen }: ShortcutFormProps) => {
    const { mutate: addShortcut, isPending } = useAddShortcut();
    const t = useTranslations('home');

    const onSubmit = (values: zod.infer<typeof shortcutSchema>) => {
        addShortcut({ json: values})
        setPopoverIsOpen(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name="link"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="w-[90%] m-auto">
                                <Label>Link</Label>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder={t('paste-link')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="text"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="w-[90%] m-auto mt-8">
                                <Label>{t('text')}</Label>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder={t('text-display')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                <Separator className="my-4" />
                <div className="flex items-center gap-2 justify-center p-2">
                    <Button className="w-full" variant='secondary' size='sm' type="button" onClick={() => setPopoverIsOpen(false)} disabled={isPending}>{t('cancel')}</Button>
                    <Button className="w-full" size='sm' type="submit" disabled={isPending}>{t('add')}</Button>
                </div>
            </form>
        </Form>
    );
}

export default ShortcutForm;