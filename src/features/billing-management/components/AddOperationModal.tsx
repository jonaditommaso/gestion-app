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
import dayjs from "dayjs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// const defaultValues = {
//     type: 'income',
//     date: new Date(),
//     account: '',
//     category: '',
//     import: '',
//     note: ''
// }

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
            invoiceNumber: '',
            partyName: '',
            status: 'PENDING',
            dueDate: undefined,
            paymentMethod: undefined,
            currency: 'EUR',
            taxRate: undefined,
            taxAmount: undefined,
            isRecurring: false,
            recurrenceRule: undefined,
            nextOccurrenceDate: undefined,
            category: '',
            import: 0,
            note: ''
        }
    });

    const operationType = form.watch('type');
    // const isRecurring = form.watch('isRecurring');

    const categories = useMemo(() => {
        if (data?.documents[0]) {
            return data?.documents[0][`${operationType}Categories`]
        }
        return []
    }, [data, operationType])

    const normalizeCategory = (value: string) => value.trim().toLowerCase();

    const toUniqueCategories = (list: string[]) => {
        const seen = new Set<string>();

        return list.filter((item) => {
            const normalizedItem = normalizeCategory(item);

            if (!normalizedItem || seen.has(normalizedItem)) {
                return false;
            }

            seen.add(normalizedItem);
            return true;
        });
    };

    const onSubmit = (values: zod.infer<typeof billingOperationSchema>) => {
        if (values.import <= 0) {
            form.setError('import', { message: t('amount-must-be-positive') });
            return;
        }

        if (values.dueDate && dayjs(values.dueDate).isBefore(dayjs(values.date), 'day')) {
            form.setError('dueDate', { message: t('due-date-must-be-after-date') });
            return;
        }

        if (values.taxAmount !== undefined && values.taxAmount > values.import) {
            form.setError('taxAmount', { message: t('tax-amount-must-be-lte-amount') });
            return;
        }

        const normalizedCategory = normalizeCategory(values.category);
        const categoryAlreadyExists = categories.some((category: string) => normalizeCategory(category) === normalizedCategory);

        if (newCategoryInput && categoryAlreadyExists) {
            form.setError('category', { message: t('category-duplicate-error') });
            return;
        }

        const payload = {
            ...values,
            recurrenceRule: values.isRecurring ? values.recurrenceRule : undefined,
            nextOccurrenceDate: values.isRecurring ? values.nextOccurrenceDate : undefined,
        };

        mutate({json: payload}, {
            onSuccess: () => {
                form.reset();
                setIsOpen(false);
                setNewCategoryInput(false)

                const income = data?.documents[0].incomeCategories || [];
                const expense = data?.documents[0].expenseCategories || [];
                const current = values.type === 'income' ? income : expense;
                const nextTypeCategories = toUniqueCategories([...current, values.category]);

                const payload = {
                    incomeCategories: values.type === 'income' ? nextTypeCategories : toUniqueCategories([...income]),
                    expenseCategories: values.type === 'expense' ? nextTypeCategories : toUniqueCategories([...expense]),
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
            invoiceNumber: '',
            partyName: '',
            status: 'PENDING',
            dueDate: undefined,
            paymentMethod: undefined,
            currency: 'EUR',
            taxRate: undefined,
            taxAmount: undefined,
            isRecurring: false,
            recurrenceRule: undefined,
            nextOccurrenceDate: undefined,
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

    const operationStatusOptions = [
        { value: 'PENDING', labelKey: 'pending' },
        { value: 'PAID', labelKey: 'paid' },
        { value: 'OVERDUE', labelKey: 'overdue' },
    ] as const;

    const paymentMethodOptions = [
        { value: 'CASH', labelKey: 'cash' },
        { value: 'BANK_TRANSFER', labelKey: 'bank_transfer' },
        { value: 'DEBIT_CARD', labelKey: 'debit_card' },
        { value: 'CREDIT_CARD', labelKey: 'credit_card' },
        { value: 'DIGITAL_WALLET', labelKey: 'digital_wallet' },
        { value: 'OTHER', labelKey: 'other' },
    ] as const;

    const currencyOptions = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'MXN', 'BRL'] as const;
    // const recurrenceOptions = [
    //     { value: 'WEEKLY', labelKey: 'weekly' },
    //     { value: 'MONTHLY', labelKey: 'monthly' },
    // ] as const;

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
                <form className="space-y-4 max-h-[72vh] overflow-y-auto px-1" onSubmit={form.handleSubmit(onSubmit)}>
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
                        name="invoiceNumber"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t('invoice-number')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('invoice-number-placeholder')}
                                        className="!mt-0"
                                        disabled={isPending}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="partyName"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t('party-name')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('party-name-placeholder')}
                                        className="!mt-0"
                                        disabled={isPending}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            name="status"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('status')}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || 'PENDING'}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="!mt-0">
                                                <SelectValue placeholder={t('select-status')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {operationStatusOptions.map((statusOption) => (
                                                <SelectItem key={statusOption.value} value={statusOption.value}>{t(statusOption.labelKey)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='dueDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('due-date')}
                                    </FormLabel>
                                    <FormControl>
                                        <CustomDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="!mt-0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/*
                    <div className="rounded-md border p-3 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium">{t('recurring-operation')}</p>
                                <p className="text-xs text-muted-foreground">{t('recurring-operation-description')}</p>
                            </div>

                            <FormField
                                name="isRecurring"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Switch
                                                checked={Boolean(field.value)}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);

                                                    if (!checked) {
                                                        form.setValue('recurrenceRule', undefined);
                                                        form.setValue('nextOccurrenceDate', undefined);
                                                    }
                                                }}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                                name="recurrenceRule"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('recurrence-rule')}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isPending || !form.watch('isRecurring')}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="!mt-0">
                                                    <SelectValue placeholder={t('select-recurrence-rule')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {recurrenceOptions.map((recurrence) => (
                                                    <SelectItem key={recurrence.value} value={recurrence.value}>{t(recurrence.labelKey)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='nextOccurrenceDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('next-occurrence-date')}
                                        </FormLabel>
                                        <FormControl>
                                            <CustomDatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="!mt-0"
                                                disabled={isPending || !form.watch('isRecurring')}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                            name="paymentMethod"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('payment-method')}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="!mt-0">
                                                <SelectValue placeholder={t('select-payment-method')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {paymentMethodOptions.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>{t(method.labelKey)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="account"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('account')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('account-placeholder')}
                                            className="!mt-0"
                                            disabled={isPending}
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                            name="taxRate"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('tax-rate')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="!mt-0"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            disabled={isPending}
                                            value={field.value ?? ''}
                                            onChange={(event) => {
                                                const valueAsNumber = event.target.value === '' ? undefined : Number(event.target.value);
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
                            name="taxAmount"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('tax-amount')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="!mt-0"
                                            min={0}
                                            step={0.01}
                                            disabled={isPending}
                                            value={field.value ?? ''}
                                            onChange={(event) => {
                                                const valueAsNumber = event.target.value === '' ? undefined : Number(event.target.value);
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
                            name="currency"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('currency')}
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || 'EUR'}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="!mt-0">
                                                <SelectValue placeholder="EUR" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {currencyOptions.map((currencyCode) => (
                                                <SelectItem key={currencyCode} value={currencyCode}>{currencyCode}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    </div>

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