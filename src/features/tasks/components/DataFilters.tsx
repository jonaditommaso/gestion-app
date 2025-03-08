'use client'
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecksIcon, UserIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";
import CustomDatePicker from "@/components/CustomDatePicker";
import MemberAvatar from "@/features/members/components/MemberAvatar";

const DataFilters = () => {
    const workspaceId = useWorkspaceId()
    const { data: members, isLoading } = useGetMembers({ workspaceId })

    const memberOptions = members?.documents.map(member => ({
        id: member.$id,
        name: member.name
    }));

    const [{
        status,
        assigneeId,
        dueDate
    }, setFilters] = useTaskFilters();

    const onStatusChange = (value: string) => {
        if (value === 'all') {
            setFilters({ status: null })
        } else {
            setFilters({ status: value as TaskStatus })
        }
    }

    const onAssigneeChange = (value: string) => {
        setFilters({ assigneeId: value === 'all' ? null : value as string })
    }

    if (isLoading) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-2">
             <Select
                defaultValue={status ?? undefined}
                onValueChange={(value) => onStatusChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListChecksIcon className="size-4 mr-2" />
                        <SelectValue placeholder='All statuses' />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>
                        Backlog
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>
                        In Review
                    </SelectItem>
                    <SelectItem value={TaskStatus.TODO}>
                        Todo
                    </SelectItem>
                    <SelectItem value={TaskStatus.DONE}>
                        Done
                    </SelectItem>
                </SelectContent>
            </Select>
            <Select
                defaultValue={assigneeId ?? undefined}
                onValueChange={(value) => onAssigneeChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue placeholder='All assignees' />
                    </div>
                </SelectTrigger>
                <SelectContent >
                    <SelectItem value="all">All assignees</SelectItem>
                    <SelectSeparator />
                    {memberOptions?.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                                <MemberAvatar
                                    className='size-6'
                                    name={member.name}
                                />
                                {member.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <CustomDatePicker
                placeholder="Due date"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={date => { setFilters({ dueDate: date ? date.toISOString() : null }) }}
            />
        </div>
    );
}

export default DataFilters;