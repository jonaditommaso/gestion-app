import { Button, ButtonProps } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import { useState } from "react"

export const useConfirm = (
    title: string,
    message:string,
    variant:ButtonProps['variant'] = 'default'
): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
    const t = useTranslations('common');

    const confirm = () => {
        return new Promise(resolve => {
            setPromise({ resolve })
        })
    }

    const handleClose = () => {
        setPromise(null)
    }

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose()
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose()
    }

    const ConfirmationDialog = () => (
        <Dialog open={promise !== null} onOpenChange={handleClose}>
            <DialogContent>
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                <Card className="w-full h-full border-none shadow-none">
                    <CardContent className="pt-8">
                        <CardHeader className="p-0">
                            <CardTitle>
                                {title}
                            </CardTitle>
                            <CardDescription>
                                {message}
                            </CardDescription>
                        </CardHeader>
                        <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                            <Button onClick={handleCancel} variant='outline' className="w-full lg:w-auto">
                                {t('cancel')}
                            </Button>
                            <Button onClick={handleConfirm} variant={variant} className="w-full lg:w-auto">
                                {t('confirm')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )

    return [ConfirmationDialog, confirm]

}
