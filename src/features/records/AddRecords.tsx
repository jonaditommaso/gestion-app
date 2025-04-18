'use client'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import {
  Sheet,
  SheetClose,
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

const INITIAL_RECORDS_STATE = [{ field: '', value: '' }];

interface AddRecordsProps {
    currentRecordTable: string,
    thereIsTable: boolean
}

export function AddRecords({ currentRecordTable, thereIsTable }: AddRecordsProps) {
    const [recordData, setRecordData] = useState(INITIAL_RECORDS_STATE);
    const [isOpen, setIsOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const t = useTranslations('records')

    const onChangeSheet = (isSheetOpen: boolean) => {
        setSheetOpen(isSheetOpen);
        if (!isSheetOpen) setRecordData(INITIAL_RECORDS_STATE);
    }

    return (
        <>
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
                                <span>Manual</span> <FilePenLine />
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

                        <Separator className="mt-2" />

                        {recordData.map((data, index) => (
                            <AddRecordsInputs
                                key={index}
                                setRecordData={setRecordData}
                                index={index}
                                data={data}
                            />
                        ))}
                    </div>

                    <SheetFooter className="">
                        <SheetClose asChild>
                            <Button type="submit">{t('save-changes')}</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    )
}
