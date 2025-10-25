'use client'

import { Minus } from 'lucide-react' //Image as ImageIcon,
import EditorButton from './EditorButton'
import { ReactNode } from 'react'

interface MediaActionsProps {
    linkComponent: ReactNode
    // onImage: () => void
    onDivider: () => void
    // onMention: () => void
}

const MediaActions = ({ linkComponent, onDivider }: MediaActionsProps) => {
    const actions = [
        // { icon: ImageIcon, translationKey: 'image' as const, onClick: onImage },
        { icon: Minus, translationKey: 'divider' as const, onClick: onDivider },
        // { icon: AtSign, translationKey: 'mention' as const, onClick: onMention },
    ]

    return (
        <>
            {linkComponent}
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
