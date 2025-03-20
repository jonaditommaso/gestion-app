'use client'
import { useEffect, useState } from "react";
import { BillingTable } from "../BillingTable";
import InfoCard from "../InfoCard";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { dataServiceObserver } from "@/utils/dataServiceObserver";
import Image from "next/image";

const BillingDashboard = () => {
    const [currentView, setCurrentView] = useState('details')

    useEffect(() => {
      const subscription = dataServiceObserver.getData().subscribe(data => setCurrentView(data))

      return () => subscription.unsubscribe()
    }, [])

    const views = {
        details: <>
            <div className="flex justify-center">
                <InfoCard Icon={TrendingUp} colorIcon='#0bb314' numberMoney={13200} />
                <InfoCard Icon={TrendingDown} colorIcon='#f03410' numberMoney={1200} />
                <InfoCard Icon={Scale} colorIcon='#3f51b5' numberMoney={12000} />
            </div>
            <div className="w-[900px] mt-10">
                <BillingTable />
            </div>
        </>,
    }

    return (
        <div className="flex flex-col items-center w-full">
           {views[currentView as keyof typeof views]
            ?? (
                <div>
                    <Image src={'/working.svg'} alt='working' width={600} height={600} />
                    <p className="p-4 text-center">Estamos trabajando en ello</p>
                </div>
            )
           }
        </div>
    );
}

export default BillingDashboard;