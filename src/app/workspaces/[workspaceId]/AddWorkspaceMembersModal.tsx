'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import FadeLoader from "react-spinners/FadeLoader";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddWorkspaceMembersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    currentMembers?: string[]; // Array de userIds que ya son miembros
}

const AddWorkspaceMembersModal = ({
    open,
    onOpenChange,
    workspaceId,
    currentMembers = []
}: AddWorkspaceMembersModalProps) => {
    const { data: teamMembers, isLoading } = useGetMembers();
    const t = useTranslations('workspaces');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAddMembers = () => {
        // TODO: Implementar la lógica para agregar miembros al workspace
        console.log('Adding members to workspace:', workspaceId, selectedUsers);
        setSelectedUsers([]);
        onOpenChange(false);
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

                {isLoading ? (
                    <div className="w-full flex justify-center py-8">
                        <FadeLoader color="#999" width={3} />
                    </div>
                ) : (
                    <>
                        <ScrollArea className="max-h-[400px] pr-4">
                            <div className="space-y-2">
                                {teamMembers?.map(member => {
                                    const isCurrentMember = currentMembers.includes(member.userId);
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
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={handleAddMembers}
                                disabled={selectedUsers.length === 0}
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
