import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMembersSafe } from "@/context/MembersContext";

interface MemberAvatarProps {
    name: string;
    className?: string;
    fallbackClassName?: string;
    memberId?: string;
    photoUrl?: string;
}

const MemberAvatar = ({ name, fallbackClassName, className, memberId, photoUrl }: MemberAvatarProps) => {
    const { getMemberPhoto } = useMembersSafe();

    // Usar photoUrl pasada directamente, o buscar en el contexto por memberId
    const imageUrl = photoUrl || (memberId ? getMemberPhoto(memberId) : undefined);

    return (
        <Avatar className={cn('size-5 transition border border-neutral-300 rounded-full', className)}>
            {imageUrl && (
                <AvatarImage
                    src={imageUrl}
                    alt={name}
                    className="object-cover"
                />
            )}
            <AvatarFallback className={cn('bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center', fallbackClassName)}>
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
}

export default MemberAvatar;