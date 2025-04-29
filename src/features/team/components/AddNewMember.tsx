'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useInviteMember } from "../api/use-invite-member";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleCheckBig, CopyIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FadeLoader from "react-spinners/FadeLoader";
import { Models } from "node-appwrite";
import NoTeamWarningIcon from "./NoTeamWarningIcon";

interface AddNewMemberProps {
    user: Models.User<Models.Preferences>
}

const AddNewMember = ({ user }: AddNewMemberProps) => { //we receive the user quickly from server component
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: inviteMember, isPending, data, reset } = useInviteMember();
    const t = useTranslations('team');

    const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { elements } = event.currentTarget

        const emmailInput = elements.namedItem('email-invitation');

        const isInput = emmailInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        inviteMember({
            json: {
                email: emmailInput.value
            }
        });

        emmailInput.value = ''
    }

    const handleCopy = async () => {
        if (!data) return;
        try {
          await navigator.clipboard.writeText(data.invitationUrl)

        } catch (err) {
          console.error('Error copiando al portapapeles:', err)
        }
    }

    const handleClose = (open: boolean) => {
        if (!open) {
          reset(); // <- limpia el estado del mutation
        }
        setIsOpen(open); // <- luego actualizás el estado original
    };

    return (
        <div>
            <DialogContainer
                isOpen={isOpen}
                setIsOpen={handleClose}
                title={t('add-new-member-title')}
                description={t('add-new-member-description')}
                //description="Ingresa el mail al que se enviara la invitacion"
            >
                {!data
                    ? (isPending
                        ? (
                            <div className="w-full flex justify-center">
                                <FadeLoader color="#999" width={3} className="my-[10px]" />
                            </div>
                        ) : (
                            <form onSubmit={handleInvite}>
                                <div className="flex flex-col gap-4">
                                    <Input type="email" placeholder="Email..." name="email-invitation" />
                                    <div className="flex items-center justify-end gap-2">
                                        <Button onClick={() => setIsOpen(false)} variant='outline' type="button" disabled={isPending}>{t('cancel')}</Button>
                                        <Button disabled={isPending}>{t('generate-url')}</Button>
                                    </div>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="max-w-[500px] gap-4 flex flex-col">
                            <Alert variant='success' className="w-full">
                                <CircleCheckBig className="h-4 w-4" />
                                <AlertTitle>{t('invitation-url-generated')}</AlertTitle>
                            </Alert>
                            <div className="flex items-center justify-between border rounded-md p-1">
                                <p className="text-sm text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap w-[80%] select-none">{data.invitationUrl}</p>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' onClick={handleCopy}>
                                            <CopyIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-fit p-1">
                                        {t('copied')}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )
                }
            </DialogContainer>
            <div className="flex items-center gap-2">
                {!user.prefs.company && <NoTeamWarningIcon />}
                <Button disabled={!user.prefs.company} onClick={() => setIsOpen(true)}>+ {t('add-new-member')}</Button>
            </div>
        </div>
    );
}

export default AddNewMember;