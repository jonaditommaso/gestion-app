'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRequestEnterprisePlan } from "../api/use-request-enterprise-plan";

interface SelectPricingButtonProps {
    textButton: string,
    type: string
}

const SelectPricingButton = ({ textButton, type }: SelectPricingButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: sendRequest } = useRequestEnterprisePlan()
    const t = useTranslations('pricing');
    const router = useRouter();

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget

        const emailInput = elements.namedItem('email');
        const textInput = elements.namedItem('text');

        const isEmailInput = emailInput instanceof HTMLInputElement;
        if (!isEmailInput || isEmailInput == null) return;

        const isTextInput = textInput instanceof HTMLTextAreaElement;
        if (!isTextInput || isTextInput == null) return;
        setIsOpen(false)

        sendRequest({
            json: {
                email: emailInput.value,
                message: textInput.value
            }
        })
        emailInput.value = ''
        textInput.value = ''
    }

    const handleClick = () => {
        if (type === 'enterprise') {
            setIsOpen(true);
            return
        }

        router.push(`/signup?plan=${type}`)
    }

    return (
        <>
            <DialogContainer
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title={t('pricing-enterprise-contact-title')}
                description={t('pricing-enterprise-contact-description')}
            >
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-4">
                        <Input name="email" type='email' placeholder={t('email-placeholder')} />
                        <Textarea name="text" placeholder={t('additionnal-query-placeholder')} className="resize-none h-36" maxLength={256} />
                        <Button className="w-[100%]" type="submit">
                            {t('send')}
                        </Button>
                    </div>
                </form>
            </DialogContainer>
            <Button variant='outline' className="p-2 w-full bg-zinc-900 hover:bg-zinc-800 hover:text-white text-white font-semibold" onClick={handleClick}>{textButton}</Button>
        </>
    );
}

export default SelectPricingButton;