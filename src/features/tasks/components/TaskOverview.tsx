import { Button } from '@/components/ui/button';
import { Task } from '../types';
import { PencilIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import OverviewProperty from './OverviewProperty';
import MemberAvatar from '@/features/members/components/MemberAvatar';
import TaskDate from './TaskDate';
import { Badge } from '@/components/ui/badge';
import { snakeCaseToTitleCase } from '@/lib/utils';

interface TaskOverviewProps {
    task: Task
}

const TaskOverview = ({ task }: TaskOverviewProps) => {
    return (
        <div className='flex flex-col gap-y-4 col-span-1'>
            <div className='bg-muted rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                    <p className='text-lg font-semibold'>Overview</p>
                    <Button size='sm'>
                        <PencilIcon className='size-4 mr-2' />
                        Edit
                    </Button>
                </div>
                <Separator className='my-4' />
                <div className='flex flex-col gap-y-4'>
                    <OverviewProperty label='Assignee'>
                        <MemberAvatar
                            name={task.assignee.name}
                            className='size-6'
                        />
                        <p className='text-sm font-medium'>{task.assignee.name}</p>
                    </OverviewProperty>
                    <OverviewProperty label='Due Date'>
                        <TaskDate
                            value={task.dueDate}
                            className='text-sm font-medium'
                        />
                    </OverviewProperty>
                    <OverviewProperty label='Status'>
                        <Badge variant={task.status}>
                            {snakeCaseToTitleCase(task.status)}
                        </Badge>
                    </OverviewProperty>
                </div>
            </div>
        </div>
    );
}

export default TaskOverview;