'use client'

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type SizeVariant = 'sm' | 'md' | 'lg';

interface EditableTextProps {
    value: string;
    onSave: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: SizeVariant;
    multiline?: boolean;
    maxLength?: number;
    className?: string;
    displayClassName?: string;
    inputClassName?: string;
}

const sizeConfig = {
    sm: {
        text: 'text-sm',
        minHeight: 'min-h-[24px]',
        padding: 'px-2 py-1'
    },
    md: {
        text: 'text-base',
        minHeight: 'min-h-[32px]',
        padding: 'px-3 py-2'
    },
    lg: {
        text: 'text-lg',
        minHeight: 'min-h-[40px]',
        padding: 'px-4 py-2'
    }
};

const EditableText = ({
    value,
    onSave,
    placeholder = 'Click to edit...',
    disabled = false,
    size = 'md',
    multiline = false,
    maxLength,
    className,
    displayClassName,
    inputClassName
}: EditableTextProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const config = sizeConfig[size];

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
                inputRef.current.setSelectionRange(localValue.length, localValue.length);
            } else if (inputRef.current instanceof HTMLInputElement) {
                inputRef.current.setSelectionRange(localValue.length, localValue.length);
            }
        }
    }, [isEditing, localValue.length, multiline]);

    const handleSave = () => {
        const trimmedValue = localValue.trim();
        if (trimmedValue !== value) {
            onSave(trimmedValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        } else if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    if (isEditing && !disabled) {
        const baseInputClass = cn(
            'w-full bg-transparent border rounded focus:outline-none focus:ring-2 focus:ring-ring',
            config.text,
            config.padding,
            multiline ? 'resize-none' : '',
            inputClassName
        );

        return multiline ? (
            <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                className={baseInputClass}
                rows={4}
            />
        ) : (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                className={baseInputClass}
            />
        );
    }

    return (
        <div
            onClick={() => !disabled && setIsEditing(true)}
            className={cn(
                'cursor-pointer hover:bg-muted/50 rounded transition-all border border-transparent',
                config.text,
                config.minHeight,
                config.padding,
                disabled && 'cursor-not-allowed opacity-60',
                className,
                displayClassName
            )}
        >
            {value || <span className="text-muted-foreground">{placeholder}</span>}
        </div>
    );
};

export default EditableText;
