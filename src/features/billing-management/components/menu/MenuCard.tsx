import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import capitalize from "@/utils/capitalize";
import { dataServiceObserver } from "@/utils/dataServiceObserver";
import { Dispatch, SetStateAction } from "react";

interface MenuCardProps {
    title: string,
    menuItems: string[],
    bgColor: string,
    isActive: boolean,
    id: string,
    setActiveView: Dispatch<SetStateAction<string>>
}

const MenuCard = ({ title, menuItems, bgColor, isActive, id, setActiveView }: MenuCardProps) => {

    const handleOnClick = (item: string) => {
        setActiveView(id);
        dataServiceObserver.sendData(item)
    }

    return (
        <Card className="w-56 min-h-fit h-40">
            <div className={cn("p-3 text-white text-center cursor-pointer bg-gray-400", isActive && bgColor)}>{title}</div>
            <div className="p-2">
                {menuItems.map(item => (
                    <Button
                        variant='link'
                        className="block p-1 h-8"
                        key={item}
                        onClick={() => handleOnClick(item)}
                    >
                        {capitalize(item)}
                    </Button>
                ))}
            </div>
        </Card>
    );
}

export default MenuCard;