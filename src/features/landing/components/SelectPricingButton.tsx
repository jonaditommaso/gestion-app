'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface SelectPricingButtonProps {
    textButton: string,
    type: string
}

const SelectPricingButton = ({ textButton, type }: SelectPricingButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget

        const emailInput = elements.namedItem('email');

        const isInput = emailInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        console.log(emailInput.value) // save it
        emailInput.value = ''
        setIsOpen(false)
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
                title='Ingresa tu email y te contactaremos cuanto antes'
                description="Nos pondremos en contacto contigo para tratar los detalles del plan que mejor se adecue a ti"
            >
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-4">
                        <Input name="email" type='email' />
                        <Button className="w-[100%]" type="submit">
                            Enviar
                        </Button>
                    </div>
                </form>
            </DialogContainer>
            <Button variant='outline' className="p-2 w-full bg-zinc-900 hover:bg-zinc-800 hover:text-white text-white font-semibold" onClick={handleClick}>{textButton}</Button>
        </>
    );
}

export default SelectPricingButton;