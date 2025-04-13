'use client'
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrent } from '@/features/auth/api/use-current';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUploadImageProfile } from '../api/use-upload-image-profile';
import { useMemo, useRef } from 'react';
import { useForm } from "react-hook-form";
import { profilePhotoSchema } from '../schemas';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';

const ProfilePhotoEdition = () => {
    const { data: user } = useCurrent();
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: uploadImageProfile, isPending } = useUploadImageProfile();

    const avatarFallback = user?.name.charAt(0).toUpperCase() ?? 'U';

    const image = useMemo(() => user?.prefs.image, [user]);

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
            {user?.prefs.image
                ? <Image
                    src={image instanceof File ? URL.createObjectURL(image): image}
                    alt="Foto de perfil"
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