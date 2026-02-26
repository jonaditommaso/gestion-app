'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetMembers } from "../api/use-get-members";
import ManageMemberRow from "./ManageMemberRow";
import { useRemoveMember } from "../api/use-remove-member";
import { useConfirm } from "@/hooks/use-confirm";

type RoleFilter = 'ALL' | 'OWNER' | 'ADMIN' | 'MEMBER';

const ManageMembersModal = () => {
    const t = useTranslations('team');
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
    const [RemoveMemberConfirmDialog, confirmRemoveMember] = useConfirm(
        t('remove-member-confirm-title'),
        t('remove-member-confirm-description'),
        'destructive'
    );

    const { data, isLoading } = useGetMembers();
    const { mutate: removeMember, isPending } = useRemoveMember();

    const members = data?.members ?? [];

    const filteredMembers = members.filter(member => {
        const search = query.trim().toLowerCase();
        const matchesQuery = !search
            || member.name.toLowerCase().includes(search)
            || member.email.toLowerCase().includes(search)
            || member.prefs.position.toLowerCase().includes(search);

        const matchesRole =
            roleFilter === 'ALL'
            || (roleFilter === 'OWNER' && member.prefs.role === 'OWNER')
            || (roleFilter === 'ADMIN' && member.prefs.role === 'ADMIN')
            || (roleFilter === 'MEMBER' && (member.prefs.role === 'CREATOR' || member.prefs.role === 'VIEWER'));

        return matchesQuery && matchesRole;
    });

    const handleRemove = async (membershipId: string) => {
        const ok = await confirmRemoveMember();

        if (!ok) return;

        removeMember({ json: { membershipId } });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant='outline'>{t('manage-members')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>{t('manage-members-title')}</DialogTitle>
                    <DialogDescription>{t('manage-members-description')}</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3">
                    <Input
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder={t('search-members-placeholder')}
                    />
                    <Select value={roleFilter} onValueChange={(value: RoleFilter) => setRoleFilter(value)}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='ALL'>{t('all-roles')}</SelectItem>
                            <SelectItem value='OWNER'>Owner</SelectItem>
                            <SelectItem value='ADMIN'>Admin</SelectItem>
                            <SelectItem value='MEMBER'>Member</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-y-auto pr-1 space-y-2 min-h-[280px]">
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">{t('loading-members')}</p>
                    ) : filteredMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('no-members-found')}</p>
                    ) : (
                        filteredMembers.map(member => (
                            <ManageMemberRow
                                key={member.$id}
                                member={member}
                                isRemoving={isPending}
                                onRemove={handleRemove}
                            />
                        ))
                    )}
                </div>
            </DialogContent>

            <RemoveMemberConfirmDialog />
        </Dialog>
    );
};

export default ManageMembersModal;
