'use client'

import { Button } from "@/components/ui/button";
import { useGetSessions } from "@/features/auth/api/use-get-sessions";
import { useCloseAllSessions } from "@/features/auth/api/use-close-all-sessions";
import { useTranslations } from "next-intl";

const Sessions = () => {
    const t = useTranslations('settings');
    const { data: sessions = [], isLoading } = useGetSessions();
    const { mutate: closeAllSessions, isPending } = useCloseAllSessions();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <h2>{t('active-sessions')}</h2>
                <Button
                    variant="outline"
                    onClick={() => closeAllSessions()}
                    disabled={isPending || isLoading || sessions.length === 0}
                >
                    {t('close-all-sessions')}
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                {isLoading && <p className="text-sm text-muted-foreground">{t('loading-sessions')}</p>}

                {!isLoading && sessions.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('no-active-sessions')}</p>
                )}

                {!isLoading && sessions.map((session) => (
                    <div key={session.$id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {session.clientName || t('unknown-device')} · {session.osName || t('unknown-os')}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {session.countryName || t('unknown-location')} · {session.clientType}
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {session.current ? t('this-device') : t('active')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sessions;
