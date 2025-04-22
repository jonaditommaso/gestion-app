interface NoteProps {
    title?: string,
    content: string
}

const Note = ({ title = 'Cosas que tengo que hacer manana', content }: NoteProps) => {
    return (
        <div className="border rounded-md p-4 bg-sidebar">
            {title && <p className="font-medium mb-2">{title}</p>}
            <p className="text-balance text-sm text-muted-foreground">{content}</p>
        </div>
    );
}

export default Note;