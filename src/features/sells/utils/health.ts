import { differenceInDays } from "date-fns";
import type { ActivityEntry, DealOutcome, DealStage } from "../types";

/**
 * Stage-specific expected activity cadence (days).
 * Deals in later stages require more frequent engagement.
 */
const STAGE_CADENCE: Record<DealStage, number> = {
    LEADS: 7,
    QUALIFICATION: 5,
    NEGOTIATION: 3,
    CLOSED: 9_999,
};

/**
 * Stage-specific maximum expected duration before stagnation.
 */
const STAGE_MAX_DURATION: Record<DealStage, number> = {
    LEADS: 21,
    QUALIFICATION: 14,
    NEGOTIATION: 14,
    CLOSED: 9_999,
};

export type HealthInput = {
    outcome: DealOutcome | string;
    status: DealStage;
    expectedCloseDate: string | null;
    lastStageChangedAt: string | null;
    activities: ActivityEntry[];
    nextStep: string;
};

export type HealthSignalStatus = "ok" | "warn";

export type HealthSignalKey =
    | "activity-none"
    | "activity-overdue"
    | "activity-stale"
    | "activity-ok"
    | "close-date-missing"
    | "close-date-overdue"
    | "close-date-imminent"
    | "close-date-approaching"
    | "close-date-ok"
    | "stage-fresh"
    | "stage-critical"
    | "stage-stagnant"
    | "stage-ok"
    | "next-step-missing"
    | "next-step-ok";

export type HealthSignal = {
    key: HealthSignalKey;
    params?: Record<string, number | string>;
    status: HealthSignalStatus;
};

// ── Component scorers ────────────────────────────────────────────────────────

function activityComponentScore(daysSince: number | null, stage: DealStage): number {
    if (daysSince === null) return 0;
    const cadence = STAGE_CADENCE[stage];
    // 100 at 0 days → 50 at 1× cadence → 0 at 2× cadence
    return Math.max(0, Math.round(100 - (daysSince / cadence) * 50));
}

function timelineComponentScore(daysUntil: number | null): number {
    if (daysUntil === null) return 40;
    if (daysUntil < 0) return 0;
    if (daysUntil >= 30) return 100;
    if (daysUntil >= 14) return Math.round(75 + ((daysUntil - 14) / 16) * 25);
    if (daysUntil >= 7) return Math.round(50 + ((daysUntil - 7) / 7) * 25);
    if (daysUntil >= 3) return Math.round(30 + ((daysUntil - 3) / 4) * 20);
    return Math.round(15 + (daysUntil / 3) * 15);
}

function stagnationComponentScore(daysInStage: number | null, stage: DealStage): number {
    if (daysInStage === null) return 100;
    const maxDuration = STAGE_MAX_DURATION[stage];
    return Math.max(0, Math.round(100 - (daysInStage / maxDuration) * 100));
}

