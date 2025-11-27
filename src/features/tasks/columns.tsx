'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "./types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import MemberAvatar from "../members/components/MemberAvatar"
import TaskDate from "./components/TaskDate"
import TaskActions from "./components/TaskActions"
import { StatusCell } from "./components/StatusCell"
import { useTranslations } from "next-intl"

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
      />
      <p className="line-clamp-1">
        {firstAssignee.name}
        {assignees.length > 1 && <span className="text-muted-foreground ml-1">+{assignees.length - 1}</span>}
      </p>
    </div>
  );
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.original.name;

      return <p className="line-clamp-1">{name}</p>
    }
  },
  {
    accessorKey: 'assignees',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assignee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const assignees = row.original.assignees;
      return <AssigneeCell assignees={assignees} />;
    }
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;

      return dueDate ? <TaskDate value={dueDate} /> : null;
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status;

      return <StatusCell status={status} />
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const id = row.original.$id;
      const isFeatured = row.original.featured;

      return (
        <TaskActions id={id} isFeatured={isFeatured}>
          <Button variant='ghost' className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      )
    }
  }
]