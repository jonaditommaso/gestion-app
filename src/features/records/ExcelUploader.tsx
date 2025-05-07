'use client'

import { useState, useCallback, Dispatch, SetStateAction } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useAddHeaders } from './api/use-add-headers'
import { useGetContextRecords } from './hooks/useGetContextRecords'
import { useTranslations } from 'next-intl'

interface ExcelData {
  headers: string[];
  rows: string[][];
}

interface ExcelUploaderProps {
  // setUploadedData: Dispatch<SetStateAction<ExcelData>>,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  currentRecordTable: string,
}

export default function ExcelUploader({ setIsOpen, currentRecordTable }: ExcelUploaderProps) {
  const [excelData, setExcelData] = useState<ExcelData | null>(null)
  // const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [fileName, setFileName] = useState<null | string>(null);
  const [firstRowHeader, setFirstRowHeader] = useState(true);
  const { data: dataRecords } = useGetContextRecords();
  const { mutate: addRecords, isPending: addingRecords } = useAddHeaders(); //todo: adapt like I made to manual uploading
  const t = useTranslations('records');

  const handleFirstRow = () => {

    setExcelData(prev => {
      if (!prev) {
        return null; // Devuelve null si no hay datos previos
      }
      const currentData = {...prev}
      currentData.rows = currentData.rows?.slice(!firstRowHeader ? 1 : 0)
      return currentData
    })

    setFirstRowHeader(prev => !prev);
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()

    setFileName(file.name)

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

      setExcelData({
        headers: jsonData[0],
        rows: jsonData.slice(1)//.slice(1, 6), // Preview only first 5 rows
      })
    }

    reader.readAsArrayBuffer(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls']
  }})

  // const handleColumnSelect = (column: string) => {
  //   setSelectedColumns((prev) =>
  //     prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
  //   )
  // }

  // const handleFinalize = () => {
  //   console.log('Selected columns:', selectedColumns)
  //   // Here you would typically send the selected columns to your backend
  //   // or process them further as needed
  // }

  const handleSave = () => {
    if (excelData === null) return;

    const { headers, rows } = excelData;

    const processedData = rows.map(row => {
      const transformedRow: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        transformedRow[header] = row[index];
      });
      return transformedRow;
    });

    const recordToEdit = dataRecords.documents.find(record => record.$id === currentRecordTable);

    const existingRows = recordToEdit?.rows ? recordToEdit.rows.map((row: string) => JSON.parse(row)) : [];
    const filteredHeaders = headers.filter(header => !recordToEdit?.headers?.includes(header));

    const updatedRows = [
      ...existingRows,
      ...processedData
    ];

    addRecords({
      json: {
        headers: recordToEdit?.headers ? [...filteredHeaders, ...recordToEdit?.headers] : headers,
        //rows: recordToEdit?.rows ? updatedRows : processedData
      },
      param: { tableId: currentRecordTable }
    })

    setIsOpen(false)
  }

  return ( //max-w-4xl
    <div>
      {/* bg-neutral-100 */}
        <Card className="w-full mx-auto p-1 ">
          {/* <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
          </CardHeader> */}
          <CardContent className='pt-2 p-1 rounded-md'>
            {excelData ? (
              <div>
                {/* // <div className='flex flex-col items-center justify-between'> */}
                    {/* <div>
                        <h3 className="text-lg font-semibold mb-4">Previsualización y configuración</h3>
                    </div> */}
                    <div className='flex justify-center gap-3 items-center'>
                        <div>
                            <p>{t('select-another-file')}</p>
                            {/* <p className="text-sm text-gray-500">Se perderá el progreso actual</p> */}
                        </div>

                        <div {...getRootProps()} className={`border self-center rounded-md p-2 text-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                            <input {...getInputProps()} />
                            <Upload className="mx-auto h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                  <Separator className='my-4' />
                  <div className='p-2 border border-blue-400 text-blue-600 bg-blue-50 flex items-center justify-between rounded-md w-[80%] m-auto'>
                      <span>{fileName}</span>
                      <X />
                  </div>
                </div>
            )

            : (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-3 text-center focus:outline-none cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-blue-300'}`}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                    <p>{t('drop-file-here')}</p>
                    ) : (
                    <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-blue-500" />
                        {/* <p>Drag and drop an Excel file here, or click to select a file</p> */}
                        <p className='text-balance'>{t('drop-or-select-file')}</p>
                        <p className="text-sm text-gray-500">{t('supported-files')}</p>
                    </div>
                    )}
                </div>
            )}

            {excelData && <Separator className='my-4' /> }


            {/* {excelData && (
                <>
                <Separator className='mt-2' />
                     <Table>
                 <div className="mt-8 max-h-80 max-w-[820px] overflow-auto relative m-auto bg-white">
                   <div className="">
                       <TableHeader className='sticky top-[-1px] bg-zinc-600 text-white z-10 p-2'>
                         <TableRow className='hover:bg-zinc-600'>
                           {excelData.headers.map((header, index) => ( //whitespace-nowrap
                             <TableHead key={index} className=" p-1">
                               <div className="flex items-center space-x-2 text-white">
                                 <Select onValueChange={() => handleColumnSelect(header)}>
                                   <SelectTrigger className="w-[120px]">
                                     <SelectValue placeholder="Select" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="include">Include</SelectItem>
                                     <SelectItem value="exclude">Exclude</SelectItem>
                                   </SelectContent>
                                 </Select>
                                 <span>{header}</span>
                               </div>
                             </TableHead>
                           ))}
                         </TableRow>
                       </TableHeader>
                       <TableBody className=''>
                         {excelData.rows.map((row, rowIndex) => {
                            // if(rowIndex === 0) return null;
                            return (
                           <TableRow key={rowIndex}>
                             {row.map((cell, cellIndex) => (
                               <TableCell key={cellIndex}>{cell}</TableCell>
                             ))}
                           </TableRow>
                         )})}
                       </TableBody>
                 </div>
                     </Table>
                   </div>
             </>
            )} */}
          </CardContent>
          <CardFooter className={`justify-between ${!excelData ? 'mt-3' : ''}`}>
          {excelData && <div className="items-center flex space-x-2">
              <Checkbox id="first-row" checked={firstRowHeader} onCheckedChange={() => handleFirstRow()} disabled />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="first-row"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('first-row-header')}
                </label>
                {/* <p className="text-sm text-muted-foreground">
                  Marcalo .
                </p> */}
              </div>
            </div>}
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">
                {excelData ? `${excelData.rows.length} ${t('records-loaded')}` : t('no-file-yet')}
              </span>
            </div>
            {/* <Button onClick={handleFinalize} disabled={!excelData || selectedColumns.length === 0}>
              Finalize Configuration
            </Button> */}
          </CardFooter>

        </Card>
         <div className='flex justify-end pt-5'>
            <Button type="button" onClick={handleSave} disabled={!excelData || addingRecords}>{t('save-changes')}</Button>
         </div>
    </div>
  )
}
