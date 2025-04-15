'use client'

import { useState } from "react";
import MenuCard from "./MenuCard";
import { items } from "./items";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddOperationModal from "../AddOperationModal";
import { useTranslations } from "next-intl";

const BillingMenu = () => {
    const [activeView, setActiveView] = useState('transactions');
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('billing')

    return (
        <div className="flex flex-col items-center gap-4 mr-5">
            <AddOperationModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
            <Button
                //variant='destructive'
                className="w-56"
                onClick={() => setIsOpen(true)}
            >
                {t('add-operation')} <Plus />
            </Button>
            {items.map(item => (
                <MenuCard
                    key={item.id}
                    title={item.title}
                    menuItems={item.menuItems}
                    bgColor={item.bgColor}
                    isActive={activeView === item.id}
                    id={item.id}
                    setActiveView={setActiveView}
                />
            ))}
        </div>
    );
}

export default BillingMenu;