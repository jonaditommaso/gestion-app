'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useConfirm } from '@/hooks/use-confirm'
import {
    Mail,
    Send,
    Star,
    Search,
    Trash2,
    MailOpen,
    X,
    SlidersHorizontal,
    Pencil,
    Square,
    CheckSquare,
    CalendarIcon,
    Inbox,
    Mails,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DialogContainer } from '@/components/DialogContainer'
import { cn } from '@/lib/utils'
import FadeLoader from 'react-spinners/FadeLoader'
import { useGetMessages } from '../../api/use-get-messages'
import { useGetSentMessages } from '../../api/use-get-sent-messages'
import { useGetMembers } from '@/features/team/api/use-get-members'
import { useUpdateMessage } from '../../api/use-update-message'
import { Message } from './types'
import MessageRow from './MessageRow'
import CreateMessageModal from './CreateMessageModal'
import '@github/relative-time-element'

type Tab = 'all' | 'inbox' | 'sent' | 'featured'

const MessagesView = () => {
    const t = useTranslations('messages-view')
    const locale = useLocale()

    const { data: receivedData, isPending: loadingReceived } = useGetMessages()
    const { data: sentData, isPending: loadingSent } = useGetSentMessages()
    const { data: teamData } = useGetMembers()
    const { mutate: updateMessage } = useUpdateMessage()

    const [activeTab, setActiveTab] = useState<Tab>('inbox')
    const [search, setSearch] = useState('')
    const [filterUnread, setFilterUnread] = useState(false)
    const [filterPerson, setFilterPerson] = useState('all')
    const [dateFrom, setDateFrom] = useState<Date | undefined>()
    const [dateTo, setDateTo] = useState<Date | undefined>()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [openMessage, setOpenMessage] = useState<Message | null>(null)
    const [composeOpen, setComposeOpen] = useState(false)
    const [featuredOverrides, setFeaturedOverrides] = useState<Map<string, boolean>>(new Map())
    const [readOverrides, setReadOverrides] = useState<Map<string, boolean>>(new Map())
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
    const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set())

    const [DeleteDialog, confirmDelete] = useConfirm(
        t('delete-title'),
        t('delete-message'),
        'destructive'
    )

    const senderMap = useMemo(() => {
        const map = new Map<string, string>()
        for (const m of teamData?.members ?? []) {
            const name = m.name || m.userName || m.userEmail
            if (m.appwriteMembershipId) map.set(m.appwriteMembershipId, name)
            map.set(m.$id, name)
        }
        return map
    }, [teamData?.members])

    const allReceived: Message[] = useMemo(
        () => (receivedData?.documents ?? []) as unknown as Message[],
        [receivedData?.documents]
    )

    const allSent: Message[] = useMemo(
        () => (sentData?.documents ?? []) as unknown as Message[],
        [sentData?.documents]
    )

    useEffect(() => {
        setFeaturedOverrides(prev => {
            if (prev.size === 0) return prev
            const next = new Map(prev)
            const byId = new Map<string, Message>([...allReceived, ...allSent].map(message => [message.$id, message]))

            for (const [id, override] of prev.entries()) {
                const message = byId.get(id)
                if (!message || (message.featured ?? false) === override) {
                    next.delete(id)
                }
            }

            return next
        })
    }, [allReceived, allSent])

    useEffect(() => {
        setReadOverrides(prev => {
            if (prev.size === 0) return prev
            const next = new Map(prev)
            const byId = new Map<string, Message>([...allReceived, ...allSent].map(message => [message.$id, message]))

            for (const [id, override] of prev.entries()) {
                const message = byId.get(id)
                if (!message || message.read === override) {
                    next.delete(id)
                }
            }

            return next
        })
    }, [allReceived, allSent])

    const sentIds = useMemo(
        () => new Set(allSent.map(m => m.$id)),
        [allSent]
    )

    const messages = useMemo(() => {
        let list: Message[] = []

        if (activeTab === 'inbox') {
            list = allReceived.filter(m => !m.deletedByRecipient)
        } else if (activeTab === 'sent') {
            list = allSent.filter(m => !m.deletedBySender)
        } else if (activeTab === 'featured') {
            const receivedFeatured = allReceived.filter(m => m.featured && !m.deletedByRecipient)
            const sentFeatured = allSent.filter(m => m.featured && !m.deletedBySender)
            const merged = [...receivedFeatured, ...sentFeatured]
            merged.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
            list = merged
        } else {
            const seenIds = new Set<string>()
            const combined: Message[] = []
            for (const m of allReceived) {
                if (!m.deletedByRecipient) { seenIds.add(m.$id); combined.push(m) }
            }
            for (const m of allSent) {
                if (!seenIds.has(m.$id) && !m.deletedBySender) combined.push(m)
            }
            combined.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
            list = combined
        }

        if (filterUnread && activeTab !== 'sent') {
            list = list.filter(m => {
                const readValue = readOverrides.has(m.$id)
                    ? readOverrides.get(m.$id)!
                    : m.read

                return !readValue
            })
        }

        if (filterPerson !== 'all') {
            if (activeTab === 'inbox') {
                list = list.filter(m => m.fromTeamMemberId === filterPerson)
            } else if (activeTab === 'sent') {
                list = list.filter(m => m.toTeamMemberId === filterPerson)
            }
        }

        if (dateFrom) {
            const from = new Date(dateFrom)
            from.setHours(0, 0, 0, 0)
            list = list.filter(m => new Date(m.$createdAt) >= from)
        }

        if (dateTo) {
            const to = new Date(dateTo)
            to.setHours(23, 59, 59, 999)
            list = list.filter(m => new Date(m.$createdAt) <= to)
        }

        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(m =>
                m.subject?.toLowerCase().includes(q) ||
                m.content.toLowerCase().includes(q)
            )
        }

        return list
    }, [activeTab, allReceived, allSent, filterUnread, filterPerson, dateFrom, dateTo, search, readOverrides])

    const unreadCount = useMemo(
        () => allReceived.filter(m => !m.read && !m.deletedByRecipient).length,
        [allReceived]
    )

    const isLoading = loadingReceived || loadingSent

    const allSelected = messages.length > 0 && selectedIds.size === messages.length
    const someSelected = selectedIds.size > 0

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(messages.map(m => m.$id)))
        }
    }

    const handleFeature = (id: string, featured: boolean) => {
        setFeaturedOverrides(prev => new Map(prev).set(id, featured))
        updateMessage(
            { param: { messageId: id }, json: { featured } },
            {
                onSuccess: () => {
                    return
                },
                onError: () => {
                    setFeaturedOverrides(prev => { const next = new Map(prev); next.delete(id); return next })
                }
            }
        )
    }

    const handleMarkRead = (id: string) => {
        setReadOverrides(prev => new Map(prev).set(id, true))
        setMarkingReadIds(prev => new Set(prev).add(id))

        updateMessage(
            { param: { messageId: id }, json: { read: true } },
            {
                onSuccess: () => {
                    setMarkingReadIds(prev => { const next = new Set(prev); next.delete(id); return next })
                },
                onError: () => {
                    setMarkingReadIds(prev => { const next = new Set(prev); next.delete(id); return next })
                    setReadOverrides(prev => { const next = new Map(prev); next.delete(id); return next })
                }
            }
        )
    }

    const handleDelete = async (id: string) => {
        const ok = await confirmDelete()
        if (!ok) return

        setDeletingIds(prev => new Set(prev).add(id))
        const isSentOnly = sentIds.has(id) && !allReceived.some(m => m.$id === id)
        updateMessage(
            { param: { messageId: id }, json: isSentOnly ? { deletedBySender: true } : { deletedByRecipient: true } },
            {
                onSuccess: () => {
                    setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next })
                    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
                },
                onError: () => {
                    setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next })
                }
            }
        )
    }

    const handleBulkDelete = async () => {
        const ok = await confirmDelete()
        if (!ok) return

        const ids = Array.from(selectedIds)
        setSelectedIds(new Set())
        ids.forEach(id => {
            setDeletingIds(prev => new Set(prev).add(id))
            const isSentOnly = sentIds.has(id) && !allReceived.some(m => m.$id === id)
            updateMessage(
                { param: { messageId: id }, json: isSentOnly ? { deletedBySender: true } : { deletedByRecipient: true } },
                {
                    onSuccess: () => {
                        setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next })
                    },
                    onError: () => {
                        setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next })
                    }
                }
            )
        })
    }

    const handleBulkMarkRead = () => {
        Array.from(selectedIds).forEach(id => {
            if (!sentIds.has(id) || allReceived.some(m => m.$id === id)) {
                handleMarkRead(id)
            }
        })
        setSelectedIds(new Set())
    }

    const handleOpenMessage = (message: Message) => {
        setOpenMessage(message)
        const isReceivedMsg = allReceived.some(m => m.$id === message.$id)
        const readValue = readOverrides.has(message.$id)
            ? readOverrides.get(message.$id)!
            : message.read

        if (!readValue && isReceivedMsg) {
            handleMarkRead(message.$id)
        }
    }

    const peopleOptions = useMemo(() => {
        const ids = new Set<string>()
        if (activeTab === 'inbox' || activeTab === 'all') {
            allReceived.filter(m => !m.deletedByRecipient).forEach(m => ids.add(m.fromTeamMemberId))
        }
        if (activeTab === 'sent' || activeTab === 'all') {
            allSent.filter(m => !m.deletedBySender).forEach(m => ids.add(m.toTeamMemberId))
        }
        return Array.from(ids).map(id => ({ id, name: senderMap.get(id) || t('unknown') }))
    }, [activeTab, allReceived, allSent, senderMap, t])

    const hasDateFilter = dateFrom !== undefined || dateTo !== undefined

    const clearDateFilter = () => {
        setDateFrom(undefined)
        setDateTo(undefined)
    }

    const changeTab = (tab: Tab) => {
        setActiveTab(tab)
        setSelectedIds(new Set())
        setSearch('')
        setFilterUnread(false)
        setFilterPerson('all')
        clearDateFilter()
    }

    const openMessageIsSent = openMessage
        ? sentIds.has(openMessage.$id) && !allReceived.some(m => m.$id === openMessage.$id)
        : false
    const openMessagePersonId = openMessage
        ? (openMessageIsSent ? openMessage.toTeamMemberId : openMessage.fromTeamMemberId)
        : ''
    const openMessagePersonName = senderMap.get(openMessagePersonId) || t('unknown')

    const tabs = [
        { tab: 'all' as Tab, icon: Mails, label: t('all'), count: undefined as number | undefined },
        { tab: 'inbox' as Tab, icon: Inbox, label: t('inbox'), count: unreadCount || undefined },
        { tab: 'sent' as Tab, icon: Send, label: t('sent'), count: undefined as number | undefined },
        { tab: 'featured' as Tab, icon: Star, label: t('featured'), count: undefined as number | undefined },
    ]

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Top bar: tabs + compose button */}
            <div className="flex items-center justify-between px-6 pt-4 pb-0 border-b gap-4 flex-wrap shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        size="sm"
                        className="mb-1 gap-1.5"
                        onClick={() => setComposeOpen(true)}
                    >
                        <Pencil size={14} />
                        {t('compose')}
                    </Button>

                    <div className="flex items-center gap-1">
                    {tabs.map(({ tab, icon: Icon, label, count }) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => changeTab(tab)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md border-b-2 transition-colors',
                                activeTab === tab
                                    ? 'border-primary text-primary font-medium'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                            )}
                        >
                            <Icon size={14} />
                            {label}
                            {!!count && (
                                <Badge variant="default" className="h-4 px-1 text-[10px] min-w-[16px]">
                                    {count}
                                </Badge>
                            )}
                        </button>
                    ))}
                    </div>
                </div>

                <div className="text-xs text-muted-foreground mb-1 whitespace-nowrap">
                    {t('page')} 1 · {messages.length} {t('messages-count')}
                </div>
            </div>

            {/* Toolbar: filters */}
            <div className="flex items-center gap-2 px-4 py-2 border-b flex-wrap shrink-0 bg-sidebar-accent/30">
                <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="p-1 rounded hover:bg-accent shrink-0"
                    aria-label={t('select-all')}
                >
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                {someSelected ? (
                    <>
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.size} {t('selected')}
                        </span>
                        {activeTab !== 'sent' && (
                            <Button size="sm" variant="ghost" onClick={handleBulkMarkRead} className="h-7">
                                <MailOpen size={13} className="mr-1" />
                                {t('mark-read')}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleBulkDelete}
                            className="h-7 text-destructive hover:text-destructive"
                        >
                            <Trash2 size={13} className="mr-1" />
                            {t('delete')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="h-7 px-2">
                            <X size={13} />
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t('search')}
                                className="pl-7 h-7 w-52 text-xs"
                            />
                        </div>

                        {activeTab !== 'sent' && (
                            <Button
                                size="sm"
                                variant={filterUnread ? 'default' : 'outline'}
                                onClick={() => setFilterUnread(p => !p)}
                                className="h-7 text-xs"
                            >
                                {t('unread')}
                            </Button>
                        )}

                        {peopleOptions.length > 0 && (
                            <Select value={filterPerson} onValueChange={setFilterPerson}>
                                <SelectTrigger className="h-7 w-40 text-xs">
                                    <SlidersHorizontal size={12} className="mr-1 shrink-0" />
                                    <SelectValue placeholder={t('filter-from')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('everyone')}</SelectItem>
                                    {peopleOptions.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={dateFrom ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                >
                                    <CalendarIcon size={12} />
                                    {dateFrom
                                        ? dateFrom.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
                                        : t('date-from')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={dateTo ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                >
                                    <CalendarIcon size={12} />
                                    {dateTo
                                        ? dateTo.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
                                        : t('date-to')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                            </PopoverContent>
                        </Popover>

                        {hasDateFilter && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearDateFilter}
                                className="h-7 px-2 text-xs text-muted-foreground"
                            >
                                <X size={12} className="mr-1" />
                                {t('clear-dates')}
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center mt-16">
                        <FadeLoader color="#999" width={3} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-muted-foreground">
                        <Mail size={44} className="mb-3 opacity-20" />
                        <p className="text-sm">{t(`empty-${activeTab}`)}</p>
                    </div>
                ) : (
                    <div>
                        {messages.map(message => {
                            const isSentMsg =
                                activeTab === 'sent' ||
                                (activeTab !== 'inbox' &&
                                    sentIds.has(message.$id) &&
                                    !allReceived.some(m => m.$id === message.$id))

                            const featuredValue = featuredOverrides.has(message.$id)
                                ? featuredOverrides.get(message.$id)!
                                : (message.featured ?? false)

                            const readValue = readOverrides.has(message.$id)
                                ? readOverrides.get(message.$id)!
                                : message.read

                            return (
                                <MessageRow
                                    key={message.$id}
                                    message={message}
                                    isSent={isSentMsg}
                                    senderMap={senderMap}
                                    selected={selectedIds.has(message.$id)}
                                    onSelect={toggleSelect}
                                    onOpen={handleOpenMessage}
                                    onFeature={handleFeature}
                                    onDelete={handleDelete}
                                    locale={locale}
                                    unknownLabel={t('unknown')}
                                    isDeleting={deletingIds.has(message.$id)}
                                    featuredValue={featuredValue}
                                    isRead={readValue}
                                    isMarkingRead={markingReadIds.has(message.$id)}
                                    onMarkRead={handleMarkRead}
                                />
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Message detail dialog */}
            <DialogContainer
                title={openMessage?.subject?.trim() || t('no-subject')}
                description={
                    openMessage
                        ? `${openMessageIsSent ? t('to') : t('from')}: ${openMessagePersonName}`
                        : ''
                }
                isOpen={Boolean(openMessage)}
                setIsOpen={(open: boolean) => { if (!open) setOpenMessage(null) }}
            >
                {openMessage && (
                    <div className="space-y-3">
                        <p className="text-sm whitespace-pre-wrap">{openMessage.content}</p>
                        <relative-time
                            lang={locale}
                            datetime={openMessage.$createdAt}
                            className="text-muted-foreground text-xs block"
                        />
                    </div>
                )}
            </DialogContainer>

            <CreateMessageModal isOpen={composeOpen} setIsOpen={setComposeOpen} />
            <DeleteDialog />
        </div>
    )
}

export default MessagesView
