'use client'

import { useState } from "react";
import MenuCard from "./MenuCard";
import { items } from "./items";

const BillingMenu = () => {
    const [activeView, setActiveView] = useState('transactions');

    return (
        <div className="flex flex-col items-center gap-4 mr-5">
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