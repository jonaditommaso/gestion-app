'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import EditableText from "@/components/EditableText";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface WorkspaceInfoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspace: {
        $id: string;
        name: string;
        description?: string;
        $createdAt: string;
        $updatedAt: string;
    };
    members?: Array<{
        $id: string;
        userId: string;
        name: string;
        email: string;
        prefs?: {
            image?: string;
            position?: string;
        };
    }>;
}

const WorkspaceInfoModal = ({
    open,
    onOpenChange,
    workspace,
    members = []
}: WorkspaceInfoModalProps) => {
    const t = useTranslations('workspaces');
    const [description, setDescription] = useState(workspace.description || '');
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();

    useEffect(() => {
        setDescription(workspace.description || '');
        setHasChanges(false);
    }, [workspace.description, open]);

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        setHasChanges(value !== (workspace.description || ''));
        setIsEditing(true);
    };

    const handleSave = () => {
        if (hasChanges && description !== workspace.description) {
            updateWorkspace({
                json: { description },
                param: { workspaceId: workspace.$id }
            }, {
                onSuccess: () => {
                    setIsEditing(false);
                    setHasChanges(false);
                }
            });
        }
    };

    const handleCancel = () => {
        setDescription(workspace.description || '');
        setIsEditing(false);
        setHasChanges(false);
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
        <Dialog open={open} onOpenChange={(open) => {
            if (!open && hasChanges) {
                handleCancel();
            }
            onOpenChange(open);
        }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{workspace.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Description Section */}
                    <div>
                        <EditableText
                            value={description}
                            onSave={handleDescriptionChange}
                            placeholder={t('add-workspace-description')}
                            disabled={isPending}
                            size="md"
                            multiline
                            maxLength={2048}
                            className="min-h-[100px] w-full"
                            displayClassName="whitespace-pre-wrap"
                        />
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {description.length} / 2048
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Members Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="size-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                {t('members')} ({members.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {members.map(member => (
                                <div
                                    key={member.$id}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                                >
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={member.prefs?.image} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {member.email}
                                        </p>
                                        {member.prefs?.position && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {member.prefs.position}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Metadata Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            <span className="font-medium">{t('created')}:</span>
                            <span>{format(new Date(workspace.$createdAt), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            <span className="font-medium">{t('updated')}:</span>
                            <span>{format(new Date(workspace.$updatedAt), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                    </div>
                </div>

                {isEditing && hasChanges && (
                    <DialogFooter className="border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isPending || !hasChanges}
                        >
                            {t('save-changes')}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WorkspaceInfoModal;
