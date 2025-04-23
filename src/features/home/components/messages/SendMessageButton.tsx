'use client'
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import CreateMessageModal from "./CreateMessageModal";

const SendMessageButton = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const t = useTranslations('home');

    return (
        <>
            {/* I do it in this way in order to dont call useGetMembers hook if modal is not rendered */}
            {modalIsOpen && <CreateMessageModal isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />}
            <Button className="w-full py-10 h-auto" variant='outline' onClick={() => setModalIsOpen(true)}>
                <MessageSquareText /> <span>{t('send-a-message')}</span>
            </Button>
        </>
    );
}

export default SendMessageButton;