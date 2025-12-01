'use client'
import Image from 'next/image';
import { ImagePlus, Loader, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUploadImageProfile } from '../api/use-upload-image-profile';
import { useDeleteImageProfile } from '../api/use-delete-image-profile';
import { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { profilePhotoSchema } from '../schemas';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Models } from 'node-appwrite';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/hooks/use-confirm';

interface ProfilePhotoEditionProps {
    user: Models.User<Models.Preferences>
}

const ProfilePhotoEdition = ({ user }: ProfilePhotoEditionProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: uploadImageProfile, isPending } = useUploadImageProfile();
    const { mutate: deleteImageProfile, isPending: isDeleting } = useDeleteImageProfile();
    const { imageUrl, isPending: isProfilePicturePending } = useProfilePicture();
    const t = useTranslations('settings');
    const [isHovered, setIsHovered] = useState(false);
    const [ConfirmDialog, confirm] = useConfirm(
        t('delete-photo'),
        t('delete-photo-confirmation'),
        'destructive'
    );

    const avatarFallback = user?.name.charAt(0).toUpperCase() ?? 'U';

    const form = useForm<zod.infer<typeof profilePhotoSchema>>({
        resolver: zodResolver(profilePhotoSchema),
    });

    const onSubmit = async (values: zod.infer<typeof profilePhotoSchema>) => {

        const formData = new FormData();

        if (values.image) {
            formData.append('image', values.image);
        }

       uploadImageProfile(formData);
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            form.setValue('image', file);

            form.handleSubmit(onSubmit)();
        }
    }

    const handleDeletePhoto = async () => {
        const ok = await confirm();
        if (ok) {
            deleteImageProfile();
        }
    }

    if(isProfilePicturePending) {
        return (
            <div className="w-40 h-40 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                <Loader className="size-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <>
            <ConfirmDialog />
            <div className="relative w-40 h-40 group">
                {imageUrl
                    ? (
                        <>
                            <div
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={imageUrl}
                                    alt="Profile picture"
                                    fill
                                    className="rounded-full object-cover border border-gray-300"
                                />
                                <div
                                    className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
                                        isHovered ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    onClick={handleDeletePhoto}
                                >
                                    <Trash2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </>
                    )
                    : (
                        <Avatar className="size-40 transition border border-neutral-300">
                            <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center text-5xl">
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                    )
                }

                <Form {...form}>
                    <form encType='multipart/form-data'>
                        <div className="absolute bottom-[-20px] left-0 right-0 flex justify-center z-10">
                            <input
                                className='hidden'
                                type='file'
                                name='image'
                                accept='.jpg, .png, .jpeg, .svg'
                                ref={inputRef}
                                onChange={handleImageChange}
                            />
                            <Button
                                size="sm"
                                variant='outline'
                                type='button'
                                disabled={isPending || isDeleting}
                                onClick={() => inputRef.current?.click()}
                            >
                                {imageUrl ? <Pencil className="w-4 h-4 mr-1" /> : <ImagePlus className="w-4 h-4 mr-1" />}
                                {imageUrl ? t('change-photo') : t('add-photo')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-9">
                {t('image-requirements')}
            </p>
        </>
    );
}

export default ProfilePhotoEdition;