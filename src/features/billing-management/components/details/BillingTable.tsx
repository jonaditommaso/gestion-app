'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetOperations } from "../../api/use-get-operations"
import dayjs from 'dayjs'
import { cn } from "@/lib/utils"
import FadeLoader from "react-spinners/FadeLoader"
import capitalize from "@/utils/capitalize"
import { useDataBillingTable } from "../../hooks/useDataBillingTable"
import { useEffect, useState } from "react"

const headers = ['Invoice', 'Type', 'Date', 'Category', 'Amount']

export function BillingTable() {
  const { data, isLoading } = useGetOperations();
  const { selectedData } = useDataBillingTable();

  const [dataType, setDataType] = useState(selectedData);

  useEffect(() => {
    setDataType(selectedData);
  }, [selectedData])


  if(isLoading) return <FadeLoader color="#999" width={3} className="mt-5" />

  const total = data?.documents.reduce((acc, operation) => acc + (operation.type === 'income' ? operation.import : -operation.import), 0)

  const filteredData = selectedData === 'total'
  ? data?.documents
  : data?.documents.filter(operation => operation.type === dataType);

  return (
    <div className="w-[900px] mt-10">
      <Table className="border p-4">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            {headers.map(header => (
              <TableHead key={header} className={cn("w-[100px]", header === 'Amount' && 'text-right')}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData?.map(operation => (
            <TableRow key={operation.$id} className={operation.type === 'income' ? 'bg-green-100 hover:bg-green-50' : 'bg-red-100 hover:bg-red-50'}>
              <TableCell className="">{operation.$id.slice(-6).toUpperCase()}</TableCell>
              <TableCell className="">{capitalize(operation.type)}</TableCell>
              <TableCell className="">{dayjs(operation.date).format('DD/MM/YYYY HH:mm')}</TableCell>
              <TableCell className="">{operation.category}</TableCell>
              <TableCell className="text-right">$ {operation.import}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">$ {total}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
