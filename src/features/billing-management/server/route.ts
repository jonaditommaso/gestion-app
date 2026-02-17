import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { billingOperationSchema, billingCategoriesSchema, billingOperationUpdateSchema } from '../schemas';
import { BILLING_OPTIONS_ID, BILLINGS_ID, DATABASE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import dayjs from "dayjs";

const app = new Hono()

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', billingOperationSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const {
                account,
                category,
                date,
                import: importValue,
                type,
                note,
                invoiceNumber,
                partyName,
                status,
                dueDate,
                paymentMethod,
                currency,
                taxRate,
                taxAmount,
                isRecurring,
                recurrenceRule,
                nextOccurrenceDate,
                archived,
            } = ctx.req.valid('json');

            const teamId = user?.prefs.teamId;

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const operationData: {
                account: string | undefined;
                category: string;
                date: Date;
                import: number;
                type: 'income' | 'expense';
                note: string | undefined;
                teamId: string;
                lastModifiedBy: string;
                invoiceNumber?: string;
                partyName?: string;
                status?: 'PENDING' | 'PAID' | 'OVERDUE';
                dueDate?: Date;
                paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER';
                currency?: string;
                taxRate?: number;
                taxAmount?: number;
                isRecurring?: boolean;
                recurrenceRule?: 'WEEKLY' | 'MONTHLY';
                nextOccurrenceDate?: Date;
                archived?: boolean;
            } = {
                account,
                category,
                date,
                import: Number(importValue),
                type,
                note,
                teamId: teamId,
                lastModifiedBy: user.$id,
            }

            if (invoiceNumber) operationData.invoiceNumber = invoiceNumber;
            if (partyName) operationData.partyName = partyName;
            operationData.status = status || 'PENDING';
            if (dueDate) operationData.dueDate = dueDate;
            if (paymentMethod) operationData.paymentMethod = paymentMethod;
            operationData.currency = currency || 'EUR';
            if (taxRate !== undefined) operationData.taxRate = taxRate;
            if (taxAmount !== undefined) operationData.taxAmount = taxAmount;
            operationData.isRecurring = isRecurring ?? false;
            if (recurrenceRule) operationData.recurrenceRule = recurrenceRule;

            const recurringBaseDate = dueDate || date;
            if (operationData.isRecurring && recurrenceRule) {
                const calculatedNextOccurrence = recurrenceRule === 'WEEKLY'
                    ? dayjs(recurringBaseDate).add(1, 'week').toDate()
                    : dayjs(recurringBaseDate).add(1, 'month').toDate();

                operationData.nextOccurrenceDate = nextOccurrenceDate || calculatedNextOccurrence;
            } else if (nextOccurrenceDate) {
                operationData.nextOccurrenceDate = nextOccurrenceDate;
            }

            operationData.archived = archived ?? false;

            const newOperation = await databases.createDocument(
                DATABASE_ID,
                BILLINGS_ID,
                ID.unique(),
                operationData
            )

            const billingOptions = await databases.listDocuments(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                [
                    Query.equal('teamId', teamId),
                    Query.contains(`${type}Categories`, [category])
                ]
            );

            if (billingOptions.total === 0) {
                const payload = {
                    [`${type}Categories`]: [category],
                    [`${type === 'expense' ? 'income' : 'expense'}Categories`]: [],
                    teamId: teamId,
                }

                await databases.createDocument(
                    DATABASE_ID,
                    BILLING_OPTIONS_ID,
                    ID.unique(),
                    payload
                )
            }

            return ctx.json({ data: newOperation })
        }
    )

    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            try {
                const operations = await databases.listDocuments(
                    DATABASE_ID,
                    BILLINGS_ID,
                    [
                        Query.equal('teamId', user.prefs.teamId),
                        Query.orderDesc('$createdAt'),
                    ]
                );

                const filteredDocuments = operations.documents.filter((operation) => operation.archived !== true);

                const filteredOperations = {
                    ...operations,
                    total: filteredDocuments.length,
                    documents: filteredDocuments,
                }

                return ctx.json({ data: filteredOperations });
            } catch (err) {
                console.error('Error fetching billing operations:', err);
                return ctx.json({ data: { total: 0, documents: [] } }, 200);
            }
        }
    )

    .patch(
        '/:billingId',
        sessionMiddleware,
        zValidator('json', billingOperationUpdateSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { billingId } = ctx.req.param();
            const values = ctx.req.valid('json');

            const payloadEntries = Object.entries(values).filter(([, value]) => value !== undefined);

            if (payloadEntries.length === 0) {
                return ctx.json({ error: 'No fields to update' }, 400);
            }

            const payload: Record<string, string | number | Date | boolean> = {};

            payloadEntries.forEach(([key, value]) => {
                if (value instanceof Date || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    payload[key] = key === 'import' ? Number(value) : value;
                }
            });

            const recurrenceRule = payload.recurrenceRule as 'WEEKLY' | 'MONTHLY' | undefined;
            const isRecurring = payload.isRecurring as boolean | undefined;
            const dueDate = payload.dueDate as Date | undefined;
            const operationDate = payload.date as Date | undefined;

            if (isRecurring && recurrenceRule) {
                const recurringBaseDate = dueDate || operationDate || new Date();

                payload.nextOccurrenceDate = recurrenceRule === 'WEEKLY'
                    ? dayjs(recurringBaseDate).add(1, 'week').toDate()
                    : dayjs(recurringBaseDate).add(1, 'month').toDate();
            }

            payload.lastModifiedBy = user.$id;

            const updatedOperation = await databases.updateDocument(
                DATABASE_ID,
                BILLINGS_ID,
                billingId,
                payload
            )

            return ctx.json({ data: updatedOperation })
        }
    )

    .delete(
        '/:billingId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { billingId } = ctx.req.param();

            await databases.deleteDocument(
                DATABASE_ID,
                BILLINGS_ID,
                billingId,
            )

            return ctx.json({ data: { $id: billingId } })
        }
    )

    .get(
        '/options',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const billingOptions = await databases.listDocuments(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                [Query.equal('teamId', user.prefs.teamId)]
            );

            if (billingOptions.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: billingOptions })

        }
    )

    .post(
        '/options',
        sessionMiddleware,
        zValidator('json', billingCategoriesSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { incomeCategories, expenseCategories } = ctx.req.valid('json');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const options = await databases.createDocument(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                ID.unique(),
                {
                    incomeCategories,
                    expenseCategories,
                    teamId: user.prefs.teamId,
                }
            )

            return ctx.json({ data: options })
        }
    )

    .patch(
        '/options/:billingOptionId',
        sessionMiddleware,
        zValidator('json', billingCategoriesSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { incomeCategories, expenseCategories } = ctx.req.valid('json');

            const { billingOptionId } = ctx.req.param()

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const newOperation = await databases.updateDocument(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                billingOptionId,
                {
                    incomeCategories,
                    expenseCategories
                }
            )

            return ctx.json({ data: newOperation })
        }
    )

export default app;