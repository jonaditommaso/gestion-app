import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, XIcon } from "lucide-react";

interface CategoriesListProps {
    categories: string[],
    header: string
}

const CategoriesList = ({ categories, header }: CategoriesListProps) => {
    return (
        <Table className="border p-4 min-w-[350px]">
            <TableHeader>
            <TableRow>
                <TableHead className="font-semibold text-center text-gray-700">{header}</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {categories?.map((category: string) => (
                <TableRow key={category}>
                <TableCell className="flex items-center justify-between">
                    <p>{category}</p>
                    <div className="flex gap-2 items-center">
                        <span className="cursor-pointer text-blue-600"><Pencil className="size-4" /></span>
                        <span className="cursor-pointer text-red-600"><XIcon className="size-4" /></span>
                    </div>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    );
}

export default CategoriesList;