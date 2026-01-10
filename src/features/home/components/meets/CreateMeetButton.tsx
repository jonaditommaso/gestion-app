'use client'
import { Button } from "@/components/ui/button";
import { Headset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { cn } from "@/lib/utils";
import { TooltipContainer } from "@/components/TooltipContainer";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const CreateMeetModal = dynamic(() => import('./CreateMeetModal'), {
    loading: () => <></>,
})

const CreateMeetButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: team } = useGetMembers();
    const t = useTranslations('home');

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const meet = searchParams.get('meet');

        if (meet === 'success') {
            toast.success(t('meeting-created-successfully'));

            // Clean URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete('meet');
            router.replace('/', { scroll: false });
        }
    }, []);

    const actionDisabled = useMemo(() => (team || []).length < 2, [team]);

    const handleOpen = () => {
        if (actionDisabled) return;
        setIsOpen(true)
    }

    const Trigger = (
        <Button
            className={cn("w-full py-11 h-auto", actionDisabled ? 'opacity-50 cursor-default hover:bg-transparent' : '')}
            variant='outline'
            onClick={handleOpen}
        >
            <Headset /> <span>{t('set-up-metting')}</span>
        </Button>
    )

    return (
        <>
            <CreateMeetModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                team={team}
            />
            {actionDisabled
                ? (
                    <TooltipContainer tooltipText={t('no-team-members')}>
                        {Trigger}
                    </TooltipContainer>
                )
                : (
                    <div>
                        {Trigger}
                    </div>
                )
            }
        </>
    );
}

export default CreateMeetButton;