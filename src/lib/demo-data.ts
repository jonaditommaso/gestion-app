import { TaskStatus } from '@/features/tasks/types';
import type { Task, WorkspaceMember } from '@/features/tasks/types';
import type { Deal, SalesBoard } from '@/features/sells/types';
import type { WorkspaceType } from '@/features/workspaces/types';
import type { Organization, Membership } from '@/features/team/types';
import type { Models } from 'node-appwrite';

// ─── Internal fake IDs ───────────────────────────────────────────────────────
export const DEMO_WORKSPACE_DEV_ID = 'demo-workspace-dev-01';
export const DEMO_WORKSPACE_MKT_ID = 'demo-workspace-mkt-02';

const DEMO_MEMBER_ALICE_ID = 'demo-member-alice-01';
const DEMO_MEMBER_BOB_ID = 'demo-member-bob-02';
const DEMO_MEMBER_CAROL_ID = 'demo-member-carol-03';

// Appwrite-compatible base fields
const baseDoc = {
    $collectionId: 'demo',
    $databaseId: 'demo',
    $permissions: [] as string[],
};

// ─── Workspace Members (used in tasks) ──────────────────────────────────────
const DEMO_WORKSPACE_MEMBERS: WorkspaceMember[] = [
    {
        ...baseDoc,
        $id: DEMO_MEMBER_ALICE_ID,
        $createdAt: '2025-01-10T09:00:00.000Z',
        $updatedAt: '2025-01-10T09:00:00.000Z',
        userId: 'demo-user-alice',
        workspaceId: DEMO_WORKSPACE_DEV_ID,
        role: 'OWNER',
        name: 'Alice Martín',
        email: 'alice@demo.com',
        avatarId: undefined,
    },
    {
        ...baseDoc,
        $id: DEMO_MEMBER_BOB_ID,
        $createdAt: '2025-01-11T09:00:00.000Z',
        $updatedAt: '2025-01-11T09:00:00.000Z',
        userId: 'demo-user-bob',
        workspaceId: DEMO_WORKSPACE_DEV_ID,
        role: 'CREATOR',
        name: 'Bob García',
        email: 'bob@demo.com',
        avatarId: undefined,
    },
    {
        ...baseDoc,
        $id: DEMO_MEMBER_CAROL_ID,
        $createdAt: '2025-01-12T09:00:00.000Z',
        $updatedAt: '2025-01-12T09:00:00.000Z',
        userId: 'demo-user-carol',
        workspaceId: DEMO_WORKSPACE_MKT_ID,
        role: 'VIEWER',
        name: 'Carol López',
        email: 'carol@demo.com',
        avatarId: undefined,
    },
];

