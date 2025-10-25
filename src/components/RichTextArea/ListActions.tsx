'use client'

import { List, ListOrdered } from 'lucide-react'
import EditorButton from './EditorButton'

interface ListActionsProps {
    onBulletList: () => void
    onOrderedList: () => void
}

const ListActions = ({ onBulletList, onOrderedList }: ListActionsProps) => {
    return (
        <>
            <EditorButton icon={List} onClick={onBulletList} translationKey="bullet-list" />
            <EditorButton icon={ListOrdered} onClick={onOrderedList} translationKey="ordered-list" />
        </>
    )
}

export default ListActions
