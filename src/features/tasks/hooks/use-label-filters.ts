import { useTranslations } from "next-intl";
import { TASK_STATUS_OPTIONS } from "../constants/status";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { TaskStatus } from "../types";
import { CustomLabel, CustomStatus } from "@/app/workspaces/types/custom-status";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";

type LabelFilters = {
    status: TaskStatus | null;
    assigneeId: string | null;
    squadId: string | null;
    dueDate: string | null;
    priority: number | null;
    label: string[] | null;
    type: string | null;
    completed: string | null;
    allStatuses: CustomStatus[];
    customLabels: CustomLabel[];
    taskTypeOptions: readonly { value: string; translationKey: string }[];
    memberOptions: {
        id: string;
        name: string;
    }[];
    squadsData: {
        documents?: {
            $id: string;
            name: string;
        }[];
    } | undefined;

};

export const useLabelFilters = ({ status, assigneeId, squadId, priority, label, type, completed, allStatuses, memberOptions, squadsData, customLabels, taskTypeOptions }: LabelFilters) => {
    const t = useTranslations('workspaces');
    const config = useWorkspaceConfig();

    const selectedStatusLabel = (() => {
        if (!status) return t('all-statuses');
        const statusItem = allStatuses.find((item) => item.id === status);
        if (!statusItem) return t('all-statuses');

        const labelKey = statusItem.isDefault ? STATUS_TO_LABEL_KEY[statusItem.id] : null;
        const customLabel = labelKey ? config[labelKey] : null;

        return statusItem.isDefault
            ? (customLabel || t(TASK_STATUS_OPTIONS.find((s) => s.value === statusItem.id)?.translationKey || statusItem.id.toLowerCase()))
            : statusItem.label;
    })();

    const selectedAssigneeLabel = assigneeId
        ? (memberOptions?.find((member) => member.id === assigneeId)?.name || t('all-assignees'))
        : t('all-assignees');

    const selectedSquadLabel = squadId
        ? (squadsData?.documents?.find((squad) => squad.$id === squadId)?.name || t('all-squads'))
        : t('all-squads');

    const selectedPriorityLabel = priority !== null && priority !== undefined
        ? (t(TASK_PRIORITY_OPTIONS.find((option) => option.value === priority)?.translationKey || 'all-priorities'))
        : t('all-priorities');

    const selectedLabelName = label?.[0]
        ? (customLabels.find((labelItem) => labelItem.id === label[0])?.name || t('all-labels'))
        : t('all-labels');

    const selectedTypeLabel = type
        ? (t(taskTypeOptions.find((option) => option.value === type)?.translationKey || 'all-types'))
        : t('all-types');

    const selectedCompletedLabel = completed === 'completed'
        ? t('completed')
        : completed === 'incomplete'
            ? t('incomplete')
            : t('all-completed');
    return {
        selectedStatusLabel,
        selectedAssigneeLabel,
        selectedSquadLabel,
        selectedPriorityLabel,
        selectedLabelName,
        selectedTypeLabel,
        selectedCompletedLabel,
    };
};