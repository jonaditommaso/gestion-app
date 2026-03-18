import { Button } from "@/components/ui/button";
import { DATABASE_ID, MEMBERSHIPS_ID, SALES_BOARDS_ID, STRIPE_SECRET_KEY, WORKSPACES_ID } from "@/config";
import { getCurrent } from "@/features/auth/queries";
import { planLimits, planPrices } from "@/features/pricing/plan-limits";
import CancelSubscriptionButton from "@/features/team/components/CancelSubscriptionButton";
import { Membership, Organization } from "@/features/team/types";
import { getActiveContext } from "@/features/team/server/utils";
import { createAdminClient } from "@/lib/appwrite";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import Stripe from "stripe";

const formatPlan = (plan: Organization['plan']) => {
    if (plan === 'PLUS') return 'Plus';
    return `${plan.charAt(0)}${plan.slice(1).toLowerCase()}`;
};

const formatStatus = (status: string, t: Awaited<ReturnType<typeof getTranslations>>) => {
    if (status === 'active') return t('status-active');
    if (status === 'paid') return t('status-active');
    if (status === 'canceling') return t('status-canceling');
    if (status === 'canceled') return t('status-expired');
    if (status === 'free') return t('status-active');
    return status;
};

const formatStatusColor = (status: string) => {
    if (status === 'canceling') return 'text-amber-500';
    if (status === 'canceled') return 'text-red-500';
    return 'text-green-500';
};

const getCurrentUsageFont = (current: number, limit: number) => {
    if (current < limit) return 'font-light';
    return 'font-medium';
};