// ─── Workspaces ──────────────────────────────────────────────────────────────
export const DEMO_WORKSPACES_DATA: Models.DocumentList<WorkspaceType> = {
    total: 2,
    documents: [
        {
            ...baseDoc,
            $id: DEMO_WORKSPACE_DEV_ID,
            $createdAt: '2025-01-10T08:00:00.000Z',
            $updatedAt: '2025-01-10T08:00:00.000Z',
            name: 'Development',
            inviteCode: 'DEMO01',
            description: 'Main development workspace',
        },
        {
            ...baseDoc,
            $id: DEMO_WORKSPACE_MKT_ID,
            $createdAt: '2025-01-10T08:05:00.000Z',
            $updatedAt: '2025-01-10T08:05:00.000Z',
            name: 'Marketing',
            inviteCode: 'DEMO02',
            description: 'Marketing campaigns and content',
        },
    ],
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
const makeDemoTask = (
    id: string,
    name: string,
    status: TaskStatus,
    workspaceId: string,
    extra: Partial<Task> = {}
): Task => ({
    ...baseDoc,
    $id: id,
    $createdAt: '2025-02-01T10:00:00.000Z',
    $updatedAt: '2025-02-01T10:00:00.000Z',
    name,
    status,
    workspaceId,
    position: 1000,
    dueDate: '2025-06-30',
    assignees: [],
    ...extra,
});

const DEMO_TASKS_LIST: Task[] = [
    makeDemoTask('demo-task-01', 'Set up CI/CD pipeline', TaskStatus.DONE, DEMO_WORKSPACE_DEV_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[0]],
        priority: 2,
        dueDate: '2025-04-10',
        completedAt: '2025-04-09T14:00:00.000Z',
    }),
    makeDemoTask('demo-task-02', 'Implement authentication module', TaskStatus.IN_REVIEW, DEMO_WORKSPACE_DEV_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[1]],
        priority: 1,
        dueDate: '2025-04-20',
        featured: true,
    }),
    makeDemoTask('demo-task-03', 'Design database schema', TaskStatus.IN_PROGRESS, DEMO_WORKSPACE_DEV_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[0], DEMO_WORKSPACE_MEMBERS[1]],
        priority: 2,
        dueDate: '2025-04-25',
    }),
    makeDemoTask('demo-task-04', 'Write unit tests for API', TaskStatus.TODO, DEMO_WORKSPACE_DEV_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[1]],
        priority: 3,
        dueDate: '2025-05-05',
    }),
    makeDemoTask('demo-task-05', 'Performance optimization review', TaskStatus.BACKLOG, DEMO_WORKSPACE_DEV_ID, {
        priority: 3,
        dueDate: '2025-05-15',
    }),
    makeDemoTask('demo-task-06', 'Fix login redirect bug', TaskStatus.TODO, DEMO_WORKSPACE_DEV_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[0]],
        priority: 1,
        dueDate: '2025-04-18',
        type: 'bug',
    }),
    makeDemoTask('demo-task-07', 'Q2 content calendar', TaskStatus.IN_PROGRESS, DEMO_WORKSPACE_MKT_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[2]],
        priority: 2,
        dueDate: '2025-04-30',
    }),
    makeDemoTask('demo-task-08', 'Launch email campaign', TaskStatus.TODO, DEMO_WORKSPACE_MKT_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[2]],
        priority: 1,
        dueDate: '2025-05-10',
        featured: true,
    }),
    makeDemoTask('demo-task-09', 'SEO audit and strategy', TaskStatus.BACKLOG, DEMO_WORKSPACE_MKT_ID, {
        priority: 3,
        dueDate: '2025-05-20',
    }),
    makeDemoTask('demo-task-10', 'Brand guidelines update', TaskStatus.DONE, DEMO_WORKSPACE_MKT_ID, {
        assignees: [DEMO_WORKSPACE_MEMBERS[2]],
        priority: 2,
        dueDate: '2025-03-28',
        completedAt: '2025-03-27T11:30:00.000Z',
    }),
];

export const DEMO_TASKS_DATA: Models.DocumentList<Task> = {
    total: DEMO_TASKS_LIST.length,
    documents: DEMO_TASKS_LIST,
};

// ─── Deals ───────────────────────────────────────────────────────────────────

// Deal assignees use runtime object format despite the types.ts definition
export type DealAssignee = { id: string; memberId: string; name: string; email: string; avatarId: string | null };
export type DealWithAssignees = Omit<Deal, 'assignees'> & { assignees: DealAssignee[] };

const makeDemoDeal = (
    id: string,
    title: string,
    status: Deal['status'],
    outcome: Deal['outcome'],
    amount: number,
    company: string,
    extra: Partial<DealWithAssignees> = {}
): DealWithAssignees => ({
    id,
    title,
    description: '',
    status,
    assignees: [],
    amount,
    currency: 'USD',
    contactId: `contact-${id}`,
    companyResponsabileName: 'John Smith',
    companyResponsabileEmail: `contact@${company.toLowerCase().replace(/\s/g, '')}.com`,
    companyResponsabilePhoneNumber: '+1 555 000 0000',
    company,
    expectedCloseDate: '2025-06-30',
    lastStageChangedAt: '2025-03-15T10:00:00.000Z',
    healthScore: 75,
    needsAttention: false,
    priority: 2,
    nextStep: '',
    outcome,
    activities: [],
    linkedDraftId: null,
    labelId: null,
    ...extra,
});

