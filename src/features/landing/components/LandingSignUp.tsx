'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const LandingSignUp = () => {
    const [email, setEmail] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const router = useRouter();
    const t = useTranslations('landing');

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        const form = e.currentTarget as HTMLFormElement;
        if (form.checkValidity()) {
            setIsInvalid(false);
            localStorage.setItem("email", email);
            router.push("/signup");
        } else {
            setIsInvalid(true);
        }
    };

    return (
        <>
            <span className={cn("text-red-400 text-sm text-center mt-2", isInvalid ? "opacity-100 visible" : "opacity-0 invisible")}>
                {t('enter-valid-email')}
            </span>
            <form className="flex items-center space-x-2 w-full" onSubmit={handleSubmit} noValidate>
                <Input
                    type="email"
                    placeholder="Email"
                    className=" focus-visible:ring-0 focus:outline-none bg-white text-black h-10 flex-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ border: isInvalid ? "1px solid red" : "1px solid #ccc" }}
                />
                <Button size='lg' type="submit">{t('get-started')}</Button>
            </form>
        </>
    );
}

export default LandingSignUp;