'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "./types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreVertical, CircleCheckBig } from "lucide-react"
import MemberAvatar from "../members/components/MemberAvatar"
import TaskDate from "./components/TaskDate"
import TaskActions from "./components/TaskActions"
import { StatusCell } from "./components/StatusCell"
import { useTranslations } from "next-intl"
import { TASK_PRIORITY_OPTIONS } from "./constants/priority"
import { TASK_TYPE_OPTIONS } from "./constants/type"
import { cn } from "@/lib/utils"

const SortableHeader = ({ column, translationKey }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' }; translationKey: string }) => {
  const t = useTranslations('workspaces');
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {t(translationKey)}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const AssigneeCell = ({ assignees }: { assignees?: Array<{ $id: string, name: string }> }) => {
  const t = useTranslations('workspaces');

  if (!assignees || assignees.length === 0) {
    return <span className="text-sm text-muted-foreground">{t('no-assignee')}</span>;
  }

  const firstAssignee = assignees[0];

  return (
    <div className="flex items-center gap-x-2 text-sm font-medium">
      <MemberAvatar
        className='size-6'
        fallbackClassName='text-xs'
        name={firstAssignee.name}
        memberId={firstAssignee.$id}
      />
      <p className="line-clamp-1">
        {firstAssignee.name}
        {assignees.length > 1 && <span className="text-muted-foreground ml-1">+{assignees.length - 1}</span>}
      </p>
    </div>
  );
};

const PriorityCell = ({ priority }: { priority?: number }) => {
  const t = useTranslations('workspaces');
  const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (priority || 3));

  if (!priorityOption) return null;

  const Icon = priorityOption.icon;

  return (
    <div className="flex items-center gap-x-2">
      <Icon className="size-4" style={{ color: priorityOption.color }} />
      <span className="text-sm">{t(priorityOption.translationKey)}</span>
    </div>
  );
};

const TypeCell = ({ type }: { type?: string }) => {
  const t = useTranslations('workspaces');
  const typeOption = TASK_TYPE_OPTIONS.find(tp => tp.value === (type || 'task'));

  if (!typeOption) return null;

  const Icon = typeOption.icon;

  return (
    <div className="flex items-center gap-x-2">
      <Icon className={cn("size-4", typeOption.textColor)} />
      <span className="text-sm">{t(typeOption.translationKey)}</span>
    </div>
  );
};

const CompletionCell = ({ completedAt }: { completedAt?: string | null }) => {
  const t = useTranslations('workspaces');
  const isCompleted = !!completedAt;

  return (
    <div className="flex items-center gap-x-2">
      <CircleCheckBig className={cn(
        "size-4",
        isCompleted
          ? "text-green-600 dark:text-green-400 fill-green-100 dark:fill-green-950/30"
          : "text-muted-foreground"
      )} />
      <span className="text-sm">{isCompleted ? t('completed') : t('not-completed')}</span>
    </div>
  );
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} translationKey="task-name" />,
    cell: ({ row }) => {
      const name = row.original.name;

      return <p className="line-clamp-1">{name}</p>
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column} translationKey="status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusCustomId = row.original.statusCustomId;

      return <StatusCell status={status} statusCustomId={statusCustomId} />
    }
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <SortableHeader column={column} translationKey="priority" />,
    cell: ({ row }) => {
      const priority = row.original.priority;
      return <PriorityCell priority={priority} />;
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column} translationKey="type" />,
    cell: ({ row }) => {
      const type = row.original.type;
      return <TypeCell type={type} />;
    }
  },
  {
    accessorKey: 'assignees',
    header: ({ column }) => <SortableHeader column={column} translationKey="assignee" />,
    cell: ({ row }) => {
      const assignees = row.original.assignees;
      return <AssigneeCell assignees={assignees} />;
    }
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <SortableHeader column={column} translationKey="due-date" />,
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;

      return dueDate ? <TaskDate value={dueDate} /> : null;
    }
  },
  {
    accessorKey: 'completedAt',
    header: ({ column }) => <SortableHeader column={column} translationKey="completion" />,
    cell: ({ row }) => {
      const completedAt = row.original.completedAt;
      return <CompletionCell completedAt={completedAt} />;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { $id, name, type, featured } = row.original;

      return (
        <TaskActions taskId={$id} taskName={name} taskType={type} isFeatured={featured}>
          <Button variant='ghost' className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      )
    }
  }
]