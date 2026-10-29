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
import { COLOR_PRESETS, WORKSPACE_ICON_PRESETS } from "../constants/color-presets";
import { CustomLabel, WorkspaceMetadata } from "../types/custom-status";
import { LABEL_COLORS, MAX_LABEL_NAME_LENGTH } from "../constants/label-colors";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useWorkspacePermissions } from "../hooks/use-workspace-permissions";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { useAppContext } from "@/context/AppContext";
import { parseWorkspaceMetadata } from "../utils/workspace-metadata";

interface WorkspaceCustomizeProps {
    workspace: WorkspaceType;
}

const WorkspaceCustomize = ({ workspace }: WorkspaceCustomizeProps) => {
    const t = useTranslations('workspaces');
    const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();
    const { canEditLabel } = useWorkspacePermissions();
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const { hasPermission } = useCurrentUserPermissions();
    const { isDemo } = useAppContext();
    const canWrite = hasPermission(PERMISSIONS.WRITE) && !isDemo;
    const canDelete = hasPermission(PERMISSIONS.DELETE) && !isDemo;

    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        t('delete-label-confirm-title'),
        t('delete-label-confirm-message'),
        'destructive'
    );

    // Parse metadata from workspace
    const getMetadataFromWorkspace = (): WorkspaceMetadata => {
        return parseWorkspaceMetadata(workspace.metadata);
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
    const selectedIcon = metadata.workspaceIcon || '';

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

    const handleIconSelect = (icon: string) => {
        const newMetadata: WorkspaceMetadata = { ...metadata };
        if (icon) {
            newMetadata.workspaceIcon = icon;
        } else {
            delete newMetadata.workspaceIcon;
        }

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

            {/* Grid layout: 3 columns for left side, 1 for labels (if has permission) */}
            <div className={cn("grid grid-cols-1 gap-6", canEditLabel ? "lg:grid-cols-6" : "lg:grid-cols-1 max-w-4xl")}>
                {/* Left Column - Name + Background Colors */}
                <div className={cn("space-y-4", canEditLabel && "lg:col-span-4")}>
                    {/* Workspace Name */}
                    <div className="gap-2 items-center grid grid-cols-2">

                    <Card>
                            {/* <label className="text-sm font-medium text-muted-foreground">
                                {t('workspace-name')}
                            </label> */}
                            <CardHeader>
                                <CardTitle className="text-lg">{t('workspace-name')}</CardTitle>
                            </CardHeader>
                        <Separator />
                        <CardContent className="space-y-2 p-4">

                            <EditableText
                                value={workspace.name}
                                onSave={handleNameSave}
                                disabled={isPending || !canWrite}
                                size="lg"
                                maxLength={50}
                                className="text-2xl font-bold"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('workspace-icon')}</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 space-y-4">
                            {/* <p className="text-sm text-muted-foreground">
                                {t('workspace-icon-description')}
                            </p> */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    aria-label={t('workspace-icon-default')}
                                    aria-pressed={!selectedIcon}
                                    onClick={() => handleIconSelect('')}
                                    disabled={isPending || !canWrite}
                                    className={cn(
                                        "size-10 rounded-lg border bg-background text-sm font-semibold transition-colors hover:bg-muted",
                                        !selectedIcon ? "border-primary ring-2 ring-primary/20" : "border-border",
                                        (isPending || !canWrite) && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    {workspace.name[0]?.toUpperCase() ?? 'W'}
                                </button>
                                {WORKSPACE_ICON_PRESETS.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        aria-label={`${t('workspace-icon')} ${icon}`}
                                        aria-pressed={selectedIcon === icon}
                                        onClick={() => handleIconSelect(icon)}
                                        disabled={isPending || !canWrite}
                                        className={cn(
                                            "size-10 rounded-lg border bg-background text-xl transition-colors hover:bg-muted",
                                            selectedIcon === icon ? "border-primary ring-2 ring-primary/20" : "border-border",
                                            (isPending || !canWrite) && "cursor-not-allowed opacity-50"
                                        )}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    </div>


                    {/* Workspace theme */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('workspace-theme')}</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        aria-label={t(preset.name)}
                                        aria-pressed={selectedColor === preset.value}
                                        onClick={() => handleColorSelect(preset.value)}
                                        disabled={isPending || !canWrite}
                                        className={cn(
                                            "relative h-16 rounded-lg transition-all hover:-translate-y-0.5 border-2 overflow-hidden",
                                            selectedColor === preset.value
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-border/70 hover:border-primary/40",
                                            (isPending || !canWrite) && "opacity-50 cursor-not-allowed",
                                            preset.gradient,
                                        )}
                                    >
                                        {selectedColor === preset.value && (
                                            <Check className="absolute right-2 top-2 size-4 rounded-full bg-background p-0.5 text-primary shadow-sm" />
                                        )}
                                        <span className="absolute inset-x-1 bottom-1 truncate rounded bg-background/80 px-1 py-0.5 text-center text-[11px] font-medium text-foreground">
                                            {t(preset.name)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Custom Labels (only if has permission) */}
                {canEditLabel && (
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
                                            disabled={!canWrite}
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
                                        {existingLabel && canDelete && (
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
                )}
            </div>
        </div>
    );
};

export default WorkspaceCustomize;
