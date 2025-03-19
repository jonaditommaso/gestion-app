'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRecords } from "./AddRecords";
import { BillingTable } from "../billing-management/components/BillingTable";
import { DataTable } from "./DataTable";
import FadeLoader from "react-spinners/FadeLoader";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from 'lucide-react';
import { TooltipContainer } from "@/components/TooltipContainer";
import { useGetContextRecords } from "./hooks/useGetContextRecords";

const RecordsContent = () => {
    const { data: dataRecords, isPending } = useGetContextRecords()

    const tabs = [
        { id: 'table-1', name: 'Tabla 1' },
        { id: 'table-2', name: 'Tabla 2' }
    ]

    if(isPending) return <FadeLoader color="#999" width={3} className="mt-5" />

    const record = dataRecords?.documents[0]

    return (
        <div className="">
            <Tabs defaultValue="table-1" className="w-[800px]">
                <div className="flex justify-between">
                    <TabsList className="flex">
                        {tabs.map(tab => (
                            <TabsTrigger value={tab.id} key={tab.id}>{tab.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <TooltipContainer tooltipText="Agregar tabla">
                            <Button variant="outline" size="icon">
                                <Plus className="h-[1.2rem] w-[1.2rem]" />
                            </Button>
                        </TooltipContainer>
                        <TooltipContainer tooltipText="Editar tablas">
                            <Button variant="outline" size="icon">
                                <Pencil className="h-[1.2rem] w-[1.2rem]" />
                            </Button>
                        </TooltipContainer>
                        <AddRecords />
                    </div>
                </div>
                <div className="mt-20">
                    <TabsContent value="table-1">
                        {dataRecords.total > 0
                        ? <DataTable
                            headers={isPending ? [] : (record?.headers ?? [])}
                            rows={isPending ? [] : (record?.rows ?? [])}
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