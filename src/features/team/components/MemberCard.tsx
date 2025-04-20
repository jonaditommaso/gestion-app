'use client'
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { EllipsisVertical, MessageSquareText, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import FadeLoader from "react-spinners/FadeLoader";
import TagsMember from "./TagsMember";
import BirthdayMember from "./BirthdayMember";

interface MemberCardProps {
    name: string,
    email: string,
    position: string,
    tags: string[],
    userId: string,
    image: string,
    role: 'SUPERADMIN' | 'ADMIN' | 'CREATOR',
    birthday: string
}

const ImageMock = ({name}: {name: string}) => (
    <div className="w-full h-[200px] bg-slate-200 rounded-md rounded-b-none text-6xl text-neutral-500 flex items-center justify-center">
        {name.charAt(0).toUpperCase()}
    </div>
)

const MemberCard = ({ name, email, position = 'not-specified', tags = [], userId, image, birthday }: MemberCardProps) => {
    const { imageUrl, isPending } = useProfilePicture(userId);
    const t = useTranslations('team');

    return (
        <Card className="w-[300px] bg-sidebar">
            {!image && <ImageMock name={name} />}
            {isPending
                ? (
                    <div className='h-[200px]'>
                        <FadeLoader color="#999" width={3} className="mt-5 m-auto" />
                    </div>
                )
                : imageUrl && <Image src={imageUrl} alt={`profile member ${name} picture`} className="object-cover" height={200} width={300} />
            }

            <CardContent className="flex flex-col gap-5 px-2">
                <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="flex flex-col items-center">
                        <p className="text-lg font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                    <div className="border p-1 px-2 rounded-md border-green-600 bg-green-100 text-green-600 text-sm">
                        {position ? position : t(position)}
                    </div>
                    <Separator />
                </div>
                <div className="flex justify-end gap-2">
                    {/* <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <Users className="size-5 " />
                    </div> */}
                    <BirthdayMember birthday={birthday} />
                    <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <MessageSquareText className="size-5 " />
                    </div>
                    {/* <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <EllipsisVertical className="size-5 " />
                    </div> */}
                </div>
            </CardContent>
            <CardFooter className="pb-2">
                <TagsMember tags={tags} />
            </CardFooter>
        </Card>
    );
}

export default MemberCard;