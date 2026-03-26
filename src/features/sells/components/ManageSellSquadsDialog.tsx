'use client'
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SellSquadsPanel from "./SellSquadsPanel";

interface ManageSellSquadsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ManageSellSquadsDialog = ({ open, onOpenChange }: ManageSellSquadsDialogProps) => {
    const t = useTranslations("sales");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
                <DialogTitle className="sr-only">{t("squads.title")}</DialogTitle>
                <SellSquadsPanel />
            </DialogContent>
        </Dialog>
    );
};

export default ManageSellSquadsDialog;
