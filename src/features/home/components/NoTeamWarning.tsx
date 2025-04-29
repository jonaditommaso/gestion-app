'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useEditCompanyName } from "../api/use-edit-company-name";

const NoTeamWarning = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const {mutate: editCompanyName, isPending} = useEditCompanyName();
    const t = useTranslations('team');

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { elements } = event.currentTarget

        const companyInput = elements.namedItem('company');

        const isInput = companyInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        editCompanyName({
            json: {
                company: companyInput.value
            }
        });

        companyInput.value = ''
    }

    return (
        <>
            <DialogContainer
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
                title={t('add-company-name-title')}
                description={t('add-company-name-description')}
            >
                <form onSubmit={handleCreate}>
                    <div className="flex flex-col gap-4">
                        <Input type="text" placeholder={t('company-name')} name="company" />
                        <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => setModalIsOpen(false)} variant='outline' type="button" disabled={isPending}>{t('cancel')}</Button>
                            <Button disabled={isPending}>{t('add-team')}</Button>
                        </div>
                    </div>
                </form>
            </DialogContainer>
            <Alert variant='warning' className="mb-5 w-[50%] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <TriangleAlert />
                    <div>
                        <AlertTitle>{t('no-team-title')}</AlertTitle>
                        <AlertDescription>
                            {t('no-team-description')}
                        </AlertDescription>
                    </div>
                </div>
                <Button variant='outline' onClick={() => setModalIsOpen(true)} disabled={isPending || modalIsOpen}>
                    {t('add-team')}
                </Button>
            </Alert>
        </>
    );
}

export default NoTeamWarning;