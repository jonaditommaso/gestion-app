'use client'
import { Loader } from "lucide-react";
import { useCurrent } from "../api/use-current";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "../api/use-logout";
import { redirect } from "next/navigation";
import { Fragment, useState } from "react";
import { userButtonOptions } from "../userButtonOptions";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useProfilePicture } from "@/hooks/useProfilePicture";

const UserButton = () => {
    const { data: user, isLoading } = useCurrent();
    const { mutate: logout } = useLogout();
    const [open, setOpen] = useState(false);
    const { setTheme } = useTheme();
    const { imageUrl, isPending } = useProfilePicture();

    if(isLoading || isPending) {
        return (
            <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                <Loader className="size-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if(!user) return null;

    const { name, email } = user;

    const avatarFallback = name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase() ?? 'U';

    const handleOptionSelected = (action: 'logout' | (() => void)) => {
        setOpen(false)

        if(action === 'logout') {
            logout();
            setTheme('light');
            redirect('/')
        } else {
            action();
        }
    }

    return (
        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className="outline-none relative">
                {imageUrl
                    ? <Image
                        src={imageUrl}
                        alt="Profile picture"
                        height={50}
                        width={40}
                        className="rounded-sm object-cover border border-gray-300"
                    />
                    : (
                    <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
                        <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
                <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
                    {imageUrl
                        ? <Image
                            src={imageUrl}
                            alt="Profile picture"
                            className="rounded-sm object-cover border border-gray-300"
                            height={40}
                            width={40}
                        />
                    : (
                        <Avatar className="size-[50px] transition border border-neutral-300">
                            <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-neutral-900">{name || 'Usuario'}</p>
                        <p className="text-xs text-neutral-500">{email}</p>
                    </div>
                </div>
                {userButtonOptions.map(option => {
                    if(option.permission === 'admin' && user?.prefs.role !== 'ADMIN') return null;

                    return (
                        <Fragment key={option.key}>
                            <Separator className="my-1" />
                            <DropdownMenuItem className={`h-10 flex items-center justify-center font-medium cursor-pointer ${option.color} ${option.hoverColor}`} onClick={() => handleOptionSelected(option.action)}>
                                {option.icon} {option.text}
                            </DropdownMenuItem>
                        </Fragment>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default UserButton;