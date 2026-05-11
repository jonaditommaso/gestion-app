'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Image from 'next/image'
import { CheckCircle2, ChevronRight, Loader2, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContainer } from '@/components/DialogContainer'
import { useAppContext } from '@/context/AppContext'
import { useGetTrelloAuthUrl } from '@/features/sells/api/use-get-trello-auth-url'
import { useGetTrelloBoards, type TrelloBoard } from '@/features/sells/api/use-get-trello-boards'
import { useGetTrelloLists, type TrelloList } from '@/features/sells/api/use-get-trello-lists'
import { useGetTrelloCards, type TrelloCard } from '@/features/sells/api/use-get-trello-cards'
import type { DealStage } from '@/features/sells/types'
import { cn } from '@/lib/utils'

interface TrelloImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetStage: DealStage
    onImport: (cards: TrelloCard[], stage: DealStage) => Promise<void>
}

type Step = 'auth' | 'waiting' | 'board' | 'list' | 'cards' | 'importing'

const TrelloImportDialog = ({ open, onOpenChange, targetStage, onImport }: TrelloImportDialogProps) => {
    const { currentUser: user } = useAppContext()
    const queryClient = useQueryClient()
    const t = useTranslations('sales')

    const hasTrelloToken = !!user?.prefs?.trello_token

    const [step, setStep] = useState<Step>('board')
    const [selectedBoard, setSelectedBoard] = useState<TrelloBoard | null>(null)
    const [selectedList, setSelectedList] = useState<TrelloList | null>(null)
    const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set())

    const authWindowRef = useRef<Window | null>(null)

    const { data: authUrlData } = useGetTrelloAuthUrl({
        enabled: open && (step === 'auth' || step === 'waiting') && !hasTrelloToken,
    })
    const { data: boards, isLoading: isLoadingBoards } = useGetTrelloBoards({ enabled: open && step === 'board' && hasTrelloToken })
    const { data: lists, isLoading: isLoadingLists } = useGetTrelloLists({ boardId: selectedBoard?.id ?? null })
    const { data: cards, isLoading: isLoadingCards } = useGetTrelloCards({ listId: selectedList?.id ?? null })

    // Init step on open
    useEffect(() => {
        if (open) {
            setStep(hasTrelloToken ? 'board' : 'auth')
            setSelectedBoard(null)
            setSelectedList(null)
            setSelectedCardIds(new Set())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Detect when OAuth window returns and token is saved
    useEffect(() => {
        if (!open) return
        if (hasTrelloToken && step === 'waiting') {
            setStep('board')
        }
    }, [hasTrelloToken, step, open])

    // Re-check user prefs on tab focus
    useEffect(() => {
        if (!open) return
        const handler = () => {
            if (document.visibilityState === 'visible') {
                queryClient.invalidateQueries({ queryKey: ['current'] })
            }
        }
        document.addEventListener('visibilitychange', handler)
        return () => document.removeEventListener('visibilitychange', handler)
    }, [open, queryClient])

    // Pre-select all cards when list is chosen
    useEffect(() => {
        if (cards && step === 'cards') {
            setSelectedCardIds(new Set(cards.map((c) => c.id)))
        }
    }, [cards, step])

    const handleConnect = () => {
        if (!authUrlData?.data) return
        setStep('waiting')
        authWindowRef.current = window.open(authUrlData.data, '_blank')
    }

    const handleSelectBoard = (board: TrelloBoard) => {
        setSelectedBoard(board)
        setSelectedList(null)
        setSelectedCardIds(new Set())
        setStep('list')
    }

    const handleSelectList = (list: TrelloList) => {
        setSelectedList(list)
        setStep('cards')
    }

    const handleToggleCard = (cardId: string) => {
        setSelectedCardIds((prev) => {
            const next = new Set(prev)
            if (next.has(cardId)) {
                next.delete(cardId)
            } else {
                next.add(cardId)
            }
            return next
        })
    }

    const handleToggleAll = () => {
        if (!cards) return
        if (selectedCardIds.size === cards.length) {
            setSelectedCardIds(new Set())
        } else {
            setSelectedCardIds(new Set(cards.map((c) => c.id)))
        }
    }

    const handleImport = async () => {
        if (!cards) return
        const toImport = cards.filter((c) => selectedCardIds.has(c.id))
        if (toImport.length === 0) return
        setStep('importing')
        try {
            await onImport(toImport, targetStage)
            toast.success(t('trello.import-success', { count: toImport.length }))
            onOpenChange(false)
        } catch {
            toast.error(t('trello.import-error'))
            setStep('cards')
        }
    }

    const handleDisconnect = async () => {
        await fetch('/api/sells/trello/disconnect', { method: 'DELETE' })
        await queryClient.invalidateQueries({ queryKey: ['current'] })
        setStep('auth')
    }

    const breadcrumb = [
        selectedBoard?.name,
        selectedList?.name,
    ].filter(Boolean)

    const renderContent = () => {
        // ── Auth ────────────────────────────────────────────────────────────────
        if (step === 'auth') {
            return (
                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">{t('trello.auth-description')}</p>
                    <Button className="w-full gap-2" onClick={handleConnect} disabled={!authUrlData?.data}>
                        {!authUrlData?.data
                            ? <Loader2 className="size-4 animate-spin" />
                            : <Image src="/integrations/trello.png" alt="Trello" width={16} height={16} />
                        }
                        {t('trello.connect-button')}
                    </Button>
                </div>
            )
        }

        // ── Waiting for OAuth ───────────────────────────────────────────────────
        if (step === 'waiting') {
            return (
                <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t('trello.waiting-description')}</p>
                    <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['current'] })}>
                        <RefreshCw className="mr-2 size-3.5" />
                        {t('trello.check-again')}
                    </Button>
                </div>
            )
        }

        // ── Board selection ─────────────────────────────────────────────────────
        if (step === 'board') {
            if (isLoadingBoards) {
                return (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )
            }
            return (
                <div className="space-y-1.5">
                    <p className="mb-3 text-sm text-muted-foreground">{t('trello.select-board')}</p>
                    {(boards ?? []).map((board) => (
                        <button
                            key={board.id}
                            type="button"
                            onClick={() => handleSelectBoard(board)}
                            className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                        >
                            <span className="font-medium">{board.name}</span>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                    ))}
                    {(boards ?? []).length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">{t('trello.no-boards')}</p>
                    )}
                </div>
            )
        }

        // ── List selection ──────────────────────────────────────────────────────
        if (step === 'list') {
            if (isLoadingLists) {
                return (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )
            }
            return (
                <div className="space-y-1.5">
                    <p className="mb-3 text-sm text-muted-foreground">{t('trello.select-list')}</p>
                    {(lists ?? []).map((list) => (
                        <button
                            key={list.id}
                            type="button"
                            onClick={() => handleSelectList(list)}
                            className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                        >
                            <span className="font-medium">{list.name}</span>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                    ))}
                    {(lists ?? []).length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">{t('trello.no-lists')}</p>
                    )}
                </div>
            )
        }

        // ── Card selection ──────────────────────────────────────────────────────
        if (step === 'cards' || step === 'importing') {
            if (isLoadingCards) {
                return (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )
            }
            const allSelected = (cards ?? []).length > 0 && selectedCardIds.size === (cards ?? []).length
            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                        <p className="text-sm text-muted-foreground">{t('trello.select-cards')}</p>
                        <button type="button" onClick={handleToggleAll} className="text-xs text-primary hover:underline">
                            {allSelected ? t('trello.deselect-all') : t('trello.select-all')}
                        </button>
                    </div>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                        {(cards ?? []).map((card) => (
                            <label
                                key={card.id}
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-accent",
                                    selectedCardIds.has(card.id) && "border-primary/40 bg-primary/5"
                                )}
                            >
                                <Checkbox
                                    checked={selectedCardIds.has(card.id)}
                                    onCheckedChange={() => handleToggleCard(card.id)}
                                    className="mt-0.5 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-snug">{card.name}</p>
                                    {card.desc && (
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{card.desc}</p>
                                    )}
                                    {card.due && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {t('trello.due')}: {card.due.slice(0, 10)}
                                        </p>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                    {(cards ?? []).length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">{t('trello.no-cards')}</p>
                    )}
                </div>
            )
        }
    }

    const canGoBack = step === 'list' || step === 'cards'
    const handleBack = () => {
        if (step === 'cards') setStep('list')
        else if (step === 'list') setStep('board')
    }

    const stepLabels: Record<Step, string> = {
        auth: t('trello.step-auth'),
        waiting: t('trello.step-waiting'),
        board: t('trello.step-board'),
        list: t('trello.step-list'),
        cards: t('trello.step-cards'),
        importing: t('trello.step-importing'),
    }

    return (
        <DialogContainer
            isOpen={open}
            setIsOpen={onOpenChange}
            title={t('trello.dialog-title')}
            description={
                breadcrumb.length > 0
                    ? breadcrumb.join(' › ')
                    : t('trello.dialog-subtitle', { stage: t(`stages.${targetStage}`) })
            }
        >
            <div className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {(['board', 'list', 'cards'] as Step[]).map((s, i) => (
                        <span key={s} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight className="size-3" />}
                            <span className={cn(step === s && "font-semibold text-foreground")}>
                                {stepLabels[s]}
                            </span>
                            {(step === 'cards' && s === 'board') || (step === 'cards' && s === 'list') || (step === 'list' && s === 'board')
                                ? <CheckCircle2 className="size-3 text-[hsl(var(--chart-2))]" />
                                : null
                            }
                        </span>
                    ))}
                </div>

                {renderContent()}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        {canGoBack && (
                            <Button variant="ghost" size="sm" onClick={handleBack}>
                                {t('trello.back')}
                            </Button>
                        )}
                        {hasTrelloToken && step === 'board' && (
                            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 hover:text-destructive" onClick={handleDisconnect}>
                                <X className="size-3.5" />
                                {t('trello.disconnect')}
                            </Button>
                        )}
                    </div>
                    {step === 'cards' && (
                        <Button
                            size="sm"
                            disabled={selectedCardIds.size === 0}
                            onClick={handleImport}
                            className="gap-2"
                        >
                            <Image src="/integrations/trello.png" alt="" width={14} height={14} />
                            {t('trello.import-button', { count: selectedCardIds.size })}
                        </Button>
                    )}
                    {step === 'importing' && (
                        <Button size="sm" disabled className="gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            {t('trello.importing')}
                        </Button>
                    )}
                </div>
            </div>
        </DialogContainer>
    )
}

export default TrelloImportDialog
