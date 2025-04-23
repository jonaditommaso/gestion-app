import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { useCreateMessage } from "../../api/use-create-message";

interface CreateMessageModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const CreateMessageModal = ({ isOpen, setIsOpen }: CreateMessageModalProps) => {
    const { data: team, isLoading} = useGetMembers();
    const { data: user, isLoading: gettingUser } = useCurrent();
    const { mutate: createMessage, isPending: isSending } = useCreateMessage();
    const [memberSelected, setMemberSelected] = useState <undefined | string>(undefined);
    const [messageContent, setMessageContent] = useState('');
    const t = useTranslations('home');

    const handleSend = () => {
        if(!memberSelected || !messageContent) return;

        createMessage({
            json: {
                to: memberSelected,
                content: messageContent,
            }
        })

        setIsOpen(false);
    }

    return (
        <DialogContainer
            title={t('send-a-message')}
            description={t('choise-addressee')}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            {isLoading || gettingUser
                ? (
                    <div className="w-full flex justify-center">
                        <FadeLoader color="#999" width={3} className="mt-5" />
                    </div>
                )
                : (
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {team?.map(member => {
                                if(member.userId === user?.$id) return;

                                return (
                                    <Button variant='outline' key={member.$id} className={cn("cursor-pointer w-[160px] p-6 border rounded-md flex flex-col gap-1", memberSelected === member.$id ? 'border-2 border-blue-600' : '')} onClick={() => setMemberSelected(member.$id)}>
                                        <span className="text-sm">{member.name}</span>
                                        <span className="text-xs text-muted-foreground">{member.name}</span>
                                    </Button>
                                )
                            })}
                        </div>
                        <Textarea
                            placeholder={t('message')}
                            maxLength={256}
                            className="resize-none h-40 bg-sidebar"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <div className="flex items-center gap-2 justify-end mt-4">
                            <Button onClick={() => setIsOpen(false)} disabled={isSending} variant='secondary'>{t('cancel')}</Button>
                            <Button onClick={handleSend} disabled={isSending}>{t('send-message')}</Button>
                        </div>
                    </div>
                )
            }
        </DialogContainer>
    );
}

export default CreateMessageModal;