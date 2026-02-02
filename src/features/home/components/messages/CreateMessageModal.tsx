import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
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
    const [membersSelected, setMembersSelected] = useState<string[]>([]);
    const [messageContent, setMessageContent] = useState('');
    const t = useTranslations('home');

    // Filtrar el usuario actual de la lista de miembros
    const availableMembers = useMemo(() => {
        if (!team || !user) return [];
        return team.filter(member => member.userId !== user.$id);
    }, [team, user]);

    const allSelected = availableMembers.length > 0 && membersSelected.length === availableMembers.length;

    const handleToggleMember = (memberId: string) => {
        setMembersSelected(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setMembersSelected(availableMembers.map(member => member.$id));
        } else {
            setMembersSelected([]);
        }
    };

    const handleSend = () => {
        if(!membersSelected.length || !messageContent || !user?.prefs?.teamId) return;

        createMessage({
            json: {
                toTeamMemberIds: membersSelected,
                content: messageContent,
                teamId: user.prefs.teamId,
            }
        });

        setMembersSelected([]);
        setMessageContent('');
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
                        {availableMembers.length > 0 && (
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox
                                    id="select-all"
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label
                                    htmlFor="select-all"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    {t('send-to-all-team')}
                                </label>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {availableMembers.map(member => (
                                <Button
                                    variant='outline'
                                    key={member.$id}
                                    className={cn(
                                        "cursor-pointer w-[160px] p-6 border rounded-md flex flex-col gap-1",
                                        membersSelected.includes(member.$id) ? 'border-blue-600' : ''
                                    )}
                                    onClick={() => handleToggleMember(member.$id)}
                                >
                                    <span className="text-sm">{member.name}</span>
                                    <span className="text-xs text-muted-foreground">{member.name}</span>
                                </Button>
                            ))}
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
                            <Button onClick={handleSend} disabled={isSending || !membersSelected.length || !messageContent.trim()}>{t('send-message')}</Button>
                        </div>
                    </div>
                )
            }
        </DialogContainer>
    );
}

export default CreateMessageModal;