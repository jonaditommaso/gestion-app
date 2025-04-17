'use client'

import { DialogContainer } from "@/components/DialogContainer";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useState } from "react";
import RecordsTableRow from "./RecordsTableRow";

interface ListTablesModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    tables: {
        tableName: string,
        $id: string
    }[]
}

const ListTablesModal = ({ isOpen, setIsOpen, tables }: ListTablesModalProps) => {
    const [editingTable, setEditingTable] = useState<undefined | number>(undefined);
    const t = useTranslations('records');

    return (
        <DialogContainer
            title={t('your-tables')}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            {tables?.map((table, index) => (
                    <RecordsTableRow
                        index={index}
                        id={table.$id}
                        tableName={table.tableName}
                        key={table.$id}
                        editingTable={editingTable}
                        setEditingTable={setEditingTable}
                        setIsOpen={setIsOpen}
                        actionDisabled={editingTable !== undefined && editingTable !== index}
                    />
                ))
            }
        </DialogContainer>
    );
}

export default ListTablesModal;