'use client'
import { useUpdateUsername } from "@/features/auth/api/use-update-username";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserName = ({ name }: { name: string }) => {
    const { mutate: updateUsername, isPending } = useUpdateUsername()

    const [userName, setUserName] = useState(name ?? '')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value)
    }

    const handleSave = () => {
        updateUsername({
            json: { userName }
        })
    }

    const handleCancel = () => {
        setUserName(name)
    }

    return (
        <div className="relative">
            <Input type="text" className="w-[200px]" value={userName} onChange={handleChange} />
            {userName !== name && (
                <div className="absolute left-full -translate-y-9 ml-2">
                    <div className="flex gap-2">
                        <Button
                            variant='success'
                            onClick={handleSave}
                            disabled={isPending || userName.length < 3}
                        >
                            Guardar
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserName;