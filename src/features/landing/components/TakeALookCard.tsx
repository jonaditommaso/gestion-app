import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

interface TakeALookCardProps {
    title: string;
    image: string;
    altImage: string;
}

const TakeALookCard = ({ title, image, altImage }: TakeALookCardProps) => {
    return (
        <Card className="w-[400px] h-[320px] flex flex-col items-center justify-center">
            <CardContent className="p-4">
            <Image width={400} height={400} alt={altImage} src={image} />
            </CardContent>
            <CardFooter className="text-[#9a3e6a] font-semibold">{title}</CardFooter>
        </Card>
    );
}

export default TakeALookCard;