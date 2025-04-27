'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
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
import { ChevronsUpDown, Plus, XIcon } from "lucide-react";
import capitalize from "@/utils/capitalize";
import { useCreateOperation } from "../api/use-create-operation";
import CustomDatePicker from "@/components/CustomDatePicker";
import { useGetBillingOptions } from "../api/use-get-billing-options";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCreateBillingOptions } from "../api/use-create-billing-options";
import { useUpdateBillingOptions } from "../api/use-update-billing-options";
import { useTranslations } from "next-intl";

const defaultValues = {
    type: 'income',
    date: new Date(),
    account: '',
    category: '',
    import: '',
    note: ''
}

interface AddOperationModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const AddOperationModal = ({ isOpen, setIsOpen }: AddOperationModalProps) => {
    const { mutate, isPending } = useCreateOperation();
    const { mutate: createCategory } = useCreateBillingOptions();
    const {mutate: updateCategories} = useUpdateBillingOptions();
    const { data, isLoading: isLoadingCategories } = useGetBillingOptions();
    const t = useTranslations('billing')

    const [newCategoryInput, setNewCategoryInput] = useState(false);

    const form = useForm<zod.infer<typeof billingOperationSchema>>({
        resolver: zodResolver(billingOperationSchema),
        defaultValues: {
            type: 'income',
            date: new Date(),
            account: '',
            category: '',
            import: 0,
            note: ''
        }
    });

    const categories = useMemo(() => {
        if (data?.documents[0]) {
            return data?.documents[0][`${form.getValues('type')}Categories`]
        }
        return []
    }, [data, form.getValues('type')])

    const onSubmit = (values: zod.infer<typeof billingOperationSchema>) => {
        mutate({json: values}, {
            onSuccess: () => {
                form.reset();
                setIsOpen(false);
                setNewCategoryInput(false)

                const income = data?.documents[0].incomeCategories || [];
                const expense = data?.documents[0].expenseCategories || [];
                const current = values.type === 'income' ? income : expense;

                const payload = {
                    incomeCategories: [...income],
                    expenseCategories: [...expense],
                    [`${values.type}Categories`]: [...current, values.category],
                };
                if(data?.total === 0) {
                    createCategory({json: payload })
                } else {
                    updateCategories({
                        json: payload,
                        param: { billingOptionId: data?.documents[0].$id || '' }
                    })
                }
            }
        })
    }

    const onCancel = () => {
        form.reset({
            type: 'income',
            date: new Date(),
            account: '',
            category: '',
            import: 0,
            note: ''
        })
        setIsOpen(false)
    }

    const types = [
        { label: "income", type: "income", textColor: "text-emerald-600", border: 'border-t-emerald-600' },
        { label: "expense", type: "expense", textColor: "text-red-600", border: 'border-t-red-600' },
    ]

    const handleClose = (open: boolean) => {
        if (!open) {
            onCancel();
        }
        setIsOpen(open);
    }

    return (
        <DialogContainer
            // description=""
            title={t("add-operation")}
            isOpen={isOpen}
            setIsOpen={handleClose}
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
                                            />
                                            <div
                                                className={`px-4 py-2 rounded-md w-full transition-colors ${
                                                    field.value === type
                                                    ? `border-2 border-t-8 ${border} ${textColor}`
                                                    : `border-2 border-t-8 border-t-zinc-300 bg-muted text-muted-foreground`
                                                }`}
                                            >
                                            {t(label)}
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
                                    {t('category')}
                                </FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-2">
                                            {isLoadingCategories
                                            ? <Skeleton className="h-8 w-[200px]" />
                                            : (
                                                newCategoryInput ? (
                                                    <Input
                                                        placeholder={t('wholesale-sales')}
                                                        className="!mt-0"
                                                        disabled={isPending}
                                                        {...field}
                                                    />
                                                ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="w-full flex items-center justify-between gap-2 p-2 border rounded-sm focus:outline-none !mt-0" disabled={isPending || categories.length === 0}>
                                                        <p className={cn("text-zinc-800 text-sm", categories.length === 0 && 'text-muted-foreground')}>{categories.length === 0 ? t('no-categories') : (field.value ? field.value : t('choise-category'))}</p>
                                                        <ChevronsUpDown size={14} className={categories.length === 0 ? 'text-muted-foreground' : ''} />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {categories.length > 0 && categories?.map((category: string) => (
                                                            <DropdownMenuItem key={category} className="min-w-60 flex items-center justify-center p-2" onClick={() => field.onChange(category)} {...field}>
                                                                {capitalize(category)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                )
                                            )}
                                        {<Button type="button" variant="outline" size="icon" onClick={() => setNewCategoryInput(!newCategoryInput)}>
                                           {newCategoryInput ? <XIcon className="h-[1.2rem] w-[1.2rem]" />  : <Plus className="h-[1.2rem] w-[1.2rem]" />}
                                        </Button>}
                                    </div>
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
                                    {t('date')}
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
                                    {t('amount')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="!mt-0"
                                        min={0}
                                        disabled={isPending}
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            const valueAsNumber = e.target.value === '' ? undefined : Number(e.target.value);
                                            field.onChange(valueAsNumber);
                                        }}
                                        onBlur={field.onBlur}
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
                                    {t('note')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('related-with')}
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
                            {t('save')}
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            disabled={isPending}
                            onClick={onCancel}
                        >
                            {t('cancel')}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContainer>
    );
}

export default AddOperationModal;