const DEMO_DEALS_LIST: DealWithAssignees[] = [
    makeDemoDeal('demo-deal-01', 'Enterprise License Renewal', 'NEGOTIATION', 'PENDING', 48000, 'TechCorp Inc.', {
        assignees: [{ id: 'da-01', memberId: DEMO_MEMBER_ALICE_ID, name: 'Alice Martín', email: 'alice@demo.com', avatarId: null }],
        healthScore: 85,
        expectedCloseDate: '2025-05-15',
        activities: [
            { id: 'act-01', content: 'Initial call completed. Client interested.', author: DEMO_MEMBER_ALICE_ID, timestamp: '2025-03-01T10:00:00.000Z' },
            { id: 'act-02', content: 'Proposal sent.', author: DEMO_MEMBER_ALICE_ID, timestamp: '2025-03-10T14:00:00.000Z' },
        ],
    }),
    makeDemoDeal('demo-deal-02', 'SaaS Platform Upgrade', 'QUALIFICATION', 'PENDING', 12500, 'Innova Solutions', {
        assignees: [{ id: 'da-02', memberId: DEMO_MEMBER_BOB_ID, name: 'Bob García', email: 'bob@demo.com', avatarId: null }],
        healthScore: 60,
        expectedCloseDate: '2025-05-30',
        activities: [
            { id: 'act-03', content: 'Discovery meeting scheduled.', author: DEMO_MEMBER_BOB_ID, timestamp: '2025-03-20T11:00:00.000Z' },
        ],
    }),
    makeDemoDeal('demo-deal-03', 'Annual Support Contract', 'CLOSED', 'WON', 8000, 'Global Retail Co.', {
        assignees: [{ id: 'da-03', memberId: DEMO_MEMBER_ALICE_ID, name: 'Alice Martín', email: 'alice@demo.com', avatarId: null }],
        healthScore: 100,
        expectedCloseDate: '2025-03-31',
        lastStageChangedAt: '2025-03-28T09:00:00.000Z',
        activities: [
            { id: 'act-04', content: 'Contract signed and payment received.', author: DEMO_MEMBER_ALICE_ID, timestamp: '2025-03-28T09:00:00.000Z', type: 'step-completed' },
        ],
    }),
    makeDemoDeal('demo-deal-04', 'Marketing Automation Tool', 'LEADS', 'PENDING', 5500, 'StartupXYZ', {
        assignees: [{ id: 'da-04', memberId: DEMO_MEMBER_BOB_ID, name: 'Bob García', email: 'bob@demo.com', avatarId: null }],
        healthScore: 40,
        needsAttention: true,
        expectedCloseDate: '2025-06-15',
    }),
    makeDemoDeal('demo-deal-05', 'Data Analytics Package', 'CLOSED', 'LOST', 22000, 'MegaCorp', {
        assignees: [{ id: 'da-05', memberId: DEMO_MEMBER_ALICE_ID, name: 'Alice Martín', email: 'alice@demo.com', avatarId: null }],
        healthScore: 0,
        expectedCloseDate: '2025-04-01',
        activities: [
            { id: 'act-05', content: 'Client chose competitor solution.', author: DEMO_MEMBER_ALICE_ID, timestamp: '2025-04-01T16:00:00.000Z' },
        ],
    }),
    makeDemoDeal('demo-deal-06', 'Cloud Migration Consulting', 'NEGOTIATION', 'PENDING', 35000, 'FinServ Ltd.', {
        assignees: [
            { id: 'da-06', memberId: DEMO_MEMBER_ALICE_ID, name: 'Alice Martín', email: 'alice@demo.com', avatarId: null },
            { id: 'da-07', memberId: DEMO_MEMBER_BOB_ID, name: 'Bob García', email: 'bob@demo.com', avatarId: null },
        ],
        healthScore: 72,
        expectedCloseDate: '2025-06-01',
        priority: 1,
        activities: [
            { id: 'act-06', content: 'Technical review completed.', author: DEMO_MEMBER_BOB_ID, timestamp: '2025-03-25T13:00:00.000Z' },
        ],
    }),
];

export const DEMO_DEALS_DATA: { total: number; documents: DealWithAssignees[] } = {
    total: DEMO_DEALS_LIST.length,
    documents: DEMO_DEALS_LIST,
};

// ─── Sales Board ──────────────────────────────────────────────────────────────
export const DEMO_SALES_BOARD_ID = 'demo-board-01';

export const DEMO_SALES_BOARD_DATA: { total: number; documents: SalesBoard[] } = {
    total: 1,
    documents: [
        {
            id: DEMO_SALES_BOARD_ID,
            teamId: 'demo-team',
            name: 'Main Pipeline',
            currencies: ['USD'],
            activeGoalId: null,
            createdAt: '2025-01-10T08:00:00.000Z',
            labels: [],
        },
    ],
};

type DemoSellerDoc = {
    $id: string;
    memberId: string;
    name: string;
    email: string;
    avatarId: string | null;
};

