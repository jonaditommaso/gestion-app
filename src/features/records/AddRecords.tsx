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
import ExcelUploader from "./ExcelUploader"

export function AddRecords() {
    const [recordData, setRecordData] = useState([{ field: '', value: '' }]);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <DialogContainer
                // description="Carga tu archivo y verás una previsualización de los datos. Podrás ignorar columnas si así lo deseas"
                title="Cargar registros"
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            >
                <ExcelUploader setIsOpen={setIsOpen} />
            </DialogContainer>
            <Sheet>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button className="ml-auto">
                        Añadir registros <ChevronDown />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" >
                        <SheetTrigger asChild>
                            <DropdownMenuItem className="flex items-center justify-between min-w-36 cursor-pointer">
                                <span>Manual</span> <FilePenLine />
                            </DropdownMenuItem>
                        </SheetTrigger>
                        <DropdownMenuItem className="flex items-center justify-between min-w-36 cursor-pointer" onClick={() => setIsOpen(true)}>
                            <span>Cargar Excel</span> <Upload />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <SheetContent className="flex flex-col justify-between">
                    <div>
                        <SheetHeader>
                        <SheetTitle>Añadir registros</SheetTitle>
                            <SheetDescription>
                                Añade todos los datos necesarios de un mismo registro.
                                No olvides guardar los cambios.
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
                            <Button type="submit">Guardar cambios</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    )
}
