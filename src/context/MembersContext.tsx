'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';
import { useGetMembers } from '@/features/members/api/use-get-members';

interface MemberWithPhoto {
    $id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    photoUrl?: string;
}

interface MembersContextType {
    members: MemberWithPhoto[];
    isLoading: boolean;
    getMemberPhoto: (memberId: string) => string | undefined;
    getMemberByUserId: (userId: string) => MemberWithPhoto | undefined;
}

const MembersContext = createContext<MembersContextType | null>(null);

interface MembersProviderProps {
    children: ReactNode;
    workspaceId: string;
}

export const MembersProvider = ({ children, workspaceId }: MembersProviderProps) => {
    const { data: membersData, isLoading: isMembersLoading } = useGetMembers({ workspaceId });
    const [memberPhotos, setMemberPhotos] = useState<Record<string, string>>({});
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

    // Cargar fotos de todos los miembros
    useEffect(() => {
        const loadMemberPhotos = async () => {
            if (!membersData?.documents || membersData.documents.length === 0) return;

            setIsLoadingPhotos(true);
            const photos: Record<string, string> = {};

            await Promise.all(
                membersData.documents.map(async (member) => {
                    try {
                        const response = await fetch(`/api/settings/get-image/${member.userId}`);

                        if (response.ok) {
                            const contentType = response.headers.get('Content-Type') || 'image/jpeg';
                            const arrayBuffer = await response.arrayBuffer();
                            const blob = new Blob([arrayBuffer], { type: contentType });
                            photos[member.$id] = URL.createObjectURL(blob);
                        }
                    } catch (error) {
                        console.error(`Error loading photo for member ${member.$id}:`, error);
                    }
                })
            );

            setMemberPhotos(photos);
            setIsLoadingPhotos(false);
        };

        loadMemberPhotos();

        // Cleanup: revocar URLs cuando el componente se desmonte o cambien los miembros
        return () => {
            Object.values(memberPhotos).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [membersData?.documents]);

    const members = useMemo<MemberWithPhoto[]>(() => {
        if (!membersData?.documents) return [];

        return membersData.documents.map(member => ({
            $id: member.$id,
            userId: member.userId,
            name: member.name,
            email: member.email,
            role: member.role,
            photoUrl: memberPhotos[member.$id],
        }));
    }, [membersData?.documents, memberPhotos]);

    const getMemberPhoto = useCallback((memberId: string): string | undefined => {
        return memberPhotos[memberId];
    }, [memberPhotos]);

    const getMemberByUserId = useCallback((userId: string): MemberWithPhoto | undefined => {
        return members.find(m => m.userId === userId);
    }, [members]);

    const value = useMemo(() => ({
        members,
        isLoading: isMembersLoading || isLoadingPhotos,
        getMemberPhoto,
        getMemberByUserId,
    }), [members, isMembersLoading, isLoadingPhotos, getMemberPhoto, getMemberByUserId]);

    return (
        <MembersContext.Provider value={value}>
            {children}
        </MembersContext.Provider>
    );
};

export const useMembers = () => {
    const context = useContext(MembersContext);

    if (!context) {
        throw new Error('useMembers must be used within a MembersProvider');
    }

    return context;
};

// Hook opcional para usar fuera del provider (retorna valores por defecto)
export const useMembersSafe = () => {
    const context = useContext(MembersContext);

    return context ?? {
        members: [],
        isLoading: false,
        getMemberPhoto: () => undefined,
        getMemberByUserId: () => undefined,
    };
};