export const DEMO_SELLERS_DATA: { total: number; documents: DemoSellerDoc[] } = {
    total: 3,
    documents: [
        { $id: DEMO_MEMBER_ALICE_ID, memberId: DEMO_MEMBER_ALICE_ID, name: 'Alice Martín', email: 'alice@demo.com', avatarId: null },
        { $id: DEMO_MEMBER_BOB_ID, memberId: DEMO_MEMBER_BOB_ID, name: 'Bob García', email: 'bob@demo.com', avatarId: null },
        { $id: DEMO_MEMBER_CAROL_ID, memberId: DEMO_MEMBER_CAROL_ID, name: 'Carol López', email: 'carol@demo.com', avatarId: null },
    ],
};

export type BillingDoc = Models.Document & {
    type: 'income' | 'expense';
    import: number;
    currency: string;
    category: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    date: string;
    dueDate?: string;
    invoiceNumber?: string;
    partyName?: string;
    paymentMethod?: string;
    isArchived?: boolean;
    isDraft?: boolean;
    note?: string;
    teamId: string;
};

// ─── Billing Operations ───────────────────────────────────────────────────────

const makeBillingDoc = (
    id: string,
    type: BillingDoc['type'],
    amount: number,
    category: string,
    status: BillingDoc['status'],
    partyName: string,
    extra: Partial<BillingDoc> = {}
): BillingDoc => ({
    ...baseDoc,
    $id: id,
    $createdAt: '2025-03-01T10:00:00.000Z',
    $updatedAt: '2025-03-01T10:00:00.000Z',
    type,
    import: amount,
    currency: 'USD',
    category,
    status,
    date: '2025-03-01T00:00:00.000Z',
    partyName,
    teamId: 'demo-team',
    isArchived: false,
    isDraft: false,
    ...extra,
});

const DEMO_BILLING_LIST: BillingDoc[] = [
    // March 2026 (previous month)
    makeBillingDoc('demo-bill-01', 'income', 48000, 'Sales', 'PAID', 'TechCorp Inc.', {
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-03-28T00:00:00.000Z',
        $updatedAt: '2026-04-09T10:00:00.000Z',
        invoiceNumber: 'INV-2026-001',
        note: 'Enterprise License Q1',
    }),
    makeBillingDoc('demo-bill-02', 'income', 8000, 'Sales', 'PAID', 'Global Retail Co.', {
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-03-28T00:00:00.000Z',
        invoiceNumber: 'INV-2026-002',
    }),
    makeBillingDoc('demo-bill-03', 'expense', 2400, 'Infrastructure', 'PAID', 'AWS', {
        paymentMethod: 'CREDIT_CARD',
        date: '2026-03-01T00:00:00.000Z',
        invoiceNumber: 'AWS-MAR-2026',
        note: 'Monthly cloud hosting',
    }),
    makeBillingDoc('demo-bill-04', 'expense', 1200, 'Software', 'PAID', 'GitHub', {
        paymentMethod: 'CREDIT_CARD',
        date: '2026-03-01T00:00:00.000Z',
        invoiceNumber: 'GH-MAR-2026',
    }),
    makeBillingDoc('demo-bill-07', 'expense', 3500, 'Salaries', 'PENDING', 'Freelancer Pool', {
        date: '2026-03-15T00:00:00.000Z',
        dueDate: '2026-03-31T00:00:00.000Z',
        invoiceNumber: 'FREEL-2026-01',
        note: 'Q1 contractor invoices',
    }),
    // April 2026 (current month)
    makeBillingDoc('demo-bill-05', 'income', 12500, 'Sales', 'PENDING', 'Innova Solutions', {
        date: '2026-04-05T00:00:00.000Z',
        dueDate: '2026-04-14T00:00:00.000Z',
        invoiceNumber: 'INV-2026-003',
        note: 'SaaS Platform Upgrade invoice',
    }),
    makeBillingDoc('demo-bill-06', 'expense', 800, 'Marketing', 'PENDING', 'Google Ads', {
        date: '2026-04-01T00:00:00.000Z',
        dueDate: '2026-04-30T00:00:00.000Z',
    }),
    // February 2026 (for projection average)
    makeBillingDoc('demo-bill-08', 'income', 22000, 'Sales', 'PAID', 'MegaClient Corp', {
        paymentMethod: 'BANK_TRANSFER',
        date: '2026-02-20T00:00:00.000Z',
        invoiceNumber: 'INV-2026-FEB-01',
    }),
    makeBillingDoc('demo-bill-09', 'expense', 3600, 'Infrastructure', 'PAID', 'Cloud Services', {
        paymentMethod: 'CREDIT_CARD',
        date: '2026-02-01T00:00:00.000Z',
        note: 'Monthly infrastructure costs',
    }),
];

