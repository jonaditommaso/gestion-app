'use client'

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import EditableText from "@/components/EditableText";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceType } from "@/features/workspaces/types";
import { COLOR_PRESETS } from "../constants/color-presets";
import { CustomLabel, WorkspaceMetadata } from "../types/custom-status";
import { LABEL_COLORS, MAX_LABEL_NAME_LENGTH } from "../constants/label-colors";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

interface WorkspaceCustomizeProps {
    workspace: WorkspaceType;
}

const WorkspaceCustomize = ({ workspace }: WorkspaceCustomizeProps) => {
    const t = useTranslations('workspaces');
    const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        t('delete-label-confirm-title'),
        t('delete-label-confirm-message'),
        'destructive'
    );

    // Parse metadata from workspace
    const getMetadataFromWorkspace = (): WorkspaceMetadata => {
        try {
            if (workspace.metadata) {
                return typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
            }
        } catch (error) {
            console.error('Error parsing metadata:', error);
        }
        return {};
    };

    // Optimistic local state for labels
    const [optimisticLabels, setOptimisticLabels] = useState<CustomLabel[]>(() => {
        return getMetadataFromWorkspace().customLabels || [];
    });

    // Input values state (for editing)
    const [inputValues, setInputValues] = useState<Record<string, string>>({});

    // Sync optimistic state when workspace data changes from server
    useEffect(() => {
        try {
            if (workspace.metadata) {
                const parsed = typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
                setOptimisticLabels(parsed.customLabels || []);
            }
        } catch {
            setOptimisticLabels([]);
        }
    }, [workspace.metadata]);

    const metadata = getMetadataFromWorkspace();
    const selectedColor = metadata.backgroundColor || 'transparent';

    // Get label by color from optimistic state
    const getLabelByColor = (color: string) => {
        return optimisticLabels.find(label => label.color === color);
    };

    // Get input value
    const getInputValue = (color: string) => {
        if (inputValues[color] !== undefined) {
            return inputValues[color];
        }
        const existingLabel = getLabelByColor(color);
        return existingLabel?.name || '';
    };

    const handleNameSave = (newName: string) => {
        updateWorkspace({
            json: { name: newName },
            param: { workspaceId: workspace.$id }
        });
    };

    const handleColorSelect = (color: string) => {
        const newMetadata: WorkspaceMetadata = {
            ...metadata,
            backgroundColor: color
        };

        updateWorkspace({
            json: { metadata: JSON.stringify(newMetadata) },
            param: { workspaceId: workspace.$id }
        });
    };

    const handleLabelChange = (color: string, value: string) => {
        setInputValues(prev => ({ ...prev, [color]: value }));
    };

    const handleLabelBlur = (color: string) => {
        const value = inputValues[color];
        if (value === undefined) return; // No changes made

        const existingLabel = getLabelByColor(color);
        const trimmedValue = value.trim();

        // Clear input state
        setInputValues(prev => {
            const newState = { ...prev };
            delete newState[color];
            return newState;
        });

        // If empty and label exists, restore original (user needs X to delete)
        if (!trimmedValue && existingLabel) {
            return;
        }

        // If empty and no label, nothing to do
        if (!trimmedValue && !existingLabel) {
            return;
        }

        // If same as existing, nothing to do
        if (existingLabel && existingLabel.name === trimmedValue) {
            return;
        }

        // Optimistic update
        let updatedLabels: CustomLabel[];

        if (existingLabel) {
            updatedLabels = optimisticLabels.map(label =>
                label.id === existingLabel.id
                    ? { ...label, name: trimmedValue }
                    : label
            );
        } else {
            const newLabel: CustomLabel = {
                id: `LABEL_${Date.now()}`,
                name: trimmedValue,
                color: color,
            };
            updatedLabels = [...optimisticLabels, newLabel];
        }

        // Update optimistic state immediately
        setOptimisticLabels(updatedLabels);

        // Send to server
        const newMetadata: WorkspaceMetadata = {
            ...metadata,
            customLabels: updatedLabels,
        };

        updateWorkspace({
            json: { metadata: JSON.stringify(newMetadata) },
            param: { workspaceId: workspace.$id }
        }, {
            onSuccess: () => {
                toast.success(existingLabel ? t('label-updated') : t('label-created'));
            },
            onError: () => {
                // Revert optimistic update on error
                setOptimisticLabels(metadata.customLabels || []);
            }
        });
    };

    const handleDeleteLabel = async (color: string) => {
        const existingLabel = getLabelByColor(color);
        if (!existingLabel) return;

        const confirmed = await confirmDelete();
        if (!confirmed) return;

        // Optimistic update
        const updatedLabels = optimisticLabels.filter(label => label.id !== existingLabel.id);
        setOptimisticLabels(updatedLabels);

        // Clear input state for this color
        setInputValues(prev => {
            const newState = { ...prev };
            delete newState[color];
            return newState;
        });

        // Send to server
        const newMetadata: WorkspaceMetadata = {
            ...metadata,
            ...(updatedLabels.length > 0 ? { customLabels: updatedLabels } : {}),
        };

        if (updatedLabels.length === 0) {
            delete newMetadata.customLabels;
        }

        updateWorkspace({
            json: { metadata: JSON.stringify(newMetadata) },
            param: { workspaceId: workspace.$id }
        }, {
            onSuccess: () => {
                toast.success(t('label-deleted'));
            },
            onError: () => {
                // Revert optimistic update on error
                setOptimisticLabels(metadata.customLabels || []);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent, color: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputRefs.current[color]?.blur();
        } else if (e.key === 'Escape') {
            setInputValues(prev => {
                const newState = { ...prev };
                delete newState[color];
                return newState;
            });
            inputRefs.current[color]?.blur();
        }
    };

    return (
        <div className="mt-10 max-w-6xl mx-auto">
            <ConfirmDeleteDialog />

            {/* Grid layout: 3 columns for left side, 1 for labels */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Left Column - Name + Background Colors (3/4 width) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Workspace Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            {t('workspace-name')}
                        </label>
                        <EditableText
                            value={workspace.name}
                            onSave={handleNameSave}
                            disabled={isPending}
                            size="lg"
                            maxLength={50}
                            className="text-2xl font-bold"
                        />
                    </div>

                    {/* Background Color */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('background-color')}</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {t('background-color-description')}
                            </p>

                            <div className="grid grid-cols-4 gap-3">
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => handleColorSelect(preset.value)}
                                        disabled={isPending}
                                        className={cn(
                                            "relative h-24 rounded-lg transition-all hover:scale-105 border-2 overflow-hidden",
                                            selectedColor === preset.value
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-transparent hover:border-primary/30",
                                            isPending && "opacity-50 cursor-not-allowed",
                                            preset.gradient
                                        )}
                                    >
                                        {selectedColor === preset.value && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-primary rounded-full p-1">
                                                    <Check className="size-4 text-primary-foreground" />
                                                </div>
                                            </div>
                                        )}
                                        <span className="absolute bottom-1.5 left-0 right-0 text-center text-xs font-medium text-foreground/80">
                                            {preset.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Custom Labels (1/4 width) */}
                <Card className="lg:col-span-2 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('custom-labels')}</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t('custom-labels-description')}
                        </p>

                        {/* Label inputs - one per color */}
                        <div className="space-y-2">
                            {LABEL_COLORS.map((color) => {
                                const existingLabel = getLabelByColor(color.value);
                                const inputValue = getInputValue(color.value);

                                return (
                                    <div
                                        key={color.value}
                                        className="group relative flex items-center"
                                    >
                                        <input
                                            ref={(el) => { inputRefs.current[color.value] = el; }}
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => handleLabelChange(color.value, e.target.value)}
                                            onBlur={() => handleLabelBlur(color.value)}
                                            onKeyDown={(e) => handleKeyDown(e, color.value)}
                                            maxLength={MAX_LABEL_NAME_LENGTH}
                                            className={cn(
                                                "w-full h-9 px-3 pr-8 rounded-md text-sm font-medium transition-all",
                                                "border-0 outline-none focus:ring-2 focus:ring-primary/50"
                                            )}
                                            style={{
                                                backgroundColor: color.value,
                                                color: color.textColor,
                                            }}
                                        />
                                        {/* Delete button - only show if label exists */}
                                        {existingLabel && (
                                            <button
                                                onClick={() => handleDeleteLabel(color.value)}
                                                className={cn(
                                                    "absolute right-2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                                                    "hover:bg-black/10"
                                                )}
                                                style={{ color: color.textColor }}
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {optimisticLabels.length}/{LABEL_COLORS.length} {t('labels-used')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WorkspaceCustomize;
