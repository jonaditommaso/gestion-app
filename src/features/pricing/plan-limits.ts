import { OrganizationPlan } from "@/features/team/types";

export type PlanLimits = {
    members: number;
    workspaces: number;
    tables: number;
    records: number;
    storage: string;
    storageBytes: number;
};

export type PlanPrice = {
    monthly: number;
    annual: number;
};

export const planLimits: Record<OrganizationPlan, PlanLimits> = {
    FREE: { members: 5, workspaces: 1, tables: 3, records: 5000, storage: '1 GB', storageBytes: 1 * 1024 * 1024 * 1024 },
    PRO: { members: 10, workspaces: 3, tables: 5, records: 20000, storage: '5 GB', storageBytes: 5 * 1024 * 1024 * 1024 },
    'PRO-PLUS': { members: 20, workspaces: 5, tables: 8, records: 50000, storage: '10 GB', storageBytes: 10 * 1024 * 1024 * 1024 },
    ENTERPRISE: { members: 50, workspaces: 10, tables: 20, records: 100000, storage: '100 GB', storageBytes: 100 * 1024 * 1024 * 1024 },
};

export const planPrices: Record<OrganizationPlan, PlanPrice> = {
    FREE: { monthly: 0, annual: 0 },
    PRO: { monthly: 49, annual: 469 },
    'PRO-PLUS': { monthly: 99, annual: 949 },
    ENTERPRISE: { monthly: 149, annual: 1499 },
};
