'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRecords } from "./AddRecords";
import { BillingTable } from "../billing-management/components/BillingTable";
import { useGetRecords } from "./api/use-get-records";
import { DataTable } from "./DataTable";
import FadeLoader from "react-spinners/FadeLoader";

const initial_state = { documents: [], total: 0 }

const RecordsContent = () => {
    const {data = initial_state, isPending } = useGetRecords();

    if(isPending) return <FadeLoader color="#999" width={3} />

    const record = data?.documents[0]

    return (
        <div className="">
            <Tabs defaultValue="table-1" className="w-[800px]">
                <div className="flex">
                    <TabsList className="flex">
                        <TabsTrigger value="table-1">Tabla 1</TabsTrigger>
                        <TabsTrigger value="table-2">Tabla 2</TabsTrigger>
                    </TabsList>
                    <AddRecords />
                </div>
                <div className="mt-20">
                    <TabsContent value="table-1">
                        {data.total > 0
                        ? <DataTable
                            headers={isPending ? [] : record?.headers}
                            rows={isPending ? [] : record?.rows}
                          />
                        : <p className="text-neutral-500 text-center">Aún no existen registros</p>
                        }
                    </TabsContent>
                    <TabsContent value="table-2">
                        <BillingTable />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

export default RecordsContent;