export const DEMO_BILLING_DATA: Models.DocumentList<BillingDoc> = {
    total: DEMO_BILLING_LIST.length,
    documents: DEMO_BILLING_LIST,
};

const DEMO_BILLING_DRAFTS_LIST: BillingDoc[] = [
    makeBillingDoc('demo-draft-01', 'income', 35000, 'Sales', 'PENDING', 'FinServ Ltd.', {
        isDraft: true,
        date: '2026-04-01T00:00:00.000Z',
        dueDate: '2026-05-01T00:00:00.000Z',
        invoiceNumber: 'DRAFT-2026-001',
        note: 'Cloud Migration Consulting - draft proposal',
    }),
    makeBillingDoc('demo-draft-02', 'income', 5500, 'Sales', 'PENDING', 'StartupXYZ', {
        isDraft: true,
        date: '2026-04-01T00:00:00.000Z',
        dueDate: '2026-05-15T00:00:00.000Z',
        invoiceNumber: 'DRAFT-2026-002',
        note: 'Marketing Automation Tool quote',
    }),
];

export const DEMO_BILLING_DRAFTS_DATA: Models.DocumentList<BillingDoc> = {
    total: DEMO_BILLING_DRAFTS_LIST.length,
    documents: DEMO_BILLING_DRAFTS_LIST,
};

const DEMO_BILLING_ARCHIVED_LIST: BillingDoc[] = [
    makeBillingDoc('demo-arch-01', 'income', 15000, 'Sales', 'PAID', 'OldClient Corp.', {
        isArchived: true,
        date: '2024-12-15T00:00:00.000Z',
    }),
];

export const DEMO_BILLING_ARCHIVED_DATA: Models.DocumentList<BillingDoc> = {
    total: DEMO_BILLING_ARCHIVED_LIST.length,
    documents: DEMO_BILLING_ARCHIVED_LIST,
};

// ─── Billing Options (Categories) ────────────────────────────────────────────
type BillingOptionsDoc = Models.Document & {
    teamId: string;
    incomeCategories: string[];
    expenseCategories: string[];
};

export const DEMO_BILLING_OPTIONS: Models.DocumentList<BillingOptionsDoc> = {
    total: 1,
    documents: [
        {
            ...baseDoc,
            $id: 'demo-billing-options-01',
            $createdAt: '2025-01-01T00:00:00.000Z',
            $updatedAt: '2025-01-01T00:00:00.000Z',
            teamId: 'demo-team',
            incomeCategories: ['Sales', 'Services', 'Consulting', 'Other Income'],
            expenseCategories: ['Infrastructure', 'Software', 'Marketing', 'Salaries', 'Operations'],
        },
    ],
};

// ─── Records / Tables ─────────────────────────────────────────────────────────
type TableDoc = Models.Document & {
    tableName: string;
    headers: string[];
    teamId: string;
    createdBy: string;
};

type RecordDoc = Models.Document & {
    data: string[];
    tableId: string;
    teamId: string;
    createdBy: string;
};

export const DEMO_TABLE_CLIENTS_ID = 'demo-table-clients-01';
export const DEMO_TABLE_SUPPLIERS_ID = 'demo-table-suppliers-02';

const DEMO_TABLES_LIST: TableDoc[] = [
    {
        ...baseDoc,
        $id: DEMO_TABLE_CLIENTS_ID,
        $createdAt: '2025-01-15T10:00:00.000Z',
        $updatedAt: '2025-01-15T10:00:00.000Z',
        tableName: 'Clients',
        headers: ['Name', 'Industry', 'Country', 'Annual Revenue', 'Status'],
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
    },
    {
        ...baseDoc,
        $id: DEMO_TABLE_SUPPLIERS_ID,
        $createdAt: '2025-01-16T10:00:00.000Z',
        $updatedAt: '2025-01-16T10:00:00.000Z',
        tableName: 'Suppliers',
        headers: ['Company', 'Service', 'Contact Email', 'Monthly Cost', 'Contract Until'],
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
    },
];

export const DEMO_TABLES_DATA: Models.DocumentList<TableDoc> = {
    total: DEMO_TABLES_LIST.length,
    documents: DEMO_TABLES_LIST,
};

