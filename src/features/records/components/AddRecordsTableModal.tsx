'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { useTranslations } from "next-intl";
import { Dispatch, FormEvent, SetStateAction } from "react";
import AddRecordsTable from "./AddRecordsTable";

interface AddRecordsTableModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    onCreateTable: (event: FormEvent<HTMLFormElement>) => void,
    isCreating: boolean
}

const AddRecordsTableModal = ({ isOpen, setIsOpen, onCreateTable, isCreating }: AddRecordsTableModalProps) => {
    const t = useTranslations('records')

    return (
        <DialogContainer
            title={t('create-records-table')}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <AddRecordsTable onCreateTable={onCreateTable} isModal isCreating={isCreating} />
        </DialogContainer>
    );
}

export default AddRecordsTableModal;