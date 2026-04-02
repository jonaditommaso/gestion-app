import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useCreateMfaChallenge } from "@/features/auth/api/use-create-mfa-challenge";
import MfaCard from "@/features/auth/components/MfaCard";

export const useMfaConfirm = (): [() => JSX.Element, () => Promise<boolean>] => {
    const t = useTranslations('auth');
    const { currentUser } = useAppContext();
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
    const [challengeId, setChallengeId] = useState<string | null>(null);
    const { mutate: createChallenge } = useCreateMfaChallenge();

    const confirm = (): Promise<boolean> => {
        if (!currentUser?.mfa) {
            return Promise.resolve(true);
        }

        return new Promise((resolve) => {
            createChallenge(undefined, {
                onSuccess: (data) => {
                    setChallengeId(data.challengeId);
                    setPromise({ resolve });
                },
                onError: () => {
                    resolve(false);
                }
            });
        });
    };

    const handleSuccess = () => {
        promise?.resolve(true);
        setPromise(null);
        setChallengeId(null);
    };

    const handleClose = () => {
        promise?.resolve(false);
        setPromise(null);
        setChallengeId(null);
    };

    const MfaDialog = () => (
        <Dialog open={!!promise} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md p-0">
                <VisuallyHidden>
                    <DialogTitle>{t('authentication-code-title')}</DialogTitle>
                </VisuallyHidden>
                {challengeId && (
                    <MfaCard challengeId={challengeId} onSuccess={handleSuccess} />
                )}
            </DialogContent>
        </Dialog>
    );

    return [MfaDialog, confirm];
};
