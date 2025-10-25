'use client'

import { Bold, Italic, Code } from 'lucide-react'
import EditorButton from './EditorButton'
import ColorPicker from './ColorPicker'

interface TextFormattingProps {
    onBold: () => void
    onItalic: () => void
    onCode: () => void
    onColorSelect: (color: string) => void
    currentColor?: string
    isActive: {
        bold: boolean
        italic: boolean
        underline: boolean
        code: boolean
    }
}

const TextFormatting = ({ onBold, onItalic, onCode, onColorSelect, currentColor, isActive }: TextFormattingProps) => {
    return (
        <>
            <EditorButton
                icon={Bold}
                onClick={onBold}
                translationKey="bold"
                isActive={isActive.bold}
            />
            <EditorButton
                icon={Italic}
                onClick={onItalic}
                translationKey="italic"
                isActive={isActive.italic}
            />
            <EditorButton
                icon={Code}
                onClick={onCode}
                translationKey="code"
                isActive={isActive.code}
            />
            <ColorPicker onColorSelect={onColorSelect} currentColor={currentColor} />
        </>
    )
}

export default TextFormatting