const OrganizationPage = async () => {
    const user = await getCurrent();
    if (!user) redirect('/login');

    const t = await getTranslations('organization');
    const { databases } = await createAdminClient();
    const cookieStore = await cookies();
    const activeMembershipId = cookieStore.get('active-org-id')?.value;
    const context = await getActiveContext(user, databases, activeMembershipId);

    if (!context) {
        return (
            <div className="w-full mt-24 px-6">
                <h1 className="text-2xl font-semibold">{t('organization-settings')}</h1>
                <p className="text-sm text-muted-foreground mt-3">{t('no-active-organization')}</p>
            </div>
        );
    }

    const { org, membership } = context;

    if (membership.role !== 'OWNER') redirect('/');

    const [membersResult, workspacesResult, pipelinesResult] = await Promise.all([
        databases.listDocuments<Membership>(
            DATABASE_ID,
            MEMBERSHIPS_ID,
            [Query.equal('organizationId', org.$id)]
        ),
        databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [Query.equal('teamId', org.appwriteTeamId)]
        ),
        databases.listDocuments(
            DATABASE_ID,
            SALES_BOARDS_ID,
            [Query.equal('teamId', org.appwriteTeamId)]
        ),
    ]);

    const limits = planLimits[org.plan];
    const prices = planPrices[org.plan];
    const membersCount = membersResult.total;
    const workspacesCount = workspacesResult.total;
    const pipelinesCount = pipelinesResult.total;

    const isYearly = org.billingCycle === 'YEARLY';
    const planPrice = isYearly ? prices.annual : prices.monthly;
    type StripeInvoice = {
        id: string;
        date: string;
        amount: string;
        status: string;
        pdfUrl: string | null;
    };

    let invoices: StripeInvoice[] = [];
    let customerName: string | null = null;
    let customerEmail: string | null = null;
    let customerLocation: string | null = null;
    let livePaymentMethodLast4: string | null = null;

    if (org.stripeCustomerId) {
        try {
            const stripe = new Stripe(STRIPE_SECRET_KEY);
            const [result, customer, paymentMethods] = await Promise.all([
                stripe.invoices.list({ customer: org.stripeCustomerId, limit: 10 }),
                stripe.customers.retrieve(org.stripeCustomerId, {
                    expand: ['invoice_settings.default_payment_method'],
                }),
                stripe.paymentMethods.list({
                    customer: org.stripeCustomerId,
                    type: 'card',
                    limit: 1,
                }),
            ]);

            invoices = result.data.map(inv => ({
                id: inv.id ?? '',
                date: inv.created ? new Date(inv.created * 1000).toLocaleDateString() : '—',
                amount: inv.amount_paid != null
                    ? `$${(inv.amount_paid / 100).toFixed(2)}`
                    : '—',
                status: inv.status ?? 'unknown',
                pdfUrl: inv.invoice_pdf ?? null,
            }));

            if (!('deleted' in customer && customer.deleted)) {
                customerName = customer.name ?? null;
                customerEmail = customer.email ?? null;

                const address = customer.address;
                const locationParts = [address?.city, address?.state, address?.country].filter(Boolean);
                customerLocation = locationParts.length > 0 ? locationParts.join(', ') : null;

                const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;
                if (
                    defaultPaymentMethod &&
                    typeof defaultPaymentMethod !== 'string' &&
                    defaultPaymentMethod.card?.last4
                ) {
                    livePaymentMethodLast4 = defaultPaymentMethod.card.last4;
                }
            }

            if (!livePaymentMethodLast4) {
                const firstPm = paymentMethods.data[0];
                if (firstPm?.card?.last4) {
                    livePaymentMethodLast4 = firstPm.card.last4;
                }
            }
        } catch {
            invoices = [];
        }
    }

    const paymentMethodLast4 = org.paymentMethodLast4 ?? livePaymentMethodLast4;

    const formatInvoiceStatus = (status: string) => {
        if (status === 'paid') return t('invoice-paid');
        if (status === 'open') return t('invoice-open');
        if (status === 'void') return t('invoice-void');
        return status;
    };

    const invoiceStatusColor = (status: string) => {
        if (status === 'paid') return 'text-green-500';
        if (status === 'open') return 'text-amber-500';
        return 'text-muted-foreground';
    };

    return (
        <div className="w-full mt-24 flex flex-col items-center px-4 pb-16">
            <div className="w-full max-w-3xl">
                <h1 className="font-semibold text-2xl mb-8">{t('organization-settings')}</h1>

                {/* --- My plan section --- */}
                <div className="rounded-xl border p-5 mb-3 space-y-4">
                    <h2 className="font-semibold">{t('my-plan')}</h2>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('current-plan')}</span>
                        <span className="font-medium">{formatPlan(org.plan)}</span>
                    </div>

                    {org.plan !== 'FREE' && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t('plan-price')}</span>
                            <span className="font-medium">${planPrice}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('billing-cycle')}</span>
                        <span className="font-medium">{isYearly ? t('billing-annual') : t('billing-monthly')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('status')}</span>
                        <span className={`font-medium ${formatStatusColor(org.subscriptionStatus)}`}>
                            {formatStatus(org.subscriptionStatus, t)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('payment-method')}</span>
                        <span className="font-medium">{paymentMethodLast4 ? `•••• ${paymentMethodLast4}` : '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('billing-customer-name')}</span>
                        <span className="font-medium">{customerName ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('billing-customer-email')}</span>
                        <span className="font-medium">{customerEmail ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('billing-customer-location')}</span>
                        <span className="font-medium">{customerLocation ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('next-renewal')}</span>
                        <span className="font-medium">
                            {org.nextRenewal ? new Date(org.nextRenewal).toLocaleDateString() : '—'}
                        </span>
                    </div>
                </div>

                {membership.role === 'OWNER' && (
                    <div className="mb-6 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/pricing">{t('change-plan')}</a>
                        </Button>
                    </div>
                )}

                {/* --- Usage section --- */}
                <div className="rounded-xl border p-5 mb-6 space-y-3">
                    <h2 className="font-semibold">{t('usage')}</h2>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('members-limit')}</span>
                        <span>
                            <span className={getCurrentUsageFont(membersCount, limits.members)}>{membersCount}</span>
                            <span className="text-muted-foreground font-medium">/{limits.members}</span>
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('workspaces-limit')}</span>
                        <span>
                            <span className={getCurrentUsageFont(workspacesCount, limits.workspaces)}>{workspacesCount}</span>
                            <span className="text-muted-foreground font-medium">/{limits.workspaces}</span>
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('pipelines-limit')}</span>
                        <span>
                            <span className={limits.pipelines === -1 ? 'font-light' : getCurrentUsageFont(pipelinesCount, limits.pipelines)}>{pipelinesCount}</span>
                            <span className="text-muted-foreground font-medium">/{limits.pipelines === -1 ? '∞' : limits.pipelines}</span>
                        </span>
                    </div>
                </div>

                {/* --- Payment history --- */}
                {org.stripeCustomerId && (
                    <div className="rounded-xl border p-5 mb-6">
                        <h2 className="font-semibold mb-4">{t('payment-history')}</h2>
                        {invoices.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('no-payment-history')}</p>
                        ) : (
                            <div className="divide-y">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between py-2.5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">{inv.amount}</span>
                                            <span className="text-xs text-muted-foreground">{inv.date}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-medium ${invoiceStatusColor(inv.status)}`}>
                                                {formatInvoiceStatus(inv.status)}
                                            </span>
                                            {inv.pdfUrl && (
                                                <a
                                                    href={inv.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary underline underline-offset-2"
                                                >
                                                    {t('invoice-download')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- Danger zone --- */}
                {membership.role === 'OWNER' && org.plan !== 'FREE' && (
                    <div className="rounded-xl border border-red-500/40 p-5 space-y-3">
                        <h2 className="font-semibold text-red-600">{t('danger-zone')}</h2>
                        <p className="text-sm text-muted-foreground">{t('cancel-subscription-description')}</p>
                        <CancelSubscriptionButton />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationPage;
