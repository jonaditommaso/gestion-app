'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

interface DropdownItemsProps {
    itemLogo: string,
    itemName: string,
    itemType: string,
}

const DropdownItems = ({ itemLogo, itemName, itemType }: DropdownItemsProps) => {
    const { theme } = useTheme();
    const t = useTranslations('general')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="max-w-80 flex items-center gap-2 p-2 border rounded-sm focus:outline-none h-9">
                <div className="border border-zinc-300 w-8 h-7 rounded-md bg-zinc-200 text-white text-xl">{itemLogo}</div>
                <p className={theme === 'dark' ? 'text-white' : 'text-zinc-700'}>{itemName}</p>
                <ChevronsUpDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem className="min-w-60 flex items-center justify-center p-2" disabled>
                    <span className="w-40px"><Plus className="border rounded-md p-0.5" size={20} /></span> {t('create-new')} {itemType}
                    {/* podria anadir un drawer para una mobile implementation */}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default DropdownItems;