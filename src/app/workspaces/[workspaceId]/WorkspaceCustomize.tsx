'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import EditableText from "@/components/EditableText";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceType } from "@/features/workspaces/types";
import { COLOR_PRESETS } from "../constants/color-presets";

interface WorkspaceCustomizeProps {
    workspace: WorkspaceType;
}

const WorkspaceCustomize = ({ workspace }: WorkspaceCustomizeProps) => {
    const t = useTranslations('workspaces');
    const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();

    // Parse metadata to get current color
    const getInitialColor = () => {
        try {
            if (workspace.metadata) {
                const metadata = typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
                return metadata.backgroundColor || 'transparent';
            }
        } catch (error) {
            console.error('Error parsing metadata:', error);
        }
        return 'transparent';
    };

    const [selectedColor, setSelectedColor] = useState(getInitialColor());

    const handleNameSave = (newName: string) => {
        updateWorkspace({
            json: { name: newName },
            param: { workspaceId: workspace.$id }
        });
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        const metadata = JSON.stringify({ backgroundColor: color });

        updateWorkspace({
            json: { metadata },
            param: { workspaceId: workspace.$id }
        });
    };

    return (
        <div className="mt-10 space-y-6 max-w-5xl mx-auto">
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
                <CardContent className="pt-6 space-y-6">
                    <p className="text-sm text-muted-foreground">
                        {t('background-color-description')}
                    </p>

                    {/* Color Presets Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        {COLOR_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => handleColorSelect(preset.value)}
                                disabled={isPending}
                                className={cn(
                                    "relative h-24 rounded-lg transition-all hover:scale-105 border-4 overflow-hidden",
                                    selectedColor === preset.value
                                        ? "border-primary ring-4 ring-primary/20"
                                        : "border-transparent hover:border-primary/30",
                                    isPending && "opacity-50 cursor-not-allowed",
                                    preset.gradient
                                )}
                                title={preset.name}
                            >
                                {selectedColor === preset.value && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-primary rounded-full p-1">
                                            <Check className="size-5 text-primary-foreground" />
                                        </div>
                                    </div>
                                )}
                                <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium">
                                    {preset.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkspaceCustomize;
