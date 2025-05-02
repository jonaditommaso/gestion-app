import { cn } from "@/lib/utils";

interface NoteProps {
    title?: string,
    content: string,
    bgColor: string
}

const Note = ({ title, content, bgColor }: NoteProps) => {
    return (
        <div className={cn("border rounded-md p-4", bgColor === 'none' ? ' bg-sidebar' : bgColor)}>
            {title && <p className="font-medium mb-2">{title}</p>}
            <p className={cn("text-balance text-sm", bgColor === 'none' ? 'text-muted-foreground' : 'text-card-foreground')}>{content}</p>
        </div>
    );
}

export default Note;