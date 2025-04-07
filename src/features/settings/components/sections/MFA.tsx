'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useGetMfaQr } from "../../api/use-get-mfa-qr";
import { useCreateMfa } from "../../api/use-create-mfa";
import { toast } from "sonner";
import CustomLoader from "@/components/CustomLoader";

const MFA = ({ hasMFA }: { hasMFA: boolean | undefined }) => {
    const [qrModalIsOpen, setQrModalIsOpen] = useState(false);
    const { mutate, data, isSuccess } = useGetMfaQr();
    const { mutate: createMfa, isPending } = useCreateMfa();

    const activateMFA = () => {
        setQrModalIsOpen(true)
        mutate();
    }

    const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget
        const mfaInput = elements.namedItem('mfa-code');

        const isInput = mfaInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        if (mfaInput.value.length !== 6) {
            toast.error('No ingresaste 6 digitos')
            return;
        }

        createMfa({
            json: { mfaCode: mfaInput.value }
        })

        mfaInput.value = ''
        setQrModalIsOpen(false);
    }

    return (
        <div className="flex items-center gap-2">
            <DialogContainer isOpen={qrModalIsOpen} setIsOpen={setQrModalIsOpen} title="Verificacion en 2 pasos" description="Escanea el QR con tu aplicacion de autenticacion e ingresa el codigo">
                <div className="w-full flex justify-center">
                    {isSuccess
                        ? <Image
                            src={data?.qr}
                            alt="QR para Google Authenticator"
                            width={170}
                            height={170}
                        />
                        : <div className="h-[170px]">
                            <CustomLoader />
                        </div>
                    }

                </div>
                <form onSubmit={handleVerify} className="flex flex-col m-auto mt-4">
                    <Label className="mb-2">Ingresa el código de <span className="font-semibold">6</span> dígitos</Label>
                    <Input name="mfa-code" className="text-center text-xl" maxLength={6} />
                    <Button type="submit" className="mt-2" disabled={!isSuccess || isPending}>Verificar</Button>
                </form>
            </DialogContainer>
            {!hasMFA && <TriangleAlert className="text-yellow-400" />}
            <Button
                variant='outline'
                className={cn(hasMFA ? 'border-green-400' : "border-yellow-400")}
                onClick={activateMFA}
                disabled={hasMFA}
            >
                {hasMFA ? 'Verificado' : 'Verificar'}
            </Button>
        </div>
    );
}

export default MFA;