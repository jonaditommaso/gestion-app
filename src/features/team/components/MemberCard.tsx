'use client'
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrent } from "@/features/auth/api/use-current";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { format } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { Cake, Linkedin, MessageSquareText, Pencil } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import EditMemberModal from "./EditMemberModal";
import SendDirectMessageModal from "./SendDirectMessageModal";
import TagsMember from "./TagsMember";

const localeMap = { es, en: enUS, it };

interface MemberCardProps {
    memberId: string,
    name: string,
    email: string,
    position: string,
    tags: string[],
    userId: string,
    image: string,
    role: 'SUPERADMIN' | 'ADMIN' | 'CREATOR',
    birthday: string,
    description?: string,
    linkedin?: string,
    memberSince?: string,
    currentProject?: string,
}

const ImageMock = ({ name }: { name: string }) => (
    <div className="w-full h-[300px] bg-slate-200 rounded-md rounded-b-none text-6xl text-neutral-500 flex items-center justify-center">
        {name.charAt(0).toUpperCase()}
    </div>
)

const MemberCard = ({ memberId, name, email, position, tags = [], userId, image, birthday, description, linkedin, memberSince, currentProject }: MemberCardProps) => {
    const { imageUrl, isPending } = useProfilePicture(userId, !!image);
    const { data: currentUser } = useCurrent();
    const t = useTranslations('team');
    const locale = useLocale() as keyof typeof localeMap;
    const dateLocale = localeMap[locale] ?? enUS;
    const [editOpen, setEditOpen] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);

    const isCurrentUser = !!currentUser && currentUser.$id === userId;
    const hasPhoto = !!imageUrl && !isPending;
    const company: string = (currentUser?.prefs?.company as string) ?? '';

    const sinceData = memberSince
        ? (() => {
            const [y, m] = memberSince.split('-').map(Number);
            if (!y || !m) return null;
            const monthYear = format(new Date(y, m - 1, 1), 'MMM yyyy', { locale: dateLocale });
            const now = new Date();
            const totalMonths = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;
            const parts: string[] = [];
            if (years > 0) parts.push(`${years} ${t('years')}`);
            if (months > 0) parts.push(`${months} ${t('months-label')}`);
            const duration = parts.join(', ');
            return { monthYear, duration };
        })()
        : null;

    const birthdayFormatted = birthday
        ? (() => {
            const [y, m, d] = birthday.split('-').map(Number);
            return format(new Date(y, m - 1, d), 'dd MMM', { locale: dateLocale });
        })()
        : null;

    return (
        <>
            <div className="relative group w-[300px]">
                <Card className="w-[300px] bg-sidebar overflow-hidden h-full">
                    <div className="relative w-full h-[300px]">
                        {!image && !isPending && <ImageMock name={name} />}
                        {isPending
                            ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <FadeLoader color="#999" width={3} />
                                </div>
                            )
                            : imageUrl
                                ? <Image
                                    src={imageUrl}
                                    alt={`profile member ${name} picture`}
                                    className="object-cover w-full h-[300px] rounded-t-md"
                                    height={300}
                                    width={300}
                                />
                                : null
                        }
                        {hasPhoto && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent rounded-t-md" />
                                {position && (
                                    <div className="absolute bottom-3 left-0 right-0 px-3 text-center z-10">
                                        <span className="text-white text-base font-semibold drop-shadow">{position}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <CardContent className="flex flex-col gap-3 px-3 pt-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-col items-center">
                                <p className="text-lg font-medium">{name}</p>
                                <p className="text-xs text-muted-foreground">{email}</p>
                            </div>
                            {description && (
                                <p className="text-xs font-medium italic text-muted-foreground text-center text-balance">{description}</p>
                            )}
                            <Separator />
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                {sinceData && (
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        {company
                                            ? <>{t('in-company-since', { company })} <span className="font-medium">{sinceData.monthYear}</span></>
                                            : <>{t('member-since')} <span className="font-semibold">{sinceData.monthYear}</span></>
                                        }
                                        <br />
                                        {sinceData.duration && (
                                            <span className="text-muted-foreground/60"> ({sinceData.duration})</span>
                                        )}
                                    </p>
                                )}
                                {currentProject && (
                                    <span className="inline-block self-start text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 truncate max-w-full">
                                        {currentProject}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                                {linkedin && (
                                    <a
                                        href={linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-1.5 transition-colors"
                                    >
                                        <Linkedin className="size-4 text-blue-600" />
                                    </a>
                                )}
                                {birthdayFormatted && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="cursor-default bg-transparent hover:bg-secondary rounded-full p-1.5 transition-colors">
                                                    <Cake className="size-4 text-pink-500" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {birthdayFormatted}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {!isCurrentUser && (
                                    <div
                                        className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-1.5 transition-colors"
                                        onClick={() => setMessageOpen(true)}
                                    >
                                        <MessageSquareText className="size-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pb-4 pt-1">
                        <TagsMember tags={tags} />
                    </CardFooter>
                </Card>

                {isCurrentUser && (
                    <>
                        <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-all duration-200 pointer-events-none" />
                        <button
                            onClick={() => setEditOpen(true)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/70 cursor-pointer"
                            aria-label={t('edit-profile')}
                        >
                            <Pencil className="size-4 text-white" />
                        </button>
                    </>
                )}
            </div>

            {isCurrentUser && (
                <EditMemberModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    initialPosition={position ?? ''}
                    initialDescription={description ?? ''}
                    initialLinkedin={linkedin ?? ''}
                    initialBirthday={birthday ?? ''}
                    initialTags={tags.filter(tag => tag.trim() !== '')}
                    initialMemberSince={memberSince ?? ''}
                    initialCurrentProject={currentProject ?? ''}
                />
            )}

            {!isCurrentUser && (
                <SendDirectMessageModal
                    isOpen={messageOpen}
                    setIsOpen={setMessageOpen}
                    recipientId={memberId}
                    recipientName={name}
                />
            )}
        </>
    );
}

export default MemberCard;
