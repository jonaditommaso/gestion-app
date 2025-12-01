'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, Copy, Link, Send, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetMembers as useGetTeamMembers } from "@/features/team/api/use-get-members";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useCurrent } from "@/features/auth/api/use-current";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import { useCreateTaskShare } from "../api/use-create-task-share";
import { useBulkCreateTaskShare } from "../api/use-bulk-create-task-share";
import { TaskShareType } from "../types";

interface ShareTaskModalProps {
    taskId: string;
    taskName: string;
    taskType?: string;
    isOpen: boolean;
    onClose: () => void;
}

interface SelectableMember {
    id: string;
    userId: string;
    name: string;
    email?: string;
    type: 'workspace' | 'team';
}

export const ShareTaskModal = ({ taskId, taskName, taskType = 'task', isOpen, onClose }: ShareTaskModalProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';
    const workspaceId = useWorkspaceId();
    const { data: currentUser } = useCurrent();
    const { data: workspaceMembers } = useGetMembers({ workspaceId });
    const { data: teamMembers } = useGetTeamMembers();
    const { mutateAsync: createTaskShare } = useCreateTaskShare();
    const { mutateAsync: bulkCreateTaskShare } = useBulkCreateTaskShare();

    // Get task type option
    const typeOption = TASK_TYPE_OPTIONS.find(t => t.value === taskType) || TASK_TYPE_OPTIONS.find(t => t.value === 'task')!;
    const TypeIcon = typeOption.icon;

    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [copied, setCopied] = useState(false);
    const [publicLinkCopied, setPublicLinkCopied] = useState(false);
    const [isGeneratingPublicLink, setIsGeneratingPublicLink] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Enlace directo a la tarea (requiere autenticación)
    const taskLink = typeof window !== 'undefined'
        ? `${window.location.origin}/workspaces/${workspaceId}/tasks/${taskId}`
        : '';

    const handleCopyTaskLink = async () => {
        try {
            await navigator.clipboard.writeText(taskLink);
            setCopied(true);
            toast.success(t('link-copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('error-copying-link'));
        }
    };

    const handleGeneratePublicLink = async () => {
        if (!currentUser) return;

        setIsGeneratingPublicLink(true);
        try {
            const token = crypto.randomUUID();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 15); // 15 días de vigencia

            await createTaskShare({
                json: {
                    taskId,
                    workspaceId,
                    token,
                    expiresAt,
                    type: TaskShareType.EXTERNAL,
                    sharedBy: currentUser.$id,
                    readOnly: true,
                }
            });

            const link = `${window.location.origin}/shared/task/${token}`;
            await navigator.clipboard.writeText(link);
            setPublicLinkCopied(true);
            toast.success(t('public-link-generated'));
        } catch {
            toast.error(t('error-copying-link'));
        } finally {
            setIsGeneratingPublicLink(false);
        }
    };

    const handleToggleMember = (memberId: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId);
        } else {
            newSelected.add(memberId);
        }
        setSelectedMembers(newSelected);
    };

    const handleSendInternal = async () => {
        if (selectedMembers.size === 0) {
            toast.error(t('select-at-least-one-member'));
            return;
        }

        setIsSending(true);
        try {
            // Construir la lista de recipients con la info necesaria
            const recipients = Array.from(selectedMembers).map(memberId => {
                const member = uniqueMembers.find(m => m.id === memberId);
                if (!member) throw new Error('Member not found');

                return {
                    memberId: member.id,
                    userId: member.userId,
                    isWorkspaceMember: member.type === 'workspace',
                };
            });

            await bulkCreateTaskShare({
                json: {
                    taskId,
                    taskName,
                    workspaceId,
                    recipients,
                    message: message.trim() || undefined,
                    locale,
                }
            });

            handleClose();
        } catch {
            // El error ya se maneja en el hook
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setSelectedMembers(new Set());
        setMessage('');
        setShowMessageInput(false);
        setCopied(false);
        setPublicLinkCopied(false);
        onClose();
    };

    // Combinar miembros del workspace y del team
    const workspaceMembersList = (workspaceMembers?.documents || []) as unknown as Array<{ $id: string; name: string; email?: string; userId: string }>;
    const teamMembersList = (teamMembers || []) as unknown as Array<{ $id: string; userName: string; userEmail?: string; userId: string }>;

    const allMembers: SelectableMember[] = [
        ...workspaceMembersList.map((m) => ({
            id: m.$id,
            userId: m.userId,
            name: m.name,
            email: m.email,
            type: 'workspace' as const
        })),
        ...teamMembersList.map((m) => ({
            id: `team_${m.$id}`,
            userId: m.userId,
            name: m.userName,
            email: m.userEmail,
            type: 'team' as const
        }))
    ];

    // Eliminar duplicados por email y filtrar el usuario actual
    const uniqueMembers = allMembers.reduce((acc, member) => {
        // Filtrar el usuario actual por email
        if (currentUser?.email && member.email === currentUser.email) {
            return acc;
        }
        const exists = acc.find(m => m.email && m.email === member.email);
        if (!exists) {
            acc.push(member);
        }
        return acc;
    }, [] as SelectableMember[]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="size-5" />
                        {t('share-task')}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <TypeIcon className={cn("size-4", typeOption.textColor)} />
                    <span className="font-medium text-foreground">{taskName}</span>
                </div>

                <div className="space-y-6">
                    {/* Sección: Envío interno */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <h4 className="text-sm font-medium">{t('share-internal')}</h4>
                        </div>

                        {/* Lista de miembros */}
                        {uniqueMembers.length === 0 ? (
                            <div className="border rounded-md p-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    {t('no-members-available')}
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[160px] border rounded-md p-2">
                                <div className="space-y-1">
                                    {uniqueMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                                selectedMembers.has(member.id)
                                                    ? "bg-primary/10"
                                                    : "hover:bg-muted"
                                            )}
                                            onClick={() => handleToggleMember(member.id)}
                                        >
                                            <Checkbox
                                                checked={selectedMembers.has(member.id)}
                                                onCheckedChange={() => handleToggleMember(member.id)}
                                            />
                                            <MemberAvatar
                                                name={member.name}
                                                className="size-8"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {member.name}
                                                </p>
                                                {member.email && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                member.type === 'workspace'
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                            )}>
                                                {member.type === 'workspace' ? t('workspace-member') : t('team-member')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        {/* Solo mostrar mensaje y botón si hay miembros disponibles */}
                        {uniqueMembers.length > 0 && (
                            <>
                                {/* Mensaje personalizado (colapsable) */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMessageInput(!showMessageInput)}
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <motion.span
                                            animate={{ rotate: showMessageInput ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="size-4" />
                                        </motion.span>
                                        {t('add-message')} <span>({t('optional')})</span>
                                    </button>
                                    <AnimatePresence>
                                        {showMessageInput && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <Textarea
                                                    placeholder={t('write-message-placeholder')}
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    className="resize-none mt-2"
                                                    rows={2}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Botón enviar */}
                                <Button
                                    onClick={handleSendInternal}
                                    disabled={selectedMembers.size === 0 || isSending}
                                    className="w-full"
                                >
                                    <Send className="size-4 mr-2" />
                                    {isSending ? t('sending') : t('send-to-selected', { count: selectedMembers.size })}
                                </Button>
                            </>
                        )}

                        {/* Enlace de la tarea (siempre visible) */}
                        <div className="space-y-2 pt-2">
                            <p className="text-xs text-muted-foreground">
                                {t.rich('copy-task-link', {
                                    bold: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
                                })}
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={taskLink}
                                    readOnly
                                    tabIndex={-1}
                                    className="flex-1 bg-muted text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyTaskLink}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="size-4 text-green-500" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Sección: Enlace público */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Link className="size-4 text-muted-foreground" />
                            <h4 className="text-sm font-medium">{t('public-link')}</h4>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {t.rich('public-link-description', {
                                bold: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
                            })}
                        </p>

                        <Button
                            variant="outline"
                            onClick={handleGeneratePublicLink}
                            disabled={isGeneratingPublicLink || publicLinkCopied}
                            className="w-full"
                        >
                            {publicLinkCopied ? (
                                <>
                                    <Check className="size-4 mr-2 text-green-500" />
                                    {t('public-link-generated')}
                                </>
                            ) : isGeneratingPublicLink ? (
                                t('generating')
                            ) : (
                                <>
                                    <Link className="size-4 mr-2" />
                                    {t('generate-public-link')}
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            {t.rich('link-validity', {
                                days: 15,
                                bold: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
                            })} {t('link-validity-settings')}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