const DEMO_RECORDS_CLIENTS: RecordDoc[] = [
    {
        ...baseDoc,
        $id: 'demo-rec-01',
        $createdAt: '2025-01-20T10:00:00.000Z',
        $updatedAt: '2025-01-20T10:00:00.000Z',
        tableId: DEMO_TABLE_CLIENTS_ID,
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
        data: ['"TechCorp Inc."', '"Technology"', '"USA"', '"$2.4M"', '"Active"'],
    },
    {
        ...baseDoc,
        $id: 'demo-rec-02',
        $createdAt: '2025-01-21T10:00:00.000Z',
        $updatedAt: '2025-01-21T10:00:00.000Z',
        tableId: DEMO_TABLE_CLIENTS_ID,
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
        data: ['"Innova Solutions"', '"Software"', '"UK"', '"$800K"', '"Active"'],
    },
    {
        ...baseDoc,
        $id: 'demo-rec-03',
        $createdAt: '2025-01-22T10:00:00.000Z',
        $updatedAt: '2025-01-22T10:00:00.000Z',
        tableId: DEMO_TABLE_CLIENTS_ID,
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
        data: ['"Global Retail Co."', '"Retail"', '"Germany"', '"$5.1M"', '"Active"'],
    },
];

const DEMO_RECORDS_SUPPLIERS: RecordDoc[] = [
    {
        ...baseDoc,
        $id: 'demo-rec-04',
        $createdAt: '2025-01-20T10:00:00.000Z',
        $updatedAt: '2025-01-20T10:00:00.000Z',
        tableId: DEMO_TABLE_SUPPLIERS_ID,
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
        data: ['"AWS"', '"Cloud Hosting"', '"aws@amazon.com"', '"$2,400"', '"2026-12-31"'],
    },
    {
        ...baseDoc,
        $id: 'demo-rec-05',
        $createdAt: '2025-01-21T10:00:00.000Z',
        $updatedAt: '2025-01-21T10:00:00.000Z',
        tableId: DEMO_TABLE_SUPPLIERS_ID,
        teamId: 'demo-team',
        createdBy: 'demo-user-alice',
        data: ['"GitHub"', '"Version Control"', '"support@github.com"', '"$1,200"', '"2025-12-31"'],
    },
];

export const DEMO_RECORDS_BY_TABLE: Record<string, Models.DocumentList<RecordDoc>> = {
    [DEMO_TABLE_CLIENTS_ID]: {
        total: DEMO_RECORDS_CLIENTS.length,
        documents: DEMO_RECORDS_CLIENTS,
    },
    [DEMO_TABLE_SUPPLIERS_ID]: {
        total: DEMO_RECORDS_SUPPLIERS.length,
        documents: DEMO_RECORDS_SUPPLIERS,
    },
};

// ─── Org Members (for useGetMembers) ─────────────────────────────────────────
type OrgMember = {
    $id: string;
    appwriteMembershipId: string | null;
    userId: string;
    organizationId: string;
    appwriteTeamId: string;
    name: string;
    email: string;
    status: boolean;
    userName: string;
    userEmail: string;
    prefs: {
        image?: string;
        role: string;
        position: string;
        description: string;
        linkedin: string;
        tags: string;
        birthday: string;
        memberSince: string;
        currentProject: string;
    };
};

export const DEMO_ORG_MEMBERS: OrgMember[] = [
    {
        $id: 'demo-org-mem-01',
        appwriteMembershipId: null,
        userId: 'demo-user-alice',
        organizationId: 'demo-org',
        appwriteTeamId: 'demo-team',
        name: 'Alice Martín',
        email: 'alice@demo.com',
        status: true,
        userName: 'Alice Martín',
        userEmail: 'alice@demo.com',
        prefs: {
            role: 'OWNER',
            position: 'Head of Product',
            description: 'Leads product strategy and roadmap.',
            linkedin: '',
            tags: 'product,strategy',
            birthday: '',
            memberSince: '2025-01-10',
            currentProject: 'Platform V2',
            image: 'https://i.pravatar.cc/300?img=26',
        },
    },
    {
        $id: 'demo-org-mem-02',
        appwriteMembershipId: null,
        userId: 'demo-user-bob',
        organizationId: 'demo-org',
        appwriteTeamId: 'demo-team',
        name: 'Bob García',
        email: 'bob@demo.com',
        status: true,
        userName: 'Bob García',
        userEmail: 'bob@demo.com',
        prefs: {
            role: 'ADMIN',
            position: 'Senior Developer',
            description: 'Full-stack engineer focused on infrastructure.',
            linkedin: '',
            tags: 'development,devops',
            birthday: '',
            memberSince: '2025-01-11',
            currentProject: 'CI/CD Pipeline',
            image: 'https://i.pravatar.cc/300?img=12',
        },
    },
    {
        $id: 'demo-org-mem-03',
        appwriteMembershipId: null,
        userId: 'demo-user-carol',
        organizationId: 'demo-org',
        appwriteTeamId: 'demo-team',
        name: 'Carol López',
        email: 'carol@demo.com',
        status: true,
        userName: 'Carol López',
        userEmail: 'carol@demo.com',
        prefs: {
            role: 'CREATOR',
            position: 'Marketing Manager',
            description: 'Manages brand and digital campaigns.',
            linkedin: '',
            tags: 'marketing,design',
            birthday: '',
            memberSince: '2025-01-12',
            currentProject: 'Q2 Campaign',
            image: 'https://i.pravatar.cc/300?img=32',
        },
    },
];

