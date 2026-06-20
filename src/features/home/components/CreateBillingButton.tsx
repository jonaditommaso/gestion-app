'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const AddOperationModal = dynamic(
    () => import("@/features/billing-management/components/AddOperationModal"),
    { loading: () => <></> }
);

const CreateBillingButton = ({ isDemo }: { isDemo: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('home');

    return (
        <>
            <AddOperationModal isOpen={isOpen} setIsOpen={setIsOpen} />
            <Button
                className="w-full h-28"
                variant="outline"
                onClick={() => setIsOpen(true)}
                disabled={isDemo}
            >
                <Receipt className="h-4 w-4" />
                <span>{t('new-billing')}</span>
            </Button>
        </>
    );
};

export default CreateBillingButton;
