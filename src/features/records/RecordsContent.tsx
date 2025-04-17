'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRecords } from "./AddRecords";
import { DataTable } from "./DataTable";
import FadeLoader from "react-spinners/FadeLoader";
import { Button } from "@/components/ui/button";
import { List, Plus } from 'lucide-react';
import { TooltipContainer } from "@/components/TooltipContainer";
import { useGetContextRecords } from "./hooks/useGetContextRecords";
import NoData from "../../components/NoData";
import { FormEvent, useState } from "react";
import AddRecordsTableModal from "./components/AddRecordsTableModal";
import { useCreateRecordsTable } from "./api/use-create-records-table";
import { useTranslations } from "next-intl";
import AddRecordsTable from "./components/AddRecordsTable";
import ListTablesModal from "./components/ListTablesModal";

const RecordsContent = () => {
    const { data: dataRecords, isPending } = useGetContextRecords()
    const [createTableModalIsOpen, setCreateTableModalIsOpen] = useState(false);
    const [editTablesModalIsOpen, setEditTablesModalIsOpen] = useState(false);
    const { mutate: createTable, isPending: isCreatingTable } = useCreateRecordsTable();
    const t = useTranslations('records')

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
                isCreating={isCreatingTable}
            />
            <ListTablesModal
                isOpen={editTablesModalIsOpen}
                setIsOpen={setEditTablesModalIsOpen}
                tables={dataRecords.documents}
            />
            {dataRecords.total === 0
                ? (
                    <AddRecordsTable onCreateTable={onCreateTable} isCreating={isCreatingTable} />
                )
            : (
                <Tabs value={currentTab ?? dataRecords.documents[0]?.$id} onValueChange={value => setCurrentTab(value)} className="w-[800px]">
                    <div className="flex justify-between">
                        <TabsList className="flex">
                            {dataRecords.documents.map(tab => (
                                <TabsTrigger value={tab.$id} key={tab.$id}>{tab.tableName}</TabsTrigger>
                            ))}
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <TooltipContainer tooltipText={t('see-tables')}>
                                <Button variant="outline" size="icon" onClick={() => setEditTablesModalIsOpen(true)} disabled={dataRecords.total >= 3}>
                                    <List className="h-[1.2rem] w-[1.2rem]" />
                                </Button>
                            </TooltipContainer>
                            <TooltipContainer tooltipText={t('add-table')}>
                                <Button variant="outline" size="icon" onClick={() => setCreateTableModalIsOpen(true)} disabled={dataRecords.total >= 3}>
                                    <Plus className="h-[1.2rem] w-[1.2rem]" />
                                </Button>
                            </TooltipContainer>
                            <AddRecords currentRecordTable={currentTab} thereIsTable={dataRecords.total > 0} />
                        </div>
                    </div>
                    <div className="mt-20">
                        {dataRecords.documents.map(record => (
                            <TabsContent value={record.$id} key={record.$id}>
                                {record.rows?.length === 0
                                    ? <NoData title="empty-table" description="no-records" />
                                    : <DataTable
                                        headers={isPending ? [] : (record?.headers ?? [])}
                                        rows={isPending ? [] : (record?.rows ?? [])}
                                    />
                                }
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            )}
        </div>
    );
}

export default RecordsContent;