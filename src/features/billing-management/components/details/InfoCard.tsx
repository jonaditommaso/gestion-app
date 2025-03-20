import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleIcon } from "./CircleIcon";

interface InfoCardProps {
    Icon: React.ElementType,
    colorIcon: string,
    numberMoney: number
}

const InfoCard = ({ Icon, colorIcon, numberMoney }: InfoCardProps) => {
    return (
        <Card className="min-w-48 m-2">
            <CardContent className="flex flex-col items-center mt-4">
                <div className="mb-3">
                    <CircleIcon Icon={Icon} color={colorIcon} />
                </div>
                <p className="text-3xl ">
                    <span className="text-xl">€</span> {numberMoney} <span className="text-xs">+3%</span>
                </p>
            </CardContent>
            <CardFooter>
                <Button variant='link' size='sm'>Ver más</Button>
            </CardFooter>
        </Card>
    );
}

export default InfoCard;