function completenessComponentScore(hasCloseDate: boolean, hasNextStep: boolean): number {
    let score = 0;
    if (hasCloseDate) score += 50;
    if (hasNextStep) score += 50;
    return score;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Computes a deal's health score (0–100) as a weighted average of four components:
 *   35% – Activity recency   (stage-specific cadence: LEADS=7d, QUAL=5d, NEG=3d)
 *   30% – Timeline health    (days until expected close date)
 *   25% – Stage momentum     (stage-specific max duration: LEADS=21d, QUAL/NEG=14d)
 *   10% – Completeness       (close date + next step defined)
 *
 * Returns score=0 / needsAttention=false for resolved (WON/LOST) deals.
 */
export function computeHealthScore(
    deal: HealthInput
): { healthScore: number; needsAttention: boolean } {
    if (deal.outcome !== "PENDING") {
        return { healthScore: 0, needsAttention: false };
    }

    const today = new Date();
    const stage = deal.status;

    const lastActivityMs =
        deal.activities.length > 0
            ? Math.max(...deal.activities.map((a) => new Date(a.timestamp).getTime()))
            : null;
    const daysSinceActivity =
        lastActivityMs !== null ? differenceInDays(today, new Date(lastActivityMs)) : null;

    const daysUntilClose =
        deal.expectedCloseDate !== null
            ? differenceInDays(new Date(deal.expectedCloseDate), today)
            : null;

    const daysInStage =
        deal.lastStageChangedAt !== null
            ? differenceInDays(today, new Date(deal.lastStageChangedAt))
            : null;

    const hasCloseDate = deal.expectedCloseDate !== null;
    const hasNextStep = Boolean(deal.nextStep?.trim());

    const aScore = activityComponentScore(daysSinceActivity, stage);
    const tScore = timelineComponentScore(daysUntilClose);
    const sScore = stagnationComponentScore(daysInStage, stage);
    const cScore = completenessComponentScore(hasCloseDate, hasNextStep);

    const total = Math.round(0.35 * aScore + 0.30 * tScore + 0.25 * sScore + 0.10 * cScore);
    const finalScore = Math.max(0, Math.min(100, total));

    const cadence = STAGE_CADENCE[stage];
    const maxDuration = STAGE_MAX_DURATION[stage];

    const isOverdue = daysUntilClose !== null && daysUntilClose < 0;
    const isInactive = daysSinceActivity === null || daysSinceActivity > cadence * 2;
    const isStagnant = daysInStage !== null && daysInStage > maxDuration;

    return {
        healthScore: finalScore,
        needsAttention: isOverdue || isInactive || isStagnant || finalScore < 50,
    };
}

/**
 * Returns an ordered list of health signals that explain the score.
 * Each signal carries a translation key and optional ICU parameters
 * to be rendered via `t(`signals.${signal.key}`, signal.params)`.
 */
export function computeHealthSignals(deal: HealthInput): HealthSignal[] {
    const today = new Date();
    const stage = deal.status;
    const cadence = STAGE_CADENCE[stage];
    const maxDuration = STAGE_MAX_DURATION[stage];
    const signals: HealthSignal[] = [];

    // 1. Activity recency (stage-aware cadence)
    const lastActivityMs =
        deal.activities.length > 0
            ? Math.max(...deal.activities.map((a) => new Date(a.timestamp).getTime()))
            : null;

    if (lastActivityMs === null) {
        signals.push({ key: "activity-none", status: "warn" });
    } else {
        const daysSince = differenceInDays(today, new Date(lastActivityMs));
        if (daysSince > cadence * 2) {
            signals.push({ key: "activity-overdue", params: { days: daysSince, cadence }, status: "warn" });
        } else if (daysSince > cadence) {
            signals.push({ key: "activity-stale", params: { days: daysSince, cadence }, status: "warn" });
        } else {
            signals.push({ key: "activity-ok", params: { days: daysSince }, status: "ok" });
        }
    }

    // 2. Close date health
    if (!deal.expectedCloseDate) {
        signals.push({ key: "close-date-missing", status: "warn" });
    } else {
        const daysUntil = differenceInDays(new Date(deal.expectedCloseDate), today);
        if (daysUntil < 0) {
            signals.push({ key: "close-date-overdue", params: { days: Math.abs(daysUntil) }, status: "warn" });
        } else if (daysUntil <= 7) {
            signals.push({ key: "close-date-imminent", params: { days: daysUntil }, status: "warn" });
        } else if (daysUntil <= 30) {
            signals.push({ key: "close-date-approaching", params: { days: daysUntil }, status: "ok" });
        } else {
            signals.push({ key: "close-date-ok", params: { days: daysUntil }, status: "ok" });
        }
    }

    // 3. Stage momentum (stage-aware max duration)
    if (deal.lastStageChangedAt === null) {
        signals.push({ key: "stage-fresh", status: "ok" });
    } else {
        const daysInStage = differenceInDays(today, new Date(deal.lastStageChangedAt));
        if (daysInStage > maxDuration * 2) {
            signals.push({ key: "stage-critical", params: { days: daysInStage, max: maxDuration }, status: "warn" });
        } else if (daysInStage > maxDuration) {
            signals.push({ key: "stage-stagnant", params: { days: daysInStage, max: maxDuration }, status: "warn" });
        } else {
            signals.push({ key: "stage-ok", params: { days: daysInStage, max: maxDuration }, status: "ok" });
        }
    }

    // 4. Next step
    if (!deal.nextStep || deal.nextStep.trim() === "") {
        signals.push({ key: "next-step-missing", status: "warn" });
    } else {
        signals.push({ key: "next-step-ok", status: "ok" });
    }

    return signals;
}
