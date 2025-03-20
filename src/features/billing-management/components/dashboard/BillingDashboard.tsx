'use client'
import { useEffect, useState } from "react";
import { BillingTable } from "../details/BillingTable";
import { dataServiceObserver } from "@/utils/dataServiceObserver";
import Image from "next/image";
import DetailsInfoCards from "../details/DetailsInfoCards";

const BillingDashboard = () => {
    const [currentView, setCurrentView] = useState('details')

    useEffect(() => {
      const subscription = dataServiceObserver.getData().subscribe(data => setCurrentView(data))

      return () => subscription.unsubscribe()
    }, [])

    const views = {
        details: <>
            <DetailsInfoCards />
            <BillingTable />
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