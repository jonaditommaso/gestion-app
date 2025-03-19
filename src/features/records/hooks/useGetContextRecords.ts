import { RecordsContext } from "@/context/RecordsContext"
import { useContext } from "react"

export const useGetContextRecords = () => {
    const recordsContext = useContext(RecordsContext)

    if (!recordsContext) throw new Error("useGetContextRecords must be used within a RecordsContextProvider");

    return recordsContext;
}