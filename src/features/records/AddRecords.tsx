'use client'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ChevronDown, FilePenLine, Upload } from "lucide-react"
import AddRecordsInputs from "./AddRecordsInputs"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { DialogContainer } from "@/components/DialogContainer"
import ExcelUploader from "./ExcelUploader";
import { useTranslations } from "next-intl"
import { useAddHeaders } from "./api/use-add-headers"
import { useGetContextRecords } from "./hooks/useGetContextRecords"
import { useAddRecords } from "./api/use-add-records"
import { ValidationErrorDialog } from "./components/ValidationErrorDialog"

const INITIAL_RECORDS_STATE = [{ field: '', value: '' }];

interface AddRecordsProps {
    currentRecordTable: string,
    thereIsTable: boolean
}

export function AddRecords({ currentRecordTable, thereIsTable }: AddRecordsProps) {
    const [recordData, setRecordData] = useState(INITIAL_RECORDS_STATE);
    const [isOpen, setIsOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [validationErrorOpen, setValidationErrorOpen] = useState(false);
    const { data: dataRecords } = useGetContextRecords();
    const { mutate: addHeaders, isPending: addingRecords } = useAddHeaders();
    const { mutate: addRecords } = useAddRecords(); //todo: should to use isPending from this hook too
    const t = useTranslations('records');

    const onChangeSheet = (isSheetOpen: boolean) => {
        setSheetOpen(isSheetOpen);
        if (!isSheetOpen) setRecordData(INITIAL_RECORDS_STATE);
    }

    const onSave = () => {
        // Filtrar pares completamente vacíos
        const validRecords = recordData.filter(record =>
            record.field.trim() !== '' || record.value.trim() !== ''
        );

        // Validar que no haya valores sin campo asignado
        const invalidRecords = validRecords.filter(record =>
            record.field.trim() === '' && record.value.trim() !== ''
        );

        if (invalidRecords.length > 0) {
            setValidationErrorOpen(true);
            return;
        }

        // Si no hay registros válidos después de filtrar, no hacer nada
        if (validRecords.length === 0) {
            return;
        }

        const headers: string[] = [];
        const rows: string[] = [];

        validRecords.forEach(record => {
            headers.push(record.field);
            rows.push(record.value)
        })

        const transformedRow: Record<string, string> = {};

        headers.forEach((header, index) => {
          transformedRow[header] = rows[index];
        });

        const recordToEdit = dataRecords.documents.find(record => record.$id === currentRecordTable);
        const existingRows = recordToEdit?.rows ? recordToEdit.rows.map((row: string) => JSON.parse(row)) : [];
        const filteredHeaders = headers.filter(header => !recordToEdit?.headers?.includes(header));

        const updatedRows = [
          ...existingRows,
          transformedRow
        ];

        // Solo agregar headers si hay nuevos
        if (filteredHeaders.length > 0) {
            addHeaders({
                json: {
                    headers: recordToEdit?.headers ? [...filteredHeaders, ...recordToEdit?.headers] : headers,
                },
                param: { tableId: currentRecordTable }
            });
        }

        addRecords({
            json: {
                tableId: currentRecordTable,
                data: recordToEdit?.rows ? updatedRows : [transformedRow]
            }
        })

        // Cerrar el sheet solo si todo salió bien
        setSheetOpen(false);
    }

    return (
        <>
            <ValidationErrorDialog
                isOpen={validationErrorOpen}
                onClose={() => setValidationErrorOpen(false)}
            />
            <DialogContainer
                // description="Carga tu archivo y verás una previsualización de los datos. Podrás ignorar columnas si así lo deseas"
                title={t('upload-records')}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            >
                <ExcelUploader
                    setIsOpen={setIsOpen}
                    currentRecordTable={currentRecordTable}
                />
            </DialogContainer>
            <Sheet
                open={sheetOpen}
                onOpenChange={onChangeSheet}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!thereIsTable}>
                    <Button className="ml-auto">
                        {t('add-records')} <ChevronDown />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" >
                        <SheetTrigger asChild>
                            <DropdownMenuItem className="flex items-center justify-between min-w-36 cursor-pointer">
                                <span>{t('manual')}</span> <FilePenLine />
                            </DropdownMenuItem>
                        </SheetTrigger>
                        <DropdownMenuItem className="flex items-center justify-between min-w-36 cursor-pointer" onClick={() => setIsOpen(true)}>
                            <span>{t('upload-excel')}</span> <Upload />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <SheetContent className="flex flex-col justify-between">
                    <div>
                        <SheetHeader>
                        <SheetTitle>{t('add-records')}</SheetTitle>
                            <SheetDescription>
                                {t('add-records-description')}
                            </SheetDescription>
                        </SheetHeader>

                        <Separator className="my-2" />

                        <div className="overflow-auto h-[600px] pr-2">
                            {recordData.map((data, index) => (
                                <AddRecordsInputs
                                    key={index}
                                    setRecordData={setRecordData}
                                    index={index}
                                    data={data}
                                    headersUsed={recordData.map(data => data.field)}
                                    isLastItem={recordData.length - 1 === index}
                                    totalRecords={recordData.length}
                                />
                            ))}
                        </div>
                    </div>

                    <SheetFooter className="">
                        <Button type="button" onClick={onSave} disabled={addingRecords}>{t('save-changes')}</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    )
}
