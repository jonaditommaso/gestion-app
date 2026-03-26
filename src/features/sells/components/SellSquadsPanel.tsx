'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, AlertCircle, Layers, Plus, UserCheck, Users } from "lucide-react";
import { useGetSellSquads } from "../api/use-get-sell-squads";
import { useGetDealSellers } from "../api/use-get-deal-sellers";
import SellSquadCard from "./squads/SellSquadCard";
import SellSquadFormDialog from "./squads/SellSquadFormDialog";
import CreateSellSquadFlow from "./squads/CreateSellSquadFlow";
import { SellSquad, Seller } from "../types";
import CustomLoader from "@/components/CustomLoader";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import UpgradeDialog from "@/components/UpgradeDialog";

type ServerSellerDocument = {
    $id: string;
    memberId: string;
    name: string;
    avatarId: string | null;
};

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

const SellSquadsPanel = () => {
    const t = useTranslations("sales");
    const [isCreating, setIsCreating] = useState(false);
    const [editingSquad, setEditingSquad] = useState<SellSquad | null>(null);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

    const { data: squadsData, isLoading: isLoadingSquads } = useGetSellSquads();
    const { data: sellersData, isLoading: isLoadingSellers } = useGetDealSellers();

    const squads = (squadsData?.documents ?? []) as SellSquad[];
    const sellers: Seller[] = ((sellersData as { documents: ServerSellerDocument[] } | undefined)?.documents ?? []).map(doc => ({
        id: doc.$id,
        memberId: doc.memberId,
        name: doc.name,
        initials: getInitials(doc.name),
        avatarId: doc.avatarId,
    }));

    const hasEnoughSellers = sellers.length >= 2;

    const { limits } = usePlanAccess();
    const squadLimit = limits.squads;
    const canCreateSquad = squadLimit === -1 || squads.length < squadLimit;
    const isSquadsBlocked = squadLimit === 0;

    const isLoading = isLoadingSquads || isLoadingSellers;

    return (
        <div className="flex flex-col p-6">
            {!isCreating && (
                <div className="flex items-center justify-between mb-6 pr-8">
                    <div className="flex items-center gap-2">
                        <Users className="size-5" />
                        <h1 className="text-xl font-semibold">{t("squads.title")}</h1>
                        {squads.length > 0 && (
                            <span className="text-sm text-muted-foreground">({squads.length})</span>
                        )}
                    </div>
                    {squads.length > 0 && hasEnoughSellers && canCreateSquad && (
                        <Button size="sm" onClick={() => setIsCreating(true)}>
                            <Plus className="size-4 mr-1.5" />
                            {t("squads.new-squad")}
                        </Button>
                    )}
                    {squads.length > 0 && !canCreateSquad && !isSquadsBlocked && (
                        <Button size="sm" variant="outline" onClick={() => setShowUpgradeDialog(true)}>
                            <Plus className="size-4 mr-1.5" />
                            {t("squads.new-squad")}
                        </Button>
                    )}
                </div>
            )}

            {isCreating ? (
                <CreateSellSquadFlow
                    sellers={sellers}
                    onDone={() => setIsCreating(false)}
                    onCancel={() => setIsCreating(false)}
                />
            ) : isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                    <CustomLoader />
                </div>
            ) : squads.length === 0 ? (
                <div className="w-full space-y-4">
                    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/8 via-primary/4 to-background p-7">
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="space-y-1.5">
                                <p className="text-sm text-muted-foreground leading-relaxed">{t("squads.description")}</p>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/5 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-6 right-20 size-32 rounded-full bg-primary/4 blur-2xl" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-blue-500/5 dark:bg-blue-500/8 p-4 space-y-3">
                            <div className="rounded-md bg-blue-500/15 w-fit p-2">
                                <UserCheck className="size-4 text-blue-500" />
                            </div>
                            <p className="text-sm font-medium leading-snug">{t("squads.feature-assign")}</p>
                        </div>
                        <div className="rounded-lg border bg-amber-500/5 dark:bg-amber-500/8 p-4 space-y-3">
                            <div className="rounded-md bg-amber-500/15 w-fit p-2">
                                <Layers className="size-4 text-amber-500" />
                            </div>
                            <p className="text-sm font-medium leading-snug">{t("squads.feature-organize")}</p>
                        </div>
                        <div className="rounded-lg border bg-emerald-500/5 dark:bg-emerald-500/8 p-4 space-y-3">
                            <div className="rounded-md bg-emerald-500/15 w-fit p-2">
                                <Activity className="size-4 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium leading-snug">{t("squads.feature-filter")}</p>
                        </div>
                    </div>

                    {!hasEnoughSellers && (
                        <Alert variant="default">
                            <AlertCircle className="size-4" />
                            <AlertTitle>{t("squads.squad-min-sellers-alert-title")}</AlertTitle>
                            <AlertDescription>{t("squads.squad-min-sellers-alert-desc")}</AlertDescription>
                        </Alert>
                    )}

                    {isSquadsBlocked ? (
                        <div className="flex justify-center pt-4">
                            <Button onClick={() => setShowUpgradeDialog(true)}>
                                <Plus className="size-4 mr-1.5" />
                                {t("squads.create-first")}
                            </Button>
                        </div>
                    ) : hasEnoughSellers && canCreateSquad ? (
                        <div className="flex justify-center pt-4">
                            <Button onClick={() => setIsCreating(true)}>
                                <Plus className="size-4 mr-1.5" />
                                {t("squads.create-first")}
                            </Button>
                        </div>
                    ) : hasEnoughSellers && !canCreateSquad ? (
                        <div className="flex justify-center pt-4">
                            <Button variant="outline" onClick={() => setShowUpgradeDialog(true)}>
                                <Plus className="size-4 mr-1.5" />
                                {t("squads.create-first")}
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                    {squads.map(squad => (
                        <SellSquadCard
                            key={squad.$id}
                            squad={squad}
                            availableSellers={sellers}
                            onEdit={setEditingSquad}
                        />
                    ))}
                    {!canCreateSquad && !isSquadsBlocked && (
                        <button
                            onClick={() => setShowUpgradeDialog(true)}
                            className="rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors min-h-[120px]"
                        >
                            <Plus className="size-4" />
                            {t("squads.squad-upgrade-to-add")}
                        </button>
                    )}
                </div>
            )}

            {editingSquad && (
                <SellSquadFormDialog
                    open={!!editingSquad}
                    onOpenChange={open => { if (!open) setEditingSquad(null); }}
                    squad={editingSquad}
                />
            )}

            <UpgradeDialog
                open={showUpgradeDialog}
                onOpenChange={setShowUpgradeDialog}
                feature="squads"
                currentCount={squads.length}
                limitCount={squadLimit > 0 ? squadLimit : undefined}
            />
        </div>
    );
};

export default SellSquadsPanel;
