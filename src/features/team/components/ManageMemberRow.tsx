'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TeamMember } from "../api/use-get-members";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

type ManageMemberRowProps = {
    member: TeamMember;
    isRemoving: boolean;
    onRemove: (membershipId: string) => void;
};

const getRoleLabel = (role: TeamMember['prefs']['role']) => {
    if (role === 'OWNER') return 'Owner';
    if (role === 'ADMIN') return 'Admin';
    return 'Member';
};

const ManageMemberRow = ({ member, isRemoving, onRemove }: ManageMemberRowProps) => {
    const t = useTranslations('team');
    const { imageUrl } = useProfilePicture(member.userId, !!member.prefs.image);

    return (
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border rounded-lg p-3">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-12 rounded-md">
                    <AvatarImage src={imageUrl ?? undefined} alt={member.name} className="object-cover" />
                    <AvatarFallback className="rounded-md">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    {member.prefs.position && (
                        <p className="text-xs text-muted-foreground truncate">{member.prefs.position}</p>
                    )}
                </div>
            </div>

            <p className="text-xs text-muted-foreground">{getRoleLabel(member.prefs.role)}</p>

            {member.prefs.role !== 'OWNER' ? (
                <Button
                    variant='outline'
                    size='sm'
                    disabled={isRemoving}
                    onClick={() => onRemove(member.$id)}
                    className="gap-2"
                >
                    <Trash2 className="size-4" />
                    {t('remove-member')}
                </Button>
            ) : (
                <span className="text-xs text-muted-foreground">—</span>
            )}
        </div>
    );
};

export default ManageMemberRow;
