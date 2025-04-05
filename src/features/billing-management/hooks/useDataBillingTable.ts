import { billingServiceObserver } from "@/utils/billingServiceObserver"
import { useEffect, useState } from "react"

export const useDataBillingTable = () => {
    const [selectedData, setSelectedData] = useState('total')

    useEffect(() => {
      const subscription = billingServiceObserver.getData().subscribe(data => setSelectedData(data))

      return () => subscription.unsubscribe()
    }, [])

    return { selectedData }
}