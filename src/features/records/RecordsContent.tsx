'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRecords } from "./AddRecords";
import { DataTable } from "./DataTable";
import FadeLoader from "react-spinners/FadeLoader";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from 'lucide-react';
import { TooltipContainer } from "@/components/TooltipContainer";
import { useGetContextRecords } from "./hooks/useGetContextRecords";
import NoRecords from "./NoRecords";
import { FormEvent, useState } from "react";
import AddRecordsTableModal from "./components/AddRecordsTableModal";
import { useCreateRecordsTable } from "./api/use-create-records-table";

const RecordsContent = () => {
    const { data: dataRecords, isPending } = useGetContextRecords()
    const [createTableModalIsOpen, setCreateTableModalIsOpen] = useState(false);
    const { mutate: createTable } = useCreateRecordsTable()

    const [currentTab, setCurrentTab] = useState(dataRecords.documents[0]?.$id)

    if(isPending) return <FadeLoader color="#999" width={3} className="mt-5" />

    const onCreateTable = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget

        const tableNameInput = elements.namedItem('records-table');

        const isInput = tableNameInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        createTable({
            json: {
                tableName: tableNameInput.value
            }
        })

        tableNameInput.value = ''
        setCreateTableModalIsOpen(false)
    }

    return (
        <div className="">
            <AddRecordsTableModal
                isOpen={createTableModalIsOpen}
                setIsOpen={setCreateTableModalIsOpen}
                onCreateTable={onCreateTable}
            />
            <Tabs value={currentTab ?? dataRecords.documents[0]?.$id} onValueChange={value => setCurrentTab(value)} className="w-[800px]">
                <div className="flex justify-between">
                    <TabsList className="flex">
                        {dataRecords.documents.map(tab => (
                            <TabsTrigger value={tab.$id} key={tab.$id}>{tab.tableName}</TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <TooltipContainer tooltipText="Agregar tabla">
                            <Button variant="outline" size="icon" onClick={() => setCreateTableModalIsOpen(true)} disabled={dataRecords.total >= 3}>
                                <Plus className="h-[1.2rem] w-[1.2rem]" />
                            </Button>
                        </TooltipContainer>
                        {/* <TooltipContainer tooltipText="Editar tablas">
                            <Button variant="outline" size="icon">
                                <Pencil className="h-[1.2rem] w-[1.2rem]" />
                            </Button>
                        </TooltipContainer> */}
                        <AddRecords currentRecordTable={currentTab} />
                    </div>
                </div>
                <div className="mt-20">
                    {dataRecords.documents.map(record => (
                        <TabsContent value={record.$id} key={record.$id}>
                            {record.rows?.length === 0
                                ? <NoRecords />
                                : <DataTable
                                    headers={isPending ? [] : (record?.headers ?? [])}
                                    rows={isPending ? [] : (record?.rows ?? [])}
                                />
                            }
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}

export default RecordsContent;