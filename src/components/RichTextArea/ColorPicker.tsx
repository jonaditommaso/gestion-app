'use client'

import { Button } from '../ui/button'
import { useTranslations } from 'next-intl'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface ColorPickerProps {
    onColorSelect: (color: string) => void
    currentColor?: string
}

const COLORS = [
    { name: 'default', value: 'default', lightColor: '#000000', darkColor: '#ffffff' },
    { name: 'red', value: '#ef4444' },
    { name: 'orange', value: '#f97316' },
    { name: 'yellow', value: '#eab308' },
    { name: 'green', value: '#22c55e' },
    { name: 'blue', value: '#3b82f6' },
    { name: 'purple', value: '#a855f7' },
    { name: 'pink', value: '#ec4899' },
    { name: 'gray', value: '#6b7280' },
    { name: 'brown', value: '#92400e' },
]

const ColorPicker = ({ onColorSelect, currentColor }: ColorPickerProps) => {
    const t = useTranslations('workspaces')
    const { theme } = useTheme()
    const [open, setOpen] = useState(false)
    const [selectedColor, setSelectedColor] = useState<string>(currentColor || 'default')

    useEffect(() => {
        if (currentColor) {
            setSelectedColor(currentColor)
        }
    }, [currentColor])

    const isDark = theme === 'dark'

    const handleColorSelect = (color: string) => {
        setSelectedColor(color)
        onColorSelect(color)
        setOpen(false)
    }

    const getDisplayColor = (color: typeof COLORS[0]) => {
        if (color.value === 'default') {
            return isDark ? color.darkColor : color.lightColor
        }
        return color.value
    }

    const getCurrentColor = () => {
        const color = COLORS.find(c => c.value === selectedColor)
        return color ? getDisplayColor(color) : (isDark ? '#ffffff' : '#000000')
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 relative"
                    title={t('text-color')}
                >
                    <div
                        className="h-4 w-4 rounded border border-border"
                        style={{ backgroundColor: getCurrentColor() }}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => {
                        const displayColor = getDisplayColor(color)
                        const isSelected = selectedColor === color.value

                        return (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => handleColorSelect(color.value)}
                                className={cn(
                                    "h-8 w-8 rounded-md border-2 transition-all relative",
                                    isSelected
                                        ? 'border-foreground ring-2 ring-offset-1 ring-primary/50'
                                        : 'border-muted hover:border-foreground'
                                )}
                                style={{ backgroundColor: displayColor }}
                                title={t(`color-${color.name}`)}
                            >
                                {isSelected && (
                                    <Check
                                        className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            color: color.value === 'default'
                                                ? (isDark ? '#000000' : '#ffffff')
                                                : '#ffffff',
                                            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default ColorPicker
