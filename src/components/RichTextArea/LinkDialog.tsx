'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover'
import { Link as LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface LinkDialogProps {
    onInsertLink: (url: string, text?: string, savedRange?: Range) => void
}

const LinkDialog = ({ onInsertLink }: LinkDialogProps) => {
    const t = useTranslations('workspaces')
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState('')
    const [text, setText] = useState('')
    const [isValidUrl, setIsValidUrl] = useState(false)
    const [savedRange, setSavedRange] = useState<Range | null>(null)

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            // Guardar el rango actual antes de abrir
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                setSavedRange(selection.getRangeAt(0).cloneRange())
            }
        } else {
            // Limpiar al cerrar
            setUrl('')
            setText('')
            setIsValidUrl(false)
            setSavedRange(null)
        }
        setOpen(newOpen)
    }

    const validateUrl = (value: string) => {
        if (!value.trim()) {
            setIsValidUrl(false)
            return
        }

        // Regex para validar URL: puede tener http(s):// o no, pero debe tener dominio.extension
        // Acepta subdominios, paths, query params, etc.
        const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/i
        setIsValidUrl(urlPattern.test(value.trim()))
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setUrl(value)
        validateUrl(value)
    }

    const handleSubmit = () => {
        if (isValidUrl && savedRange) {
            // Si no tiene protocolo, agregar https://
            const finalUrl = url.trim().match(/^https?:\/\//)
                ? url.trim()
                : `https://${url.trim()}`

            onInsertLink(finalUrl, text.trim() || undefined, savedRange)
            handleOpenChange(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    title={t('link')}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="link-url">
                            URL <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="link-url"
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={handleUrlChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="link-text">
                            {t('text')} ({t('optional')})
                        </Label>
                        <Input
                            id="link-text"
                            type="text"
                            placeholder={t('link-text-placeholder')}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChange(false)}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={!isValidUrl}
                            onClick={handleSubmit}
                        >
                            {t('insert')}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default LinkDialog
