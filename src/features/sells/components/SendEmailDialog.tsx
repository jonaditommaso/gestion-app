'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, Loader2, Send } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DialogContainer } from '@/components/DialogContainer'
import { useAppContext } from '@/context/AppContext'
import { useGetGmailAuthUrl } from '@/features/sells/api/use-get-gmail-auth-url'
import { useSendGmail } from '@/features/sells/api/use-send-gmail'
import RichTextArea from '@/components/RichTextArea'

interface SendEmailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultTo?: string
    dealTitle?: string
    onEmailSent?: (subject: string, to: string) => void
}

type Phase = 'auth' | 'waiting' | 'granted' | 'compose'

const SendEmailDialog = ({ open, onOpenChange, defaultTo = '', dealTitle = '', onEmailSent }: SendEmailDialogProps) => {
    const { currentUser: user } = useAppContext()
    const queryClient = useQueryClient()
    const t = useTranslations('sales')
    const [phase, setPhase] = useState<Phase>('compose')
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')

    const hasGmailScope = user?.prefs?.google_gmail_scope === true
    const { mutateAsync: sendEmail, isPending: isSending } = useSendGmail()

    const { data: authUrlData } = useGetGmailAuthUrl({
        enabled: open && (phase === 'auth' || phase === 'waiting') && !hasGmailScope,
    })

    // Set initial phase when dialog opens
    useEffect(() => {
        if (open) {
            setPhase(hasGmailScope ? 'compose' : 'auth')
            setSubject('')
            setBody('')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Detect when OAuth tab returns and scope is granted
    useEffect(() => {
        if (!open) return
        if (hasGmailScope && (phase === 'auth' || phase === 'waiting')) {
            setPhase('granted')
        }
    }, [hasGmailScope, phase, open])

    // Listen for tab visibility change to re-check user prefs
    useEffect(() => {
        if (!open) return
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                queryClient.invalidateQueries({ queryKey: ['current'] })
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [open, queryClient])

    const handleAuthorize = () => {
        if (!authUrlData?.data) return
        setPhase('waiting')
        window.open(authUrlData.data, '_blank')
    }

    const handleGrantedContinue = () => {
        setPhase('compose')
    }

    const handleSend = async () => {
        if (!defaultTo.trim() || !subject.trim() || !body.trim()) return

        try {
            await sendEmail({ to: defaultTo.trim(), subject: subject.trim(), html: body })
            toast.success(t('email.sent-success'))
            onEmailSent?.(subject.trim(), defaultTo.trim())
            onOpenChange(false)
        } catch {
            toast.error(t('email.sent-error'))
        }
    }

    const renderContent = () => {
        if (phase === 'granted') {
            return (
                <div className="space-y-4">
                    <Alert variant="success">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>{t('email.gmail-permission-granted')}</AlertTitle>
                        <AlertDescription>{t('email.gmail-permission-granted-description')}</AlertDescription>
                    </Alert>
                    <Button onClick={handleGrantedContinue} className="w-full" size="sm">
                        {t('email.gmail-continue-compose')}
                    </Button>
                </div>
            )
        }

        if (phase === 'waiting') {
            return (
                <div className="rounded-lg border bg-muted/40 p-4 flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <p className="text-sm text-muted-foreground">{t('email.gmail-waiting-auth')}</p>
                </div>
            )
        }

        if (phase === 'auth') {
            return (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">{t('email.gmail-permission-description')}</p>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAuthorize}
                        disabled={!authUrlData?.data}
                        className="gap-2"
                    >
                        <Image src="/integrations/gmail.png" alt="Gmail" width={16} height={16} />
                        {t('email.gmail-authorize-button')}
                    </Button>
                </div>
            )
        }

        // compose phase
        return (
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label>{t('email.to')}</Label>
                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 h-9">
                        <span className="text-sm text-muted-foreground truncate">{defaultTo}</span>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email-subject">{t('email.subject')}</Label>
                    <Input
                        id="email-subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder={dealTitle ? `Re: ${dealTitle}` : t('email.subject-placeholder')}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>{t('email.body')}</Label>
                    <RichTextArea
                        value={body}
                        onChange={setBody}
                        placeholder={t('email.body-placeholder')}
                    />
                </div>
                <div className="flex justify-end pt-1 pb-3">
                    <Button
                            type="button"
                            size="sm"
                            onClick={handleSend}
                            disabled={isSending || !defaultTo.trim() || !subject.trim() || !body.trim()}
                            className="gap-2"
                        >
                            {isSending
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />
                            }
                            {t('email.send-button')}
                        </Button>
                </div>
            </div>
        )
    }

    return (
        <DialogContainer isOpen={open} setIsOpen={onOpenChange} title={t('email.dialog-title')}>
            {renderContent()}
        </DialogContainer>
    )
}

export default SendEmailDialog
