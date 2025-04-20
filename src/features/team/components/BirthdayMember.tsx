import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cake, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useUpdateBirthday } from "../api/use-update-birthday";
import dayjs from "dayjs";

const BirthdayMember = ({ birthday }: { birthday: string }) => {
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const [tooltipIsOpen, setTooltipIsOpen] = useState(false);
    const { mutate: updateBirthday } = useUpdateBirthday()
    const t = useTranslations('team');

    const onUpdateBirthday = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { elements } = event.currentTarget

        const birthdayInput = elements.namedItem('birthday');

        const isInput = birthdayInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        // check why is not updating until reload
        updateBirthday({
            json: {
                birthday: birthdayInput.value
            }
        });

        birthdayInput.value = ''
        setPopoverIsOpen(false);
    }

    return (
        <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
            <Popover
                open={popoverIsOpen}
                onOpenChange={(open) => {
                    setPopoverIsOpen(open);
                    if (open) setTooltipIsOpen(true);
                }}
            >
                <TooltipProvider>
                    <Tooltip open={tooltipIsOpen} onOpenChange={setTooltipIsOpen}>
                        <PopoverTrigger>
                            <TooltipTrigger asChild>
                                <Cake className="size-5 text-pink-600" onClick={(e) => e.stopPropagation()} />
                            </TooltipTrigger>
                        </PopoverTrigger>

                        <TooltipContent className="flex items-center justify-between gap-2">
                            <span>{birthday ? dayjs(birthday).format('DD, MMMM') : t('not-specified')}</span>
                            <SquarePen size={14} className="cursor-pointer hover:opacity-75 transition-all duration-150" onClick={() => setPopoverIsOpen(true)}/>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <PopoverContent>
                    <form onSubmit={onUpdateBirthday}>
                        <Input name="birthday" type="date" defaultValue={birthday} />
                        <Separator className="my-2"/>
                        <div className="flex items-center gap-2 justify-center">
                            <Button variant='outline' size='sm' type="button" onClick={() => setPopoverIsOpen(false)}>{t('cancel')}</Button>
                            <Button size='sm' type="submit" disabled={false}>{t('update')}</Button>
                        </div>
                    </form>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default BirthdayMember;