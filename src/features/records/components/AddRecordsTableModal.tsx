import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dispatch, FormEvent, SetStateAction } from "react";

interface AddRecordsTableModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    onCreateTable: (event: FormEvent<HTMLFormElement>) => void
}

const AddRecordsTableModal = ({ isOpen, setIsOpen, onCreateTable }: AddRecordsTableModalProps) => {

    return (
        <DialogContainer
            title="Create new records table"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <form onSubmit={onCreateTable}>
                <div className="flex flex-col gap-4">
                    <Input name="records-table" />
                    <Button className="w-[100%]" type="submit">
                        Agregar
                    </Button>
                </div>
            </form>
        </DialogContainer>
    );
}

export default AddRecordsTableModal;