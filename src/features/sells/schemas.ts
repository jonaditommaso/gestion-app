import { z } from "zod";

const DEAL_CURRENCIES = ["USD", "EUR", "ARS", "GBP", "BRL", "UYU", "MXN"] as const;
const DEAL_STAGES = ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"] as const;
const DEAL_OUTCOMES = ["PENDING", "WON", "LOST"] as const;

export const createDealSchema = z.object({
    title: z.string().trim().min(1, "Required"),
    description: z.string().optional().default(""),
    company: z.string().trim().min(1, "Required"),
    companyResponsabileName: z.string().optional().default(""),
    companyResponsabileEmail: z.string().optional().default(""),
    companyResponsabilePhoneNumber: z.string().optional().default(""),
    amount: z.coerce.number().min(0),
    currency: z.enum(DEAL_CURRENCIES),
    status: z.enum(DEAL_STAGES),
    priority: z.coerce.number().int().min(1).max(3).optional().default(2),
    expectedCloseDate: z.string().nullable().optional().default(null),
    nextStep: z.string().optional().default(""),
    outcome: z.enum(DEAL_OUTCOMES).optional().default("PENDING"),
    labelId: z.string().nullable().optional().default(null),
});

export const updateDealSchema = createDealSchema.partial().extend({
    linkedDraftId: z.string().nullable().optional(),
});

export const addDealActivitySchema = z.object({
    content: z.string().trim().min(1, "Required"),
    type: z.enum(["step-completed", "email-sent"]).optional(),
});

export const createDealSellerSchema = z.object({
    memberId: z.string().trim().min(1, "Required"),
    name: z.string().trim().min(1, "Required"),
    email: z.string().email("Invalid email"),
    avatarId: z.string().optional().nullable(),
});

export const addDealAssigneeSchema = z.object({
    memberId: z.string().trim().min(1, "Required"),
});

export const createSalesBoardSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    currencies: z.array(z.enum(DEAL_CURRENCIES)).min(1),
});

export const updateSalesBoardSchema = z.object({
    name: z.string().trim().min(1, "Required").optional(),
    currencies: z.array(z.enum(DEAL_CURRENCIES)).min(1).optional(),
    activeGoalId: z.string().nullable().optional(),
    labels: z.string().nullable().optional(),
});

export const createSellSquadSchema = z.object({
    name: z.string().trim().min(1, 'Required'),
    leadSellerId: z.string().nullable().optional(),
    metadata: z.string().nullable().optional(),
});

export const updateSellSquadSchema = z.object({
    name: z.string().trim().min(1).optional(),
    leadSellerId: z.string().nullable().optional(),
    metadata: z.string().nullable().optional(),
});

export const createSalesGoalSchema = z.object({
    boardId: z.string().trim().min(1, "Required"),
    targetAmount: z.coerce.number().int().positive(),
    currency: z.enum(DEAL_CURRENCIES).default("USD"),
    period: z.string().trim().min(1, "Required"),
});
