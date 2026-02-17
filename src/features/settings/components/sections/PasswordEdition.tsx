'use client'

import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/features/settings/api/use-change-password";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const PasswordEdition = () => {
    const t = useTranslations('settings');
    const { mutate: changePassword, isPending } = useChangePassword();

    const [isOpen, setIsOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const clearForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setRepeatPassword('');
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (newPassword.length < 8) {
            toast.error(t('password-min-length'));
            return;
        }

        if (newPassword !== repeatPassword) {
            toast.error(t('passwords-do-not-match'));
            return;
        }

        changePassword(
            {
                json: {
                    currentPassword,
                    newPassword,
                    repeatPassword,
                }
            },
            {
                onSuccess: () => {
                    clearForm();
                    setIsOpen(false);
                }
            }
        );
    }

    return (
        <>
            <DialogContainer
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title={t('change-password-title')}
                description={t('change-password-description')}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="current-password">{t('current-password')}</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="new-password">{t('new-password')}</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="repeat-password">{t('repeat-password')}</Label>
                        <Input
                            id="repeat-password"
                            type="password"
                            value={repeatPassword}
                            onChange={(event) => setRepeatPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mt-2 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                clearForm();
                                setIsOpen(false);
                            }}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </DialogContainer>

            <Button variant="outline" onClick={() => setIsOpen(true)}>
                {t('modify')}
            </Button>
        </>
    );
}

export default PasswordEdition;
