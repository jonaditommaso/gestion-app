import { OrganizationPlan } from "@/features/team/types";

export type PlanLimits = {
    members: number;
    workspaces: number;
    pipelines: number;
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
    FREE: { members: 3, workspaces: 1, pipelines: 1, tables: 0, records: 0, storage: '—', storageBytes: 0 },
    PLUS: { members: 10, workspaces: 3, pipelines: 1, tables: 0, records: 0, storage: '—', storageBytes: 0 },
    PRO: { members: 25, workspaces: -1, pipelines: -1, tables: 0, records: 0, storage: '—', storageBytes: 0 },
    ENTERPRISE: { members: -1, workspaces: -1, pipelines: -1, tables: 0, records: 0, storage: '—', storageBytes: 0 },
};

export const planPrices: Record<OrganizationPlan, PlanPrice> = {
    FREE: { monthly: 0, annual: 0 },
    PLUS: { monthly: 12, annual: 9 },
    PRO: { monthly: 22, annual: 18 },
    ENTERPRISE: { monthly: 0, annual: 0 },
};
