'use client'

import { useState, useCallback, Dispatch, SetStateAction } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'

interface ExcelData {
  headers: string[];
  rows: string[][];
}

interface ExcelUploaderProps {
    setUploadedData: Dispatch<SetStateAction<ExcelData>>,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

export default function ExcelUploader({ setUploadedData, setIsOpen }: ExcelUploaderProps) {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const t = useTranslations('records')

  // const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()

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
    setUploadedData(excelData);
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
            <div className='flex items-center justify-between'>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('config-file')}</h3>
              </div>
              <div className='flex justify-end gap-3'>
                <div>
                  <p>{t('select-another-file')}</p>
                  <p className="text-sm text-gray-500">{t('loose-current-progress')}</p>
                </div>

                <div {...getRootProps()} className={`border self-center rounded-md p-2 text-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          )

          : (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center focus:outline-none cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>{t('drop-file-here')}</p>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p>{t('drop-or-select-file')}</p>
                  <p className="text-sm text-gray-500">{t('supported-files')}</p>
                </div>
              )}
            </div>
          )}


          {excelData && (
            <>
              <Separator className='mt-2' />
              <Table>
                <div className="mt-8 max-h-80 max-w-[820px] overflow-auto relative m-auto bg-white">
                  {/* <div className=""> */}
                  <TableHeader className='sticky top-[-1px] bg-zinc-600 text-white z-10 p-2'>
                    <TableRow className='hover:bg-zinc-600'>
                      {excelData.headers.map((header, index) => ( //whitespace-nowrap
                        <TableHead key={index} className=" p-1">
                          <div className="flex items-center space-x-2 text-white">
                            {/* <Select onValueChange={() => handleColumnSelect(header)}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="include">Include</SelectItem>
                                <SelectItem value="exclude">Exclude</SelectItem>
                              </SelectContent>
                            </Select> */}
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
              {/* </div> */}
            </>
          )}
        </CardContent>
        <CardFooter className="mt-2 justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">
              {excelData ? `${excelData.rows.length} ${t('rows-loaded')}` : t('no-file-yet')}
            </span>
          </div>
          {/* <Button onClick={handleFinalize} disabled={!excelData || selectedColumns.length === 0}>
            Finalize Configuration
          </Button> */}
        </CardFooter>

      </Card>
      <div className='flex justify-end pt-5'>
        <Button type="button" onClick={handleSave} disabled={!excelData}>{t('save-changes')}</Button>
      </div>
    </div>
  )
}
