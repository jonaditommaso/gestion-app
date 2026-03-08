export type WorkItemPriority = 1 | 2 | 3;

export type DealOutcome = "PENDING" | "WON" | "LOST";

export type Seller = {
  id: string;
  memberId: string;
  name: string;
  initials: string;
  avatarId: string | null;
};

export type DealStage = "LEADS" | "QUALIFICATION" | "NEGOTIATION" | "CLOSED";

export type DealCurrency = "USD" | "EUR" | "ARS" | "GBP" | "BRL" | "UYU" | "MXN";

export type ActivityEntry = {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type?: "step-completed";
};

export type WorkItem = {
  id: string;
  title: string;
  description: string;
  status: DealStage;
  assignees: string[];
};

export type SalesBoard = {
  id: string;
  teamId: string;
  name: string;
  currencies: DealCurrency[];
  activeGoalId: string | null;
  createdAt: string;
};

export type SalesGoal = {
  id: string;
  boardId: string;
  period: string;
  targetAmount: number;
  targetReached: boolean;
  currency: DealCurrency;
  totalDeals: number;
  totalDealsWon: number;
};

export type Deal = WorkItem & {
  amount: number;
  currency: DealCurrency;
  contactId: string;
  companyResponsabileName: string;
  companyResponsabileEmail: string;
  companyResponsabilePhoneNumber: string;
  company: string;
  expectedCloseDate: string | null;
  lastStageChangedAt: string | null;
  healthScore: number;
  needsAttention: boolean;
  priority: WorkItemPriority;
  nextStep: string;
  outcome: DealOutcome;
  activities: ActivityEntry[];
  linkedDraftId?: string | null;
};