import { useMemo } from "react";
import { useWorkspaceId } from "./use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { CustomStatus, WorkspaceMetadata } from "../types/custom-status";
import { TaskStatus } from "@/features/tasks/types";
import {
    CircleCheckIcon,
    CircleDashedIcon,
    CircleDotDashed,
    CircleDotIcon,
    CircleIcon,
    CircleAlert,
    CircleHelp,
    CircleX,
    CircleDollarSign,
    Star,
    CircleFadingArrowUp,
    Crown
} from "lucide-react";

const DEFAULT_STATUSES: CustomStatus[] = [
    {
        id: TaskStatus.BACKLOG,
        label: 'Backlog',
        color: '#ec4899',
        icon: 'circle-dashed',
        position: 0,
        isDefault: true,
    },
    {
        id: TaskStatus.TODO,
        label: 'To Do',
        color: '#ef4444',
        icon: 'circle',
        position: 1,
        isDefault: true,
    },
    {
        id: TaskStatus.IN_PROGRESS,
        label: 'In Progress',
        color: '#eab308',
        icon: 'circle-dot-dashed',
        position: 2,
        isDefault: true,
    },
    {
        id: TaskStatus.IN_REVIEW,
        label: 'In Review',
        color: '#3b82f6',
        icon: 'circle-dot',
        position: 3,
        isDefault: true,
    },
    {
        id: TaskStatus.DONE,
        label: 'Done',
        color: '#10b981',
        icon: 'circle-check',
        position: 4,
        isDefault: true,
    },
];

export const iconMap = {
    'circle': CircleIcon,
    'circle-dashed': CircleDashedIcon,
    'circle-dot': CircleDotIcon,
    'circle-dot-dashed': CircleDotDashed,
    'circle-check': CircleCheckIcon,
    'circle-fading-arrow-up': CircleFadingArrowUp,
    'circle-alert': CircleAlert,
    'circle-help': CircleHelp,
    'circle-x': CircleX,
    'circle-dollar-sign': CircleDollarSign,
    'star': Star,
    'crown': Crown,
} as const;

export const useCustomStatuses = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();

    const allStatuses = useMemo(() => {
        const workspace = workspaces?.documents.find(ws => ws.$id === workspaceId);

        if (!workspace?.metadata) {
            return DEFAULT_STATUSES;
        }

        const metadata: WorkspaceMetadata = typeof workspace.metadata === 'string'
            ? JSON.parse(workspace.metadata)
            : workspace.metadata;

        const customStatuses = metadata.customStatuses || [];

        // Combinar defaults y customs, luego ordenar por posición
        // Los defaults y customs comparten el mismo espacio de posiciones
        const combined = [...DEFAULT_STATUSES, ...customStatuses];

        // Ordenar simplemente por position
        return combined.sort((a, b) => a.position - b.position);
    }, [workspaces, workspaceId]);

    const getStatusById = (id: string) => {
        return allStatuses.find(status => status.id === id);
    };

    const isCustomStatus = (id: string) => {
        const status = getStatusById(id);
        return status ? !status.isDefault : false;
    };

    const getIconComponent = (iconName: string) => {
        return iconMap[iconName as keyof typeof iconMap] || CircleIcon;
    };

    return {
        allStatuses,
        defaultStatuses: DEFAULT_STATUSES,
        customStatuses: allStatuses.filter(s => !s.isDefault),
        getStatusById,
        isCustomStatus,
        getIconComponent,
    };
};
