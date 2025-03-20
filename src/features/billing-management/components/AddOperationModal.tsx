'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Dispatch, SetStateAction } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { billingOperationSchema } from "../schemas";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import capitalize from "@/utils/capitalize";
import { useCreateOperation } from "../api/use-create-operation";
import CustomDatePicker from "@/components/CustomDatePicker";

const defaultValues = {
    type: 'income',
    date: new Date(),
    account: 'cuenta en pesos',
    category: 'Ventas al por mayor',
    import: '0',
    note: ''
}

interface AddOperationModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const AddOperationModal = ({ isOpen, setIsOpen }: AddOperationModalProps) => {
        const { mutate, isPending } = useCreateOperation()

    const form = useForm<zod.infer<typeof billingOperationSchema>>({
        resolver: zodResolver(billingOperationSchema),
        defaultValues
    })

    const onSubmit = (values: zod.infer<typeof billingOperationSchema>) => {
        // mutate({json: values})
        console.log({values})
    }

    const onCancel = () => {
        form.reset(defaultValues)
        setIsOpen(false)
    }

    const categories = ['Ventas al por mayor', 'Ventas al por menor', 'Sucursales', 'Otros'];

    const types = [
        { label: "Ingreso", type: "income", textColor: "text-emerald-600", border: 'border-t-emerald-600' },
        { label: "Egreso", type: "expense", textColor: "text-red-600", border: 'border-t-red-600' },
    ]

    console.log(form.getValues())

    return (
        <DialogContainer
            // description=""
            title="Anadir operacion"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                   <FormField
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                            <div className="flex gap-2 w-full text-center">
                                {types.map(({ label, type, textColor, border }) => (
                                <label key={type} className="cursor-pointer flex-1">
                                    <Input
                                        type="radio"
                                        {...field}
                                        className="hidden"
                                        checked={field.value === type}
                                        onChange={() => field.onChange(type)}
                                        defaultChecked={types[0].type === type}
                                        defaultValue={types[0].type}
                                    />
                                    <div
                                        className={`px-4 py-2 rounded-md w-full transition-colors ${
                                            field.value === type
                                            ? `border-2 border-t-8 ${border} ${textColor}`
                                            : `border-2 border-t-8 border-t-zinc-300 bg-muted text-muted-foreground`
                                        }`}
                                    >
                                    {label}
                                    </div>
                                </label>
                                ))}
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        name="category"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Category
                                </FormLabel>
                                <FormControl>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="w-full flex items-center justify-between gap-2 p-2 border rounded-sm focus:outline-none !mt-0">
                                        <p className="text-zinc-800 text-sm">{categories[0]}</p>
                                        <ChevronsUpDown size={14} />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {categories?.map(category => (
                                            <DropdownMenuItem key={category} className="min-w-60 flex items-center justify-center p-2" {...field}>
                                                {capitalize(category)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='date'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Date
                                </FormLabel>
                                <FormControl>
                                    <CustomDatePicker
                                        {...field}
                                        className="!mt-0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="import"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Import
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Import"
                                        className="!mt-0"
                                        min={0}
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="note"
                        control={form.control}
                        render={({ field }) => ( //className="flex items-center gap-2"
                            <FormItem >
                                <FormLabel htmlFor="note">
                                    Note
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Relacionado con..."
                                        className="!mt-0"
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-2">
                        <Button
                            size='lg'
                            className="w-full"
                            disabled={isPending}
                        >
                            Guardar
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            disabled={isPending}
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContainer>
    );
}

export default AddOperationModal;