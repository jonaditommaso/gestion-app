'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { Cake, EllipsisVertical, MessageSquareText, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import FadeLoader from "react-spinners/FadeLoader";

interface MemberCardProps {
    name: string,
    email: string,
    position: string,
    tags: string[],
    userId: string,
    image: string,
    role: 'SUPERADMIN' | 'ADMIN' | 'CREATOR'
}

const ImageMock = ({name}: {name: string}) => (
    <div className="w-full h-[200px] bg-slate-200 rounded-md rounded-b-none text-6xl text-neutral-500 flex items-center justify-center">
        {name.charAt(0).toUpperCase()}
    </div>
)

const MemberCard = ({ name, email, position, tags = [], userId, image }: MemberCardProps) => {
    const { imageUrl, isPending } = useProfilePicture(userId);
    const t = useTranslations('team')

    return (
        <Card className="w-[300px]">
            {!image && <ImageMock name={name} />}
            {isPending
                ? (
                    <div className='h-[200px]'>
                        <FadeLoader color="#999" width={3} className="mt-2 m-auto" />
                    </div>
                )
                : imageUrl && <Image src={imageUrl} alt={`profile member ${name} picture`} className="object-cover" height={200} width={300} />
            }

            <CardContent className="flex flex-col gap-10 px-2">
                <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="flex flex-col items-center">
                        <p className="text-xl font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                    <div className="border p-1 px-2 rounded-md border-green-600 bg-green-100 text-green-600">
                        {position}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <Users className="size-5 " />
                    </div>
                    <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <Cake className="size-5 " />
                    </div>
                    <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <MessageSquareText className="size-5 " />
                    </div>
                    <div className="cursor-pointer bg-transparent hover:bg-secondary rounded-full p-2">
                        <EllipsisVertical className="size-5 " />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pb-2">
                <div className="flex w-full justify-center items-center gap-2 text-blue-600">
                    {tags?.map((tag, index) => (
                        <p key={index}>{tag}</p>
                    ))}
                    {tags.length < 3 && (
                        <Button variant='outline' className="border-blue-600 py-0 px-5 hover:text-blue-500 transition-colors duration-150" size='sm'>+ {t('add-tag')}</Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

export default MemberCard;