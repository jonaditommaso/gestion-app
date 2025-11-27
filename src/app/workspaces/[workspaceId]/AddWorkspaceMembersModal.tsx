'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { useGetMembers as useGetWorkspaceMembers } from "@/features/members/api/use-get-members";
import { useAddMembers } from "@/features/members/api/use-add-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import FadeLoader from "react-spinners/FadeLoader";
import { ScrollArea } from "@/components/ui/scroll-area";

type WorkspaceMember = {
    userId: string;
    workspaceId: string;
    role: string;
    $id: string;
    name: string;
    email: string;
}

interface AddWorkspaceMembersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
}

const AddWorkspaceMembersModal = ({
    open,
    onOpenChange,
    workspaceId
}: AddWorkspaceMembersModalProps) => {
    const { data: teamMembers, isLoading } = useGetMembers();
    const { data: workspaceMembers, isLoading: isLoadingWorkspaceMembers } = useGetWorkspaceMembers({ workspaceId });
    const { mutate: addMembers, isPending } = useAddMembers();
    const t = useTranslations('workspaces');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Extraer los userIds de los miembros actuales del workspace
    const currentMemberIds = (workspaceMembers?.documents as WorkspaceMember[] | undefined)?.map(m => m.userId) || [];

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAddMembers = () => {
        // Construir el array de members con toda la información necesaria
        const membersData = selectedUsers.map(userId => {
            const teamMember = teamMembers?.find(m => m.userId === userId);
            return {
                userId,
                name: teamMember?.name || '',
                email: teamMember?.email || '',
                avatarId: teamMember?.prefs?.image || null
            };
        });

        addMembers(
            {
                json: {
                    workspaceId,
                    userIds: selectedUsers,
                    members: membersData
                }
            },
            {
                onSuccess: () => {
                    setSelectedUsers([]);
                    onOpenChange(false);
                }
            }
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('add-members-to-workspace')}</DialogTitle>
                </DialogHeader>

                {isLoading || isLoadingWorkspaceMembers ? (
                    <div className="w-full flex justify-center py-8">
                        <FadeLoader color="#999" width={3} />
                    </div>
                ) : (
                    <>
                        <ScrollArea className="max-h-[400px] pr-4">
                            <div className="space-y-2">
                                {teamMembers?.map(member => {
                                    const isCurrentMember = currentMemberIds.includes(member.userId);
                                    const isSelected = selectedUsers.includes(member.userId);

                                    return (
                                        <div
                                            key={member.$id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                isCurrentMember
                                                    ? 'bg-muted opacity-60 cursor-not-allowed'
                                                    : 'hover:bg-accent cursor-pointer'
                                            }`}
                                            onClick={() => !isCurrentMember && handleToggleUser(member.userId)}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={member.prefs?.image} />
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{member.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {member.email}
                                                </p>
                                                {member.prefs?.position && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.prefs.position}
                                                    </p>
                                                )}
                                            </div>

                                            {isCurrentMember ? (
                                                <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">
                                                    {t('already-member')}
                                                </span>
                                            ) : (
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleToggleUser(member.userId)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedUsers([]);
                                    onOpenChange(false);
                                }}
                                disabled={isPending}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={handleAddMembers}
                                disabled={selectedUsers.length === 0 || isPending}
                            >
                                {t('add-members')} {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddWorkspaceMembersModal;
