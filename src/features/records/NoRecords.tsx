import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FolderOpen } from "lucide-react";
import Image from "next/image";

const NoRecords = () => {
    return (
        <>
            <Alert variant='default'>
                <FolderOpen className="h-4 w-4" />
                <AlertTitle>Empty table</AlertTitle>
                <AlertDescription>
                    No tienes registros en esta tabla. Agrega al menos uno para ver un resultado.
                </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-20">
                <Image width={400} height={400} alt='empty image' src={'/empty.svg'} />
            </div>
        </>
    );
}

export default NoRecords;