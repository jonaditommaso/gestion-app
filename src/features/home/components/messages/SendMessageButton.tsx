'use client'
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CreateMessageModal from "./CreateMessageModal";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { TooltipContainer } from "@/components/TooltipContainer";
import { cn } from "@/lib/utils";

const SendMessageButton = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const t = useTranslations('home');

    const { data: teamData } = useGetMembers();
    const team = teamData?.members;

    const actionDisabled = useMemo(() => (team || []).length < 2, [team]);

    const handleOpen = () => {
        if (actionDisabled) return;
        setModalIsOpen(true);
    }

    const Trigger = (
        <Button
            className={cn("w-full h-28", actionDisabled ? 'opacity-50 cursor-default hover:bg-transparent' : '')}
            variant='outline'
            onClick={handleOpen}>
            <MessageSquareText /> <span>{t('send-a-message')}</span>
        </Button>
    )

    return (
        <>
            {/* I do it in this way in order to dont call useGetMembers hook if modal is not rendered */}
            {modalIsOpen && <CreateMessageModal isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />}
            {actionDisabled
                ? (
                    <TooltipContainer tooltipText={t('no-team-members')}>
                        {Trigger}
                    </TooltipContainer>
                )
                : (
                    <div>
                        {Trigger}
                    </div>
                )
            }
        </>
    );
}

export default SendMessageButton;