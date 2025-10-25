'use client'

import { Button } from '../ui/button'
import { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface EditorButtonProps {
    icon: LucideIcon
    onClick: () => void
    translationKey: string
    isActive?: boolean
}

const EditorButton = ({ icon: Icon, onClick, translationKey, isActive = false }: EditorButtonProps) => {
    const t = useTranslations('workspaces')

    return (
        <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClick}
            className={cn(
                'h-8 w-8 p-0',
                isActive && 'bg-primary/20 dark:bg-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30'
            )}
            title={t(translationKey)}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}

export default EditorButton
