'use client'
import { Button } from "@/components/ui/button";
import { Settings2, Plus, X, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useHomeCustomization } from "./HomeCustomizationContext";
import AddWidgetModal from "./AddWidgetModal";

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

    if (!isEditMode) {
        return (
            <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsEditMode(true)}
            >
                <Settings2 className="h-4 w-4" />
                {t('personalize-home')}
            </Button>
        );
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
