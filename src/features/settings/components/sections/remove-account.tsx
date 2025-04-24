'use client'
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useDeleteAccount } from "@/features/auth/api/use-delete-account";
import { useTranslations } from "next-intl";
import { useState } from "react";

const RemoveAccount = () => {
    const t = useTranslations('settings');
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const { mutate: deleteAccount, isPending } = useDeleteAccount()

    const handleDelete = async () => {
        deleteAccount()
    }

    return (
        <div className="flex items-center justify-end w-full">
            <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant='destructive'>{t('remove-account')}</Button>
                </PopoverTrigger>

                <PopoverContent>
                    <p className="text-sm text-balance text-center">{t('are-you-sure-delete')}</p>
                    <p className="text-sm text-balance text-center text-destructive">{t('irreversible-action')}</p>
                    <Separator className="my-2"/>
                    <div className="flex items-center gap-2 justify-center">
                        <Button variant='outline' size='sm' onClick={() => setPopoverIsOpen(false)} disabled={isPending}>{t('cancel')}</Button>
                        <Button variant='destructive' size='sm' onClick={handleDelete} disabled={isPending}>{t('delete')}</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default RemoveAccount;