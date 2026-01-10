'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTranslations, useLocale } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import { useHomeCustomization } from "./HomeCustomizationContext";
import { WIDGET_LABELS, INTEGRATION_LABELS, WidgetId, IntegrationId } from "./types";
import { Eye, EyeOff, Sparkles, Music, Video, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWidgetModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const INTEGRATION_ICONS: Record<IntegrationId, React.ReactNode> = {
    'spotify': <Music className="h-4 w-4" />,
    'youtube': <Video className="h-4 w-4" />,
    'google-drive': <HardDrive className="h-4 w-4" />,
};

const AddWidgetModal = ({ isOpen, setIsOpen }: AddWidgetModalProps) => {
    const t = useTranslations('home');
    const locale = useLocale() as 'en' | 'es' | 'it';
    const {
        config,
        toggleWidgetVisibility,
        toggleIntegration,
        toggleSmartWidgets,
    } = useHomeCustomization();

    return (
        <DialogContainer
            title={t('add-widget')}
            description={t('add-widget-description')}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <div className="max-h-[60vh] overflow-auto space-y-6">
                {/* Smart Widgets Configuration */}
                <div className="bg-sidebar-accent rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{t('smart-widgets')}</span>
                        </div>
                        <Switch
                            checked={config.smartWidgets}
                            onCheckedChange={toggleSmartWidgets}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:bg-white"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {t('smart-widgets-description')}
                    </p>
                </div>

                {/* Widgets Section */}
                <div>
                    <h4 className="font-medium mb-3">{t('widgets')}</h4>
                    <div className="space-y-2">
                        {config.widgets.map((widget) => (
                            <div
                                key={widget.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border bg-sidebar",
                                    !widget.canToggle && "opacity-60"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {widget.visible ? (
                                        <Eye className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm">
                                        {WIDGET_LABELS[widget.id as WidgetId][locale]}
                                    </span>
                                </div>
                                <Switch
                                    checked={widget.visible}
                                    onCheckedChange={() => toggleWidgetVisibility(widget.id as WidgetId)}
                                    disabled={!widget.canToggle}
                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:bg-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Integrations Section */}
                <div>
                    <h4 className="font-medium mb-3">{t('integrations')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                        {t('integrations-coming-soon')}
                    </p>
                    <div className="space-y-2">
                        {config.integrations.map((integration) => (
                            <div
                                key={integration.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-sidebar opacity-60"
                            >
                                <div className="flex items-center gap-2">
                                    {INTEGRATION_ICONS[integration.id as IntegrationId]}
                                    <span className="text-sm">
                                        {INTEGRATION_LABELS[integration.id as IntegrationId][locale]}
                                    </span>
                                </div>
                                <Switch
                                    checked={integration.enabled}
                                    onCheckedChange={() => toggleIntegration(integration.id as IntegrationId)}
                                    disabled={true}
                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:bg-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-4 pb-4">
                <Button onClick={() => setIsOpen(false)}>
                    {t('done')}
                </Button>
            </div>
        </DialogContainer>
    );
};

export default AddWidgetModal;
