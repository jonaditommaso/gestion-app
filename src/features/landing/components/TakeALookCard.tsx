import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

interface TakeALookCardProps {
    title: string;
    image: string;
    altImage: string;
}

const TakeALookCard = ({ title, image, altImage }: TakeALookCardProps) => {
    return (
        <Card className="w-[400px] h-[250px] flex flex-col items-center justify-center max-sm:w-[300px] max-sm:h-[200px]">
            <CardContent className="p-4 pt-0">
                <Image width={400} height={400} alt={altImage} src={image} className="border rounded-md" />
            </CardContent>
            <CardFooter className="text-[#9a3e6a] font-semibold p-0">{title}</CardFooter>
        </Card>
    );
}

export default TakeALookCard;