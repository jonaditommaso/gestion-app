import { dataServiceObserver } from "@/utils/dataServiceObserver"
import { useEffect, useState } from "react"

export const useCurrentView = () => {
    const [currentView, setCurrentView] = useState('details')

    useEffect(() => {
      const subscription = dataServiceObserver.getData().subscribe(data => setCurrentView(data))

      return () => subscription.unsubscribe()
    }, [])

    return { currentView }
}