'use client'

import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRegister } from "@/features/auth/api/use-register";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateInviteCode } from "@/lib/utils";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ClockAlert, Rocket, Settings, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const DemoButton = ({ text, fit }: { text: string, fit?: boolean }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: demoRegister, isPending } = useRegister();
    const t = useTranslations('landing');
    const isMobile = useIsMobile();

    const handleGetDemo = () => {
        demoRegister({
            json: {
                company: 'Demo Org.',
                name: 'Demo User',
                email: `user${generateInviteCode(6)}@demo.com`,
                password: 'Demo12345678',
                plan: 'free',
                isDemo: true
            }
        })

        setIsModalOpen(false)
    }

    return (
        <>
            <DialogContainer isOpen={isModalOpen} setIsOpen={setIsModalOpen} title={t('demo-info-title')}>
                <Card className="border-none shadow-none">
                    <CardContent className="leading-5 pr-0 pl-5">
                        <p className="mb-4">{t('demo-info-description-1')}</p>
                        <div className="flex items-start">
                            <ClockAlert size={28} className="mr-2 text-amber-400" />
                            <p className="font-medium">{t('demo-info-description-2')}</p>
                        </div>
                        <p className="mb-4">{t('demo-info-description-3')}</p>
                        <div className="flex items-start">
                            <Users size={24} className="mr-2 text-sky-800"  />
                            <p className="font-medium">{t('demo-info-description-4')}</p>
                        </div>
                        <p className="mb-4">{t('demo-info-description-5')}</p>
                        <div className="flex items-start">
                            <Settings size={22} className="mr-2 text-zinc-500" />
                            <p className="font-medium">{t('demo-info-description-6')}</p>
                        </div>
                        <p className="mb-4">{t('demo-info-description-7')}</p>
                        <p className="font-medium mb-4">{t('demo-info-description-8')}</p>
                        <div className="flex items-start">
                            <Rocket size={22} className="mr-2 text-blue-600" />
                            <p className="font-medium">{t('demo-info-description-9')}</p>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex items-center justify-end gap-4">
                        <Button type="button" variant='outline' onClick={() => setIsModalOpen(false)} disabled={isPending}>{t('cancel')}</Button>
                        <Button type="submit" variant='success' onClick={handleGetDemo} disabled={isPending}>{t('create-account')}</Button>
                    </CardFooter>
                </Card>
            </DialogContainer>
            <Button className={fit ? 'w-fit' : "w-full"} size={isMobile ? 'sm' : 'lg'} type="button" variant='success' onClick={() => setIsModalOpen(true)} disabled={isPending}>{text}</Button>
        </>
    );
}

export default DemoButton;