import { Models } from "node-appwrite";

export type OrganizationPlan = 'FREE' | 'PRO' | 'PRO-PLUS' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'YEARLY';

export type MembershipRole = 'OWNER' | 'ADMIN' | 'CREATOR' | 'VIEWER';

export interface Organization extends Models.Document {
    name: string;
    plan: OrganizationPlan;
    billingCycle: BillingCycle;
    subscriptionStatus: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    nextRenewal?: string;
    paymentMethodLast4?: string;
    cancelAtPeriodEnd?: boolean;
    isDemo?: boolean;
    appwriteTeamId: string;
}

export interface Membership extends Models.Document {
    userId: string;
    organizationId: string;
    role: MembershipRole;
    //joinedAt?: string;
    position?: string;
    description?: string;
    linkedin?: string;
    tags?: string;
    birthday?: string;
    memberSince?: string;
    currentProject?: string;
}
