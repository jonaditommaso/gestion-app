import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetArchivedTasks } from "../api/use-get-archived-tasks";
import { useUnarchiveTasks } from "../api/use-unarchive-tasks";
import { useState } from "react";
import { Loader2, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { useLocale } from "next-intl";

interface ArchivedTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DATE_LOCALES = { es, en: enUS, it };

export const ArchivedTasksModal = ({ isOpen, onClose }: ArchivedTasksModalProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';
    const workspaceId = useWorkspaceId();
    const { data: archivedTasksData, isLoading } = useGetArchivedTasks({ workspaceId, enabled: isOpen });
    const { mutate: unarchiveTasks, isPending } = useUnarchiveTasks();
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

    const archivedTasks = archivedTasksData?.documents || [];

    const handleSelectAll = () => {
        if (selectedTaskIds.length === archivedTasks.length) {
            setSelectedTaskIds([]);
        } else {
            setSelectedTaskIds(archivedTasks.map(task => task.$id));
        }
    };

    const handleToggleTask = (taskId: string) => {
        setSelectedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleUnarchive = () => {
        if (selectedTaskIds.length === 0) return;

        unarchiveTasks(selectedTaskIds, {
            onSuccess: () => {
                setSelectedTaskIds([]);
                if (archivedTasks.length === selectedTaskIds.length) {
                    onClose();
                }
            }
        });
    };

    const handleClose = () => {
        setSelectedTaskIds([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('archived-tasks')}</DialogTitle>
                    <DialogDescription>
                        {t('archived-tasks-description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : archivedTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ArchiveRestore className="size-12 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">{t('no-archived-tasks')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <Checkbox
                                    checked={selectedTaskIds.length === archivedTasks.length && archivedTasks.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span className="text-sm font-medium">
                                    {t('select-all')} ({archivedTasks.length})
                                </span>
                            </div>

                            {archivedTasks.map((task) => {
                                const isSelected = selectedTaskIds.includes(task.$id);

                                return (
                                    <div
                                        key={task.$id}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition",
                                            isSelected && "bg-muted border-primary"
                                        )}
                                        onClick={() => handleToggleTask(task.$id)}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleToggleTask(task.$id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{task.name}</p>
                                            {task.archivedAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    {t('archived-on')} {format(new Date(task.archivedAt), 'PPP', { locale: DATE_LOCALES[locale] })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        {selectedTaskIds.length > 0 && t('selected-count', { count: selectedTaskIds.length })}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={isPending}>
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={handleUnarchive}
                            disabled={selectedTaskIds.length === 0 || isPending}
                        >
                            {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                            {t('unarchive-selected')} <ArchiveRestore className="size-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
