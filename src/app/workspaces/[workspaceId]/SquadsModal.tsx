'use client'

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SquadsPanel from "@/features/tasks/components/SquadsPanel";
import { useTranslations } from "next-intl";

interface SquadsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SquadsModal = ({ open, onOpenChange }: SquadsModalProps) => {
    const t = useTranslations('workspaces');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
                <DialogTitle className="sr-only">{t('squads')}</DialogTitle>
                <SquadsPanel />
            </DialogContent>
        </Dialog>
    );
};

export default SquadsModal;
