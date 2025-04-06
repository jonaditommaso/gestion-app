import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfilePhotoEdition = () => {
    return (
        <div className="relative w-40 h-40 group">
            <Image
                src="/home-2.svg"
                alt="Foto de perfil"
                fill
                className="rounded-full object-cover border border-gray-300"
            />

            <div className="absolute bottom-[-20px] left-0 right-0 flex justify-center">
                <Button
                    size="sm"
                    variant='outline'
                >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                </Button>
            </div>
        </div>
    );
}

export default ProfilePhotoEdition;