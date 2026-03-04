"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMembers } from "@/features/team/api/use-get-members";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Seller } from "../types";

interface AddSellerParams {
  memberId: string;
  name: string;
  email: string;
  userId: string;
}

interface ManageSellersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellers: Seller[];
  onAddSeller: (params: AddSellerParams) => void;
  onRemoveSeller: (id: string) => void;
}

const ManageSellersDialog = ({
  open,
  onOpenChange,
  sellers,
  onAddSeller,
  onRemoveSeller,
}: ManageSellersDialogProps) => {
  const t = useTranslations("sales");
  const { data: membersData, isLoading: isLoadingMembers } = useGetMembers();
  const members = membersData?.members ?? [];

  const availableMembers = members.filter(
    (m) => !sellers.some((s) => s.memberId === m.$id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("sellers.title")}</DialogTitle>
          <DialogDescription>{t("sellers.description")}</DialogDescription>
        </DialogHeader>

        {/* Current sellers */}
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {sellers.length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">{t("sellers.no-sellers")}</p>
          )}
          {sellers.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 shrink-0">
                  {seller.avatarId && <AvatarImage src={`/api/settings/get-image/${seller.avatarId}`} alt={seller.name} className="object-cover" />}
                  <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                    {(seller.name ?? "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{seller.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => onRemoveSeller(seller.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Available org members to add */}
        {availableMembers.length > 0 && (
          <div className="pt-2 border-t">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("sellers.add-from-team")}</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {isLoadingMembers ? (
                <p className="py-2 text-center text-sm text-muted-foreground">{t("sellers.loading-members")}</p>
              ) : (
                availableMembers.map((member) => (
                  <div key={member.$id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={`/api/settings/get-image/${member.userId}`} alt={member.name} className="object-cover" />
                        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                          {(member.name ?? member.userName ?? "?")[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{member.name ?? member.userName}</span>
                        <span className="text-xs text-muted-foreground">{member.userEmail}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() =>
                        onAddSeller({
                          memberId: member.$id,
                          name: member.name ?? member.userName,
                          email: member.userEmail,
                          userId: member.userId,
                        })
                      }
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageSellersDialog;
