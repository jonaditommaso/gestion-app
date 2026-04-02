'use client'
import { Suspense, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import OnboardingView from "@/features/auth/components/OnboardingView";

const NoTeamWarning = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const t = useTranslations('team');

    return (
        <>
            <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden focus:outline-none">
                    <Suspense>
                        <OnboardingView onSkip={() => setModalIsOpen(false)} />
                    </Suspense>
                </DialogContent>
            </Dialog>
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
                <Button variant='outline' onClick={() => setModalIsOpen(true)}>
                    {t('manage-team')}
                </Button>
            </Alert>
        </>
    );
}

export default NoTeamWarning;