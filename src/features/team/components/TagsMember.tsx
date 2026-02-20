import { Badge } from "@/components/ui/badge";

const TAG_COLOR_CLASSES: string[] = [
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
];

function resolveTagColor(tag: string): string {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = (hash * 31 + tag.charCodeAt(i)) & 0xffffffff;
    }
    return TAG_COLOR_CLASSES[Math.abs(hash) % TAG_COLOR_CLASSES.length];
}

const TagsMember = ({ tags }: { tags: string[] }) => {
    const filteredTags = tags.filter(tag => tag.trim() !== '');

    if (filteredTags.length === 0) return null;

    return (
        <div className="flex w-full justify-center items-center flex-wrap gap-2">
            {filteredTags.map((tag, index) => (
                <Badge key={index} className={`cursor-default ${resolveTagColor(tag)}`}>
                    {tag}
                </Badge>
            ))}
        </div>
    );
}

export default TagsMember;