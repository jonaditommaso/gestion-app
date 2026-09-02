import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/AppContext";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { useCreateMessage } from "../../api/use-create-message";
import { Message } from "./types";

interface CreateMessageModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    forwardMessage?: Message | null,
    forwardSenderName?: string,
}

const CreateMessageModal = ({ isOpen, setIsOpen, forwardMessage, forwardSenderName }: CreateMessageModalProps) => {
    const { data, isLoading} = useGetMembers();
    const team = data?.members;
    const { currentUser: user, isDemo, isLoadingTeamContext } = useAppContext();
    const { mutate: createMessage, isPending: isSending } = useCreateMessage();
    const [recipients, setRecipients] = useState<{
        to: string[];
        cc: string[];
        bcc: string[];
    }>({
        to: [],
        cc: [],
        bcc: [],
    });
    const [subject, setSubject] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const t = useTranslations('home');
    const isForwardMode = Boolean(forwardMessage);

    // Filtrar el usuario actual de la lista de miembros
    const availableMembers = useMemo(() => {
        if (!team || (!user && !isDemo)) return [];
        return team.filter(member => member.userId !== (user ? user.$id : team[0].userId));
    }, [team, user, isDemo]);

    const selectedRecipientIds = useMemo(
        () => new Set([...recipients.to, ...recipients.cc, ...recipients.bcc]),
        [recipients]
    );

    const allSelected = availableMembers.length > 0 && selectedRecipientIds.size === availableMembers.length;
    const recipientsCount = recipients.to.length + recipients.cc.length + recipients.bcc.length;

    useEffect(() => {
        if (!isOpen || !forwardMessage) return;

        const currentSubject = forwardMessage.subject?.trim() || t('no-subject');
        const senderName = forwardSenderName || t('unknown-sender');

        setSubject(`${t('forward-prefix')}: ${currentSubject}`);
        setMessageContent(
            `${t('forwarded-message-label')}\n` +
            `${t('from')}: ${senderName}\n` +
            `${t('subject-label')}: ${currentSubject}\n\n` +
            `${forwardMessage.content}`
        );
        setRecipients({ to: [], cc: [], bcc: [] });
    }, [forwardMessage, forwardSenderName, isOpen, t]);

    const handleToggleMember = (memberId: string, target: 'to' | 'cc' | 'bcc') => {
        setRecipients(prev => {
            const wasSelectedInTarget = prev[target].includes(memberId);

            const next = {
                to: prev.to.filter(id => id !== memberId),
                cc: prev.cc.filter(id => id !== memberId),
                bcc: prev.bcc.filter(id => id !== memberId),
            };

            if (!wasSelectedInTarget) {
                next[target] = [...next[target], memberId];
            }

            return next;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allMemberIds = availableMembers.map(member => member.appwriteMembershipId ?? member.$id);

            setRecipients({
                to: isForwardMode ? [] : allMemberIds,
                cc: [],
                bcc: isForwardMode ? allMemberIds : [],
            });
        } else {
            setRecipients({ to: [], cc: [], bcc: [] });
        }
    };

    const handleToggleForwardRecipient = (memberId: string) => {
        setRecipients(prev => {
            const isSelected =
                prev.to.includes(memberId) ||
                prev.cc.includes(memberId) ||
                prev.bcc.includes(memberId);

            const next = {
                to: prev.to.filter(id => id !== memberId),
                cc: prev.cc.filter(id => id !== memberId),
                bcc: prev.bcc.filter(id => id !== memberId),
            };

            if (isSelected) {
                return next;
            }

            return {
                ...next,
                bcc: [...next.bcc, memberId],
            };
        });
    };

    const handleChangeForwardRecipientType = (memberId: string, target: 'cc' | 'bcc') => {
        setRecipients(prev => {
            const isSelected =
                prev.to.includes(memberId) ||
                prev.cc.includes(memberId) ||
                prev.bcc.includes(memberId);

            if (!isSelected) {
                return prev;
            }

            const next = {
                to: prev.to.filter(id => id !== memberId),
                cc: prev.cc.filter(id => id !== memberId),
                bcc: prev.bcc.filter(id => id !== memberId),
            };

            next[target] = [...next[target], memberId];
            return next;
        });
    };

    const handleSend = () => {
        if (!recipientsCount || !subject.trim() || !messageContent.trim()) return;

        createMessage({
            json: {
                toTeamMemberIds: recipients.to,
                ccTeamMemberIds: recipients.cc,
                bccTeamMemberIds: recipients.bcc,
                subject: subject.trim(),
                content: messageContent,
                forwardedFromMessageId: forwardMessage?.$id,
                originalSenderId: forwardMessage?.originalSenderId || forwardMessage?.fromTeamMemberId,
            }
        }, {
            onSuccess: () => {
                setRecipients({ to: [], cc: [], bcc: [] });
                setSubject('');
                setMessageContent('');
                setIsOpen(false);
            },
        });
    }

    return (
        <DialogContainer
            title={isForwardMode ? t('forward-message-title') : t('send-a-message')}
            description={isForwardMode ? t('forward-message-description') : t('choise-addressee')}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            contentClassName={isForwardMode ? 'sm:max-w-[880px] max-h-[90vh]' : undefined}
            bodyClassName={isForwardMode ? 'max-h-[80vh] overflow-y-auto' : undefined}
        >
            {isLoading || isLoadingTeamContext
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
                            {availableMembers.map(member => {
                                const memberId = member.appwriteMembershipId ?? member.$id;
                                const isTo = recipients.to.includes(memberId);
                                const isCc = recipients.cc.includes(memberId);
                                const isBcc = recipients.bcc.includes(memberId);
                                const isSelected = isTo || isCc || isBcc;

                                return (
                                    <div
                                        key={memberId}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            if (isForwardMode) {
                                                handleToggleForwardRecipient(memberId);
                                                return;
                                            }

                                            handleToggleMember(memberId, 'to');
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                if (isForwardMode) {
                                                    handleToggleForwardRecipient(memberId);
                                                    return;
                                                }

                                                handleToggleMember(memberId, 'to');
                                            }
                                        }}
                                        className={cn(
                                            "w-[220px] p-3 border rounded-md flex flex-col gap-2 transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/40 cursor-pointer"
                                        )}
                                    >
                                        <span className="text-sm text-left w-full">{member.name}</span>

                                        {isForwardMode ? (
                                            <div className="flex items-center gap-2 w-full">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isBcc ? 'default' : 'outline'}
                                                    className="h-7"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleChangeForwardRecipientType(memberId, 'bcc');
                                                    }}
                                                >
                                                    {t('recipient-bcc')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isCc ? 'default' : 'outline'}
                                                    className="h-7"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleChangeForwardRecipientType(memberId, 'cc');
                                                    }}
                                                >
                                                    {t('recipient-cc')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 w-full">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isTo ? 'default' : 'outline'}
                                                    className="h-7"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleToggleMember(memberId, 'to');
                                                    }}
                                                >
                                                    {t('recipient-to')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isCc ? 'default' : 'outline'}
                                                    className="h-7"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleToggleMember(memberId, 'cc');
                                                    }}
                                                >
                                                    {t('recipient-cc')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isBcc ? 'default' : 'outline'}
                                                    className="h-7"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleToggleMember(memberId, 'bcc');
                                                    }}
                                                >
                                                    {t('recipient-bcc')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <Input
                            placeholder={t('subject-placeholder')}
                            maxLength={100}
                            className="mb-3"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <Textarea
                            placeholder={t('message')}
                            maxLength={256}
                            className={cn('resize-none bg-sidebar', isForwardMode ? 'h-56' : 'h-40')}
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <div className="flex items-center gap-2 justify-end mt-4">
                            <Button onClick={() => setIsOpen(false)} disabled={isSending} variant='secondary'>{t('cancel')}</Button>
                            <Button onClick={handleSend} disabled={isSending || !recipientsCount || !subject.trim() || !messageContent.trim()}>{t('send-message')}</Button>
                        </div>
                    </div>
                )
            }
        </DialogContainer>
    );
}

export default CreateMessageModal;