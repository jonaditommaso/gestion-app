import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FormEvent, useState } from "react";
import { useAddMemberTag } from "../api/use-add-member-tag";
import { useTranslations } from "next-intl";

const TagsMember = ({ tags }: { tags: string[] }) => {
    const [popoverTagIsOpen, setPopoverTagIsOpen] = useState(false);
    const { mutate: addTag, isPending: addingTag  } = useAddMemberTag()
    const t = useTranslations('team');

    const onAddTag = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget

        const tagInput = elements.namedItem('newTag');

        const isInput = tagInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        if (!tagInput.value) {
            setPopoverTagIsOpen(false);
            return;
        }

        addTag({
            json: {
                tag: tagInput.value.trim()
            }
        });

        tagInput.value = ''
        setPopoverTagIsOpen(false);
    }

    return (
        <div className="flex w-full justify-center items-center gap-4 text-blue-600">
            {tags?.map((tag, index) => (
                <p key={index} className="text-sm cursor-pointer hover:underline">#{tag}</p>
            ))}
            {tags.length < 2 && (
                <Popover open={popoverTagIsOpen} onOpenChange={setPopoverTagIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant='outline' className="border-blue-600 py-0 px-2 hover:text-blue-500 transition-colors duration-150" size='sm'>+ {t('add-tag')}</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <form onSubmit={onAddTag}>
                            <Input placeholder={t('placeholder-tag')} name="newTag" />
                            <Separator className="my-2"/>
                            <div className="flex items-center gap-2 justify-center">
                                <Button variant='outline' size='sm' type="button" onClick={() => setPopoverTagIsOpen(false)}>{t('cancel')}</Button>
                                <Button size='sm' type="submit" disabled={addingTag}>{t('add')}</Button>
                            </div>
                        </form>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

export default TagsMember;