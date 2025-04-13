'use client'
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUploadImageProfile } from '../api/use-upload-image-profile';
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { profilePhotoSchema } from '../schemas';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Models } from 'node-appwrite';
import { useGetImageProfile } from '../api/use-get-image-profile';

interface ProfilePhotoEditionProps {
    user: Models.User<Models.Preferences>
}

const ProfilePhotoEdition = ({ user }: ProfilePhotoEditionProps) => {
    const [imageUrl, setImageUrl] = useState<any>(undefined);
    const {mutate: getImageProfile } = useGetImageProfile()
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: uploadImageProfile, isPending } = useUploadImageProfile();

    useEffect(() => {
        getImageProfile(undefined, {
            onSuccess: (blob) => {
              const url = URL.createObjectURL(blob);
              setImageUrl(url);
            },
            onError: (err) => {
              console.error('No se pudo obtener la imagen:', err);
            }
          })
    }, []);

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
            console.log(file)
            form.setValue('image', file);

            form.handleSubmit(onSubmit)();
        }
    }

    return (
        <div className="relative w-40 h-40 group">
            {imageUrl
                ? <Image
                    src={imageUrl}
                    alt="Profile picture"
                    fill
                    className="rounded-full object-cover border border-gray-300"
                />
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
                    <div className="absolute bottom-[-20px] left-0 right-0 flex justify-center">
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
                            disabled={isPending}
                            onClick={() => inputRef.current?.click()}
                        >
                            <Pencil className="w-4 h-4 mr-1" />
                            {/* {t('edit')} */}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default ProfilePhotoEdition;