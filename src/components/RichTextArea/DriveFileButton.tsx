'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, Loader2 } from 'lucide-react'
import { MdAddToDrive } from 'react-icons/md'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { DialogContainer } from '@/components/DialogContainer'
import { useAppContext } from '@/context/AppContext'
import { useGetDriveAuthUrl } from '@/features/home/api/use-get-drive-auth-url'
import Image from 'next/image'

interface GooglePickerDoc {
    id: string
    name: string
    mimeType: string
}

interface GooglePickerResponse {
    action: string
    docs?: GooglePickerDoc[]
}

interface GooglePickerInstance {
    setVisible: (visible: boolean) => void
}

interface GooglePickerBuilder {
    addView(view: object): GooglePickerBuilder
    setOAuthToken(token: string): GooglePickerBuilder
    setDeveloperKey(key: string): GooglePickerBuilder
    setCallback(cb: (response: GooglePickerResponse) => void): GooglePickerBuilder
    build(): GooglePickerInstance
}

interface GooglePickerStatic {
    PickerBuilder: new () => GooglePickerBuilder
    DocsView: new () => object
    Action: { PICKED: string; CANCEL: string }
}

interface GapiStatic {
    load: (api: string, callback: () => void) => void
}

declare global {
    interface Window {
        gapi?: GapiStatic
    }
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ''

interface DriveFileButtonProps {
    onInsert: (url: string, name: string, isImage: boolean) => void
}

const DriveFileButton = ({ onInsert }: DriveFileButtonProps) => {
    const { currentUser: user } = useAppContext()
    const queryClient = useQueryClient()
    const t = useTranslations('workspaces')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [phase, setPhase] = useState<'auth' | 'reconnect' | 'waiting' | 'granted'>('auth')
    const [isOpening, setIsOpening] = useState(false)
    const [isRevoking, setIsRevoking] = useState(false)

    const hasDriveScope = user?.prefs?.google_drive_scope === true

    const { data: authUrlData } = useGetDriveAuthUrl({
        enabled: dialogOpen && phase === 'auth' && !hasDriveScope,
    })

    // When user returns from OAuth tab and scope is granted
    useEffect(() => {
        if (!dialogOpen) return
        if (hasDriveScope && (phase === 'auth' || phase === 'waiting')) {
            setPhase('granted')
        }
    }, [hasDriveScope, phase, dialogOpen])

    useEffect(() => {
        if (!dialogOpen) return

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                queryClient.invalidateQueries({ queryKey: ['current'] })
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [dialogOpen, queryClient])

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open)
        if (!open) setPhase('auth')
    }

    const handleAuthorize = () => {
        if (!authUrlData?.data) return
        window.open(authUrlData.data, '_blank')
    }

    const handleReconnect = async () => {
        setIsRevoking(true)
        try {
            await fetch('/api/drive-revoke', { method: 'DELETE' })
            const authRes = await fetch('/api/drive-auth-url')
            const { data: authUrl } = await authRes.json() as { data: string }
            setPhase('waiting')
            window.open(authUrl, '_blank')
        } finally {
            setIsRevoking(false)
        }
    }

    const loadPickerApi = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            const tryLoad = () => {
                window.gapi!.load('picker', () => resolve())
            }
            if (window.gapi) {
                tryLoad()
                return
            }
            const script = document.createElement('script')
            script.src = 'https://apis.google.com/js/api.js'
            script.async = true
            script.onload = () => tryLoad()
            script.onerror = () => reject(new Error('Failed to load Google API'))
            document.body.appendChild(script)
        })
    }, [])

    const fetchImageAsDataUrl = useCallback(async (fileId: string): Promise<string | null> => {
        try {
            const res = await fetch(`/api/drive-file?fileId=${fileId}`)
            if (!res.ok) return null
            const blob = await res.blob()
            return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        } catch {
            return null
        }
    }, [])

    const openPicker = useCallback(async () => {
        setIsOpening(true)
        try {
            const res = await fetch('/api/drive-access-token')
            if (!res.ok) throw new Error('Failed to get access token')
            const { data: token } = await res.json() as { data: string }

            await loadPickerApi()

            const pickerNs = (window as Window & { google?: { picker?: GooglePickerStatic } }).google?.picker
            if (!pickerNs) throw new Error('Google Picker not available')

            const picker = new pickerNs.PickerBuilder()
                .addView(new pickerNs.DocsView())
                .setOAuthToken(token)
                .setDeveloperKey(GOOGLE_API_KEY)
                .setCallback((data: GooglePickerResponse) => {
                    if (data.action !== pickerNs.Action.PICKED || !data.docs?.[0]) return
                    const doc = data.docs[0]
                    const isImage = doc.mimeType.startsWith('image/')

                    if (!isImage) {
                        onInsert(`https://drive.google.com/file/d/${doc.id}/view`, doc.name, false)
                        return
                    }

                    setIsOpening(true)
                    fetchImageAsDataUrl(doc.id).then((dataUrl) => {
                        if (dataUrl) {
                            onInsert(dataUrl, doc.name, true)
                        } else {
                            setPhase('reconnect')
                            setDialogOpen(true)
                        }
                    }).finally(() => setIsOpening(false))
                })
                .build()

            picker.setVisible(true)
        } catch (error) {
            console.error('Failed to open Drive picker:', error)
        } finally {
            setIsOpening(false)
        }
    }, [loadPickerApi, onInsert, fetchImageAsDataUrl])

    const handleGrantedContinue = () => {
        handleDialogChange(false)
        setTimeout(() => openPicker(), 100)
    }

    const handleClick = () => {
        if (!hasDriveScope) {
            setPhase('auth')
            setDialogOpen(true)
            return
        }
        openPicker()
    }

    return (
        <>
            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClick}
                className="h-8 w-8 p-0"
                title={t('drive')}
                disabled={isOpening}
            >
                {isOpening
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <MdAddToDrive className="h-4 w-4" />
                }
            </Button>

            <DialogContainer isOpen={dialogOpen} setIsOpen={handleDialogChange} title={t('drive-permission-title')}>
                {phase === 'granted' ? (
                    <div className="space-y-4">
                        <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>{t('drive-permission-granted')}</AlertTitle>
                            <AlertDescription>{t('drive-permission-granted-description')}</AlertDescription>
                        </Alert>
                        <Button onClick={handleGrantedContinue} className="w-full" size="sm">
                            {t('drive-open-picker')}
                        </Button>
                    </div>
                ) : phase === 'waiting' ? (
                    <div className="rounded-lg border bg-muted/40 p-4 flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <p className="text-sm text-muted-foreground">{t('drive-waiting-auth')}</p>
                    </div>
                ) : phase === 'reconnect' ? (
                    <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                        <p className="text-sm text-muted-foreground">{t('drive-reconnect-description')}</p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleReconnect}
                            disabled={isRevoking}
                            className="gap-2"
                        >
                            {isRevoking
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Image src="/integrations/drive.png" alt="Google Drive" width={16} height={16} />
                            }
                            {t('drive-reconnect-button')}
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-muted/40 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium text-sm">{t('drive-permission-description')}</span>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAuthorize}
                            disabled={!authUrlData?.data}
                            className="gap-2"
                        >
                            <Image src="/integrations/drive.png" alt="Google Drive" width={16} height={16} />
                            {t('drive-authorize-button')}
                        </Button>
                    </div>
                )}
            </DialogContainer>
        </>
    )
}

export default DriveFileButton