// ─── Workspace Members list response (for useGetMembers) ─────────────────────
export const DEMO_WORKSPACE_MEMBERS_DATA: Models.DocumentList<WorkspaceMember> = {
    total: DEMO_WORKSPACE_MEMBERS.length,
    documents: DEMO_WORKSPACE_MEMBERS,
};

// ─── Demo Organization & Membership (fake team context) ──────────────────────
export const DEMO_ORG: Organization = {
    ...baseDoc,
    $id: 'demo-org-id',
    $createdAt: '2025-01-01T00:00:00.000Z',
    $updatedAt: '2025-01-01T00:00:00.000Z',
    name: 'Demo Company',
    plan: 'PRO',
    billingCycle: 'MONTHLY',
    subscriptionStatus: 'active',
    appwriteTeamId: 'demo-team-id',
    isDemo: true,
};

export const DEMO_MEMBERSHIP: Membership = {
    ...baseDoc,
    $id: 'demo-membership-id',
    $createdAt: '2025-01-01T00:00:00.000Z',
    $updatedAt: '2025-01-01T00:00:00.000Z',
    userId: 'demo-user-placeholder',
    organizationId: 'demo-org-id',
    role: 'OWNER',
    position: 'Demo User',
    memberSince: '2025-01-01',
};

// ─── Initial arrays for DemoDataContext ──────────────────────────────────────
export const DEMO_TASKS_INITIAL = DEMO_TASKS_DATA.documents;
export const DEMO_DEALS_INITIAL = DEMO_DEALS_DATA.documents;
export const DEMO_BILLING_INITIAL = DEMO_BILLING_DATA.documents;
export const DEMO_BILLING_DRAFTS_INITIAL = DEMO_BILLING_DRAFTS_DATA.documents;
export const DEMO_BILLING_ARCHIVED_INITIAL = DEMO_BILLING_ARCHIVED_DATA.documents;

// ─── Demo fake team membership IDs (used in messages) ────────────────────────
export const DEMO_TEAM_MEM_YOU_ID = 'demo-team-mem-you';
export const DEMO_TEAM_MEM_ALICE_ID = 'demo-team-mem-alice';
export const DEMO_TEAM_MEM_BOB_ID = 'demo-team-mem-bob';
export const DEMO_TEAM_MEM_CAROL_ID = 'demo-team-mem-carol';

import type { Message } from '@/features/home/components/messages/types';

