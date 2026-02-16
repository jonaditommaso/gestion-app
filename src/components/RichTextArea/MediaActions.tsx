'use client'

import { Image as ImageIcon, Minus } from 'lucide-react'
import EditorButton from './EditorButton'
import { ReactNode } from 'react'

interface MediaActionsProps {
    linkComponent: ReactNode
    mentionComponent: ReactNode
    onImage: () => void
    onDivider: () => void
}

const MediaActions = ({ linkComponent, mentionComponent, onImage, onDivider }: MediaActionsProps) => {
    const actions = [
        { icon: ImageIcon, translationKey: 'image' as const, onClick: onImage },
        { icon: Minus, translationKey: 'divider' as const, onClick: onDivider },
    ]

    return (
        <>
            {linkComponent}
            {mentionComponent}
            {actions.map((action) => (
                <EditorButton
                    key={action.translationKey}
                    icon={action.icon}
                    onClick={action.onClick}
                    translationKey={action.translationKey}
                />
            ))}
        </>
    )
}

export default MediaActions
