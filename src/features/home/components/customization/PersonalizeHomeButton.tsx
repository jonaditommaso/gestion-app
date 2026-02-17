'use client'
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useHomeCustomization } from "./HomeCustomizationContext";
import AddWidgetModal from "./AddWidgetModal";
import { START_HOME_CUSTOMIZATION_EVENT } from "@/components/HomeCustomizationTrigger";

const PersonalizeHomeButton = () => {
    const t = useTranslations('home');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const {
        isEditMode,
        setIsEditMode,
        hasChanges,
        saveChanges,
        cancelChanges,
        isSaving,
    } = useHomeCustomization();

    useEffect(() => {
        const startEditMode = () => setIsEditMode(true);

        window.addEventListener(START_HOME_CUSTOMIZATION_EVENT, startEditMode);

        return () => {
            window.removeEventListener(START_HOME_CUSTOMIZATION_EVENT, startEditMode);
        };
    }, [setIsEditMode]);

    if (!isEditMode) {
        return null;
    }

    return (
        <>
            {modalIsOpen && (
                <AddWidgetModal isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />
            )}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setModalIsOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    {t('add-widget')}
                </Button>
                <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={cancelChanges}
                    disabled={isSaving}
                >
                    <X className="h-4 w-4" />
                    {t('cancel')}
                </Button>
                <Button
                    className="gap-2"
                    onClick={saveChanges}
                    disabled={!hasChanges || isSaving}
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {t('save')}
                </Button>
            </div>
        </>
    );
};

export default PersonalizeHomeButton;
