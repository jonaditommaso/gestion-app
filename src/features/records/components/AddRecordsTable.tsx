import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FormEvent } from "react";

interface AddRecordsTableProps {
    onCreateTable: (event: FormEvent<HTMLFormElement>) => void,
    isModal?: boolean,
    isCreating: boolean
}

const AddRecordsTable = ({ onCreateTable, isModal, isCreating }: AddRecordsTableProps) => {
    const t = useTranslations('records')

    return (
        <div>
            {!isModal && <p className="text-xl text-primary font-semibold text-center my-4">{t('create-records-table')}</p>}
            <form onSubmit={onCreateTable}>
                <div className="flex flex-col gap-4">
                    <Input name="records-table" placeholder={t('my-table-placeholder')} />
                    <Button className="w-[100%]" type="submit" disabled={isCreating}>
                        {t('add')}
                    </Button>
                </div>
                {!isModal && (
                    <div className="mt-20">
                        <Image width={400} height={400} alt='no table' src={'/adding-records.svg'} />
                    </div>
                )}
            </form>
        </div>
    );
}

export default AddRecordsTable;