export const DEMO_MESSAGES: Message[] = [
    {
        $id: 'demo-msg-01',
        $createdAt: '2025-03-10T09:15:00.000Z',
        $updatedAt: '2025-03-10T09:15:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        subject: 'Platform V2 – kickoff update',
        content: 'Hey! Just wanted to let you know the Platform V2 kickoff went great. The team is aligned on milestones. Let me know if you need the deck.',
        fromTeamMemberId: DEMO_TEAM_MEM_ALICE_ID,
        toTeamMemberId: DEMO_TEAM_MEM_YOU_ID,
        teamId: 'demo-team-id',
        read: false,
        featured: true,
    },
    {
        $id: 'demo-msg-02',
        $createdAt: '2025-03-11T14:30:00.000Z',
        $updatedAt: '2025-03-11T14:30:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        subject: 'CI/CD Pipeline blocked',
        content: 'Running into a permissions issue on the staging deploy. Can you check the environment variables? I think something is missing from the secrets store.',
        fromTeamMemberId: DEMO_TEAM_MEM_BOB_ID,
        toTeamMemberId: DEMO_TEAM_MEM_YOU_ID,
        teamId: 'demo-team-id',
        read: false,
    },
    {
        $id: 'demo-msg-03',
        $createdAt: '2025-03-12T11:00:00.000Z',
        $updatedAt: '2025-03-12T11:00:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        subject: 'Q2 Campaign – assets ready',
        content: 'The creatives for Q2 are ready for review. I uploaded everything to the shared folder. Could use your sign-off before we go live on Monday.',
        fromTeamMemberId: DEMO_TEAM_MEM_CAROL_ID,
        toTeamMemberId: DEMO_TEAM_MEM_YOU_ID,
        teamId: 'demo-team-id',
        read: true,
    },
    {
        $id: 'demo-msg-04',
        $createdAt: '2025-03-14T16:45:00.000Z',
        $updatedAt: '2025-03-14T16:45:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        subject: 'Weekly sync reminder',
        content: 'Just a reminder that our weekly sync is tomorrow at 10am. Please bring your sprint updates. Alice will also present the new roadmap proposal.',
        fromTeamMemberId: DEMO_TEAM_MEM_BOB_ID,
        toTeamMemberId: DEMO_TEAM_MEM_YOU_ID,
        teamId: 'demo-team-id',
        read: true,
    },
];

// ─── Notes ───────────────────────────────────────────────────────────────────
import type { NoteData } from '@/features/home/types';

export const DEMO_NOTES: NoteData[] = [
    {
        $id: 'demo-note-01',
        $createdAt: '2025-03-01T08:00:00.000Z',
        $updatedAt: '2025-03-01T08:00:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        userId: 'demo-user-placeholder',
        title: 'Q2 Priorities',
        content: 'Focus on platform stability, onboarding new enterprise clients, and closing the FinServ deal before end of April.',
        bgColor: 'bg-[#2662d9]',
        isModern: true,
        hasLines: false,
        isPinned: true,
        pinnedAt: '2025-03-01T08:00:00.000Z',
        isGlobal: false,
    },
    {
        $id: 'demo-note-02',
        $createdAt: '2025-03-05T10:30:00.000Z',
        $updatedAt: '2025-03-05T10:30:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        userId: 'demo-user-placeholder',
        title: 'Team Standup Notes',
        content: 'Alice: CI/CD progress. Bob: API docs review. Carol: Campaign assets ready for sign-off.',
        bgColor: 'none',
        isModern: false,
        hasLines: true,
        isPinned: false,
        isGlobal: false,
    },
    {
        $id: 'demo-note-03',
        $createdAt: '2025-03-10T14:00:00.000Z',
        $updatedAt: '2025-03-10T14:00:00.000Z',
        $collectionId: 'demo',
        $databaseId: 'demo',
        $permissions: [],
        userId: 'demo-user-placeholder',
        title: 'Product Ideas',
        content: 'Bulk task import from CSV, Kanban swimlanes by assignee, calendar sync with Google.',
        bgColor: 'bg-[#2eb88a]',
        isModern: true,
        hasLines: false,
        isPinned: false,
        isGlobal: true,
        globalAt: '2025-03-10T14:00:00.000Z',
    },
];

export const DEMO_NOTES_INITIAL = DEMO_NOTES;

// ─── Recent Activity ──────────────────────────────────────────────────────────
import type { RecentActivityItem } from '@/features/home/api/use-get-recent-activity';

export const DEMO_RECENT_ACTIVITY: RecentActivityItem[] = [
    {
        id: 'act-demo-01',
        type: 'deal_won',
        actorName: 'Alice Martín',
        action: 'closed',
        title: 'SaaS Expansion',
        amount: 25000,
        currency: 'USD',
        timestamp: '2025-03-14T10:00:00.000Z',
    },
    {
        id: 'act-demo-02',
        type: 'task_activity',
        actorName: 'Bob García',
        action: 'completed',
        title: 'Deploy v2.4 to production',
        timestamp: '2025-03-13T16:30:00.000Z',
    },
    {
        id: 'act-demo-03',
        type: 'deal_created',
        actorName: 'Carol López',
        action: 'created',
        title: 'Cloud Migration Consulting',
        amount: 35000,
        currency: 'USD',
        timestamp: '2025-03-12T09:15:00.000Z',
    },
    {
        id: 'act-demo-04',
        type: 'task_activity',
        actorName: 'Alice Martín',
        action: 'updated',
        title: 'Q2 Marketing Campaign',
        timestamp: '2025-03-11T11:45:00.000Z',
    },
];
