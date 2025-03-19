'use client'
import { useGetRecords } from "@/features/records/api/use-get-records";
import { RecordsContextType } from "@/features/records/types";
import { createContext } from "react";

export const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

interface RecordsContextProviderProps {
    children: React.ReactNode
}

const INITIAL_STATE = { documents: [], total: 0 }

const RecordsContextProvider = ({ children }: RecordsContextProviderProps) => {
    const { data = INITIAL_STATE, isPending } = useGetRecords();

    return (
        <RecordsContext.Provider value={{ data, isPending }}>
            {children}
        </RecordsContext.Provider>
    );
}

export default RecordsContextProvider;