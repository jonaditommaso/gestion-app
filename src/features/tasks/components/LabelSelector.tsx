'use client'

import { useState, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCustomLabels } from "@/app/workspaces/hooks/use-custom-labels";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LABEL_COLORS, MAX_LABEL_NAME_LENGTH } from "@/app/workspaces/constants/label-colors";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { CustomLabel, WorkspaceMetadata } from "@/app/workspaces/types/custom-status";
import { toast } from "sonner";

interface LabelSelectorProps {
    value?: string | null;
    onChange: (value: string | undefined) => void;
    disabled?: boolean;
    className?: string;
    showClear?: boolean;
    variant?: 'default' | 'inline'; // inline = text style for TaskDetails
}

export const LabelSelector = ({ value, onChange, disabled, className, showClear = true, variant = 'default' }: LabelSelectorProps) => {
    const t = useTranslations('workspaces');
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();
    const workspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
    const { mutate: updateWorkspace } = useUpdateWorkspace();
    const { customLabels, getLabelById, getLabelColor } = useCustomLabels();
    const [isOpen, setIsOpen] = useState(false);
    const [editingColor, setEditingColor] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const selectedLabel = value?.startsWith('LABEL_') ? getLabelById(value) : null;
    const selectedColorData = selectedLabel ? getLabelColor(selectedLabel.color) : null;

    // If value is a deleted label (LABEL_xxx but not found), treat as no value
    const isDeletedLabel = value?.startsWith('LABEL_') && !selectedLabel;

    // Get label by color
    const getLabelByColor = (color: string) => {
        return customLabels.find(label => label.color === color);
    };

    // Parse workspace metadata
    const getMetadata = (): WorkspaceMetadata => {
        try {
            if (workspace?.metadata) {
                return typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
            }
        } catch {
            // ignore
        }
        return {};
    };

    const handleCreateLabel = (color: string) => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue || !workspace) return;

        const metadata = getMetadata();
        const existingLabels = metadata.customLabels || [];

        const newLabel: CustomLabel = {
            id: `LABEL_${Date.now()}`,
            name: trimmedValue,
            color: color,
        };

        const updatedLabels = [...existingLabels, newLabel];
        const newMetadata: WorkspaceMetadata = {
            ...metadata,
            customLabels: updatedLabels,
        };

        updateWorkspace({
            json: { metadata: JSON.stringify(newMetadata) },
            param: { workspaceId: workspace.$id }
        }, {
            onSuccess: () => {
                toast.success(t('label-created'));
                // Select the newly created label
                onChange(newLabel.id);
                setEditingColor(null);
                setInputValue('');
            }
        });
    };

    const handleSelectLabel = (labelId: string) => {
        onChange(labelId);
        setIsOpen(false);
    };

    const handleStartEditing = (color: string) => {
        setEditingColor(color);
        setInputValue('');
        // Focus input after render
        setTimeout(() => {
            inputRefs.current[color]?.focus();
        }, 0);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent, color: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateLabel(color);
        } else if (e.key === 'Escape') {
            setEditingColor(null);
            setInputValue('');
        }
    };

    const handleInputBlur = (color: string) => {
        if (inputValue.trim()) {
            handleCreateLabel(color);
        } else {
            setEditingColor(null);
            setInputValue('');
        }
    };

    return (
        <div className="flex items-center gap-1 !mt-0">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild className="!mt-0">
                    {variant === 'inline' ? (
                        <button
                            type="button"
                            disabled={disabled}
                            className={cn(
                                "text-sm text-left hover:bg-muted rounded-sm px-1.5 py-1 transition-colors",
                                !selectedLabel && "text-muted-foreground",
                                className
                            )}
                        >
                            {selectedLabel ? (
                                <span
                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                    style={{
                                        backgroundColor: selectedLabel.color,
                                        color: selectedColorData?.textColor || '#000',
                                    }}
                                >
                                    {selectedLabel.name}
                                </span>
                            ) : t('no-label')}
                        </button>
                    ) : (
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isOpen}
                            disabled={disabled}
                            className={cn("justify-between", className)}
                            style={selectedLabel ? {
                                backgroundColor: selectedLabel.color,
                                color: selectedColorData?.textColor || '#000',
                                borderColor: selectedLabel.color,
                            } : undefined}
                        >
                            <span className={cn(!selectedLabel && "text-muted-foreground")}>
                                {selectedLabel ? selectedLabel.name : t('select-label')}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    )}
                </PopoverTrigger>
                <PopoverContent className="w-56 p-1.5" align="start">
                    <div className="space-y-1 w-full">
                        {LABEL_COLORS.map((color) => {
                            const existingLabel = getLabelByColor(color.value);
                            const isSelected = existingLabel && value === existingLabel.id;
                            const isEditing = editingColor === color.value;

                            return (
                                <div key={color.value} className="flex items-center gap-2">
                                    {/* Radio button - empty circle, filled when selected */}
                                    <button
                                        type="button"
                                        onClick={() => existingLabel && handleSelectLabel(existingLabel.id)}
                                        disabled={!existingLabel}
                                        className={cn(
                                            "size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary"
                                                : "border-muted-foreground/40",
                                            !existingLabel && "opacity-30 cursor-default"
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="size-2.5 text-primary-foreground" />
                                        )}
                                    </button>

                                    {/* Label input/display */}
                                    {isEditing ? (
                                        <input
                                            ref={(el) => { inputRefs.current[color.value] = el; }}
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => handleInputKeyDown(e, color.value)}
                                            onBlur={() => handleInputBlur(color.value)}
                                            maxLength={MAX_LABEL_NAME_LENGTH}
                                            className="w-44 h-8 px-3 rounded-md text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-primary/50"
                                            style={{
                                                backgroundColor: color.value,
                                                color: color.textColor,
                                            }}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => existingLabel
                                                ? handleSelectLabel(existingLabel.id)
                                                : handleStartEditing(color.value)
                                            }
                                            className="w-44 h-8 px-3 rounded-md text-sm font-medium text-left transition-opacity hover:opacity-80"
                                            style={{
                                                backgroundColor: color.value,
                                                color: color.textColor,
                                            }}
                                        >
                                            {existingLabel?.name || ''}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
            {showClear && value && !isDeletedLabel && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onChange(undefined)}
                    disabled={disabled}
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    );
};
