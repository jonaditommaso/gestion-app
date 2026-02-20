'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrent } from "@/features/auth/api/use-current";
import { useCreateMessage } from "@/features/home/api/use-create-message";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useState } from "react";

interface SendDirectMessageModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    recipientId: string;
    recipientName: string;
}

const SendDirectMessageModal = ({ isOpen, setIsOpen, recipientId, recipientName }: SendDirectMessageModalProps) => {
    const { data: user } = useCurrent();
    const { mutate: createMessage, isPending } = useCreateMessage();
    const [messageContent, setMessageContent] = useState('');
    const t = useTranslations('home');

    const handleSend = () => {
        if (!messageContent.trim() || !user?.prefs?.teamId) return;

        createMessage({
            json: {
                toTeamMemberIds: [recipientId],
                content: messageContent,
                teamId: user.prefs.teamId,
            }
        }, {
            onSuccess: () => {
                setMessageContent('');
                setIsOpen(false);
            }
        });
    };

    return (
        <DialogContainer
            title={t('send-message')}
            description={recipientName}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <Textarea
                placeholder={t('message')}
                maxLength={256}
                className="resize-none h-40 bg-sidebar"
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
            />
            <div className="flex items-center gap-2 justify-end mt-4 pb-4">
                <Button onClick={() => setIsOpen(false)} disabled={isPending} variant="secondary">
                    {t('cancel')}
                </Button>
                <Button onClick={handleSend} disabled={isPending || !messageContent.trim()}>
                    {t('send-message')}
                </Button>
            </div>
        </DialogContainer>
    );
};

export default SendDirectMessageModal;
