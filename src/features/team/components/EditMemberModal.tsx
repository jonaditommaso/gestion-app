'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { KeyboardEvent, useState } from "react";
import { format } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { useUpdateProfile } from "../api/use-update-profile";

const localeMap = { es, en: enUS, it };

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

function parseMemberSince(value: string): { month: string; year: string } {
    if (!value) return { month: '', year: '' };
    const [y, m] = value.split('-');
    return { month: m ?? '', year: y ?? '' };
}

interface EditMemberModalProps {
    open: boolean;
    onClose: () => void;
    initialPosition: string;
    initialDescription: string;
    initialLinkedin: string;
    initialBirthday: string;
    initialTags: string[];
    initialMemberSince: string;
    initialCurrentProject: string;
}

const EditMemberModal = ({
    open,
    onClose,
    initialPosition,
    initialDescription,
    initialLinkedin,
    initialBirthday,
    initialTags,
    initialMemberSince,
    initialCurrentProject,
}: EditMemberModalProps) => {
    const t = useTranslations('team');
    const locale = useLocale() as keyof typeof localeMap;
    const dateLocale = localeMap[locale] ?? enUS;
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const [position, setPosition] = useState(initialPosition ?? '');
    const [description, setDescription] = useState(initialDescription ?? '');
    const [linkedin, setLinkedin] = useState(initialLinkedin ?? '');
    const [birthday, setBirthday] = useState(initialBirthday ?? '');
    const [tags, setTags] = useState<string[]>(initialTags.filter(tag => tag.trim() !== ''));
    const [tagInput, setTagInput] = useState('');
    const [currentProject, setCurrentProject] = useState(initialCurrentProject ?? '');

    const parsedSince = parseMemberSince(initialMemberSince);
    const [sinceMonth, setSinceMonth] = useState(parsedSince.month);
    const [sinceYear, setSinceYear] = useState(parsedSince.year);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const minYear = currentYear - 70;

    const yearOptions: number[] = [];
    for (let y = currentYear; y >= minYear; y--) {
        yearOptions.push(y);
    }

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, '0'),
        label: format(new Date(2000, i, 1), 'MMMM', { locale: dateLocale }),
    }));

    const isMonthDisabled = (monthValue: string): boolean => {
        if (!sinceYear) return false;
        return (
            Number(sinceYear) === currentYear &&
            Number(monthValue) > currentMonth
        );
    };

    const handleSinceYearChange = (year: string) => {
        setSinceYear(year);
        if (Number(year) === currentYear && Number(sinceMonth) > currentMonth) {
            setSinceMonth('');
        }
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (!trimmed || tags.includes(trimmed) || tags.length >= 3) return;
        setTags(prev => [...prev, trimmed]);
        setTagInput('');
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (index: number) => {
        setTags(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const memberSince = sinceYear && sinceMonth ? `${sinceYear}-${sinceMonth}` : undefined;

        updateProfile({
            json: {
                position: position || undefined,
                description: description || undefined,
                linkedin: linkedin || undefined,
                birthday: birthday || undefined,
                tags,
                memberSince,
                currentProject: currentProject || undefined,
            }
        }, {
            onSuccess: () => onClose(),
        });
    };

    const selectClass =
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('edit-profile')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="ep-position">{t('position')}</Label>
                        <Input
                            id="ep-position"
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            placeholder={t('placeholder-position')}
                            maxLength={25}
                        />
                        <span className="text-xs text-muted-foreground text-right">{position.length}/25</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="ep-description">{t('description')}</Label>
                        <Textarea
                            id="ep-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t('placeholder-description')}
                            maxLength={100}
                            className="resize-none"
                            rows={3}
                        />
                        <span className="text-xs text-muted-foreground text-right">{description.length}/100</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="ep-linkedin">{t('linkedin-url')}</Label>
                        <Input
                            id="ep-linkedin"
                            value={linkedin}
                            onChange={e => setLinkedin(e.target.value)}
                            placeholder={t('placeholder-linkedin')}
                        />
                    </div>

                    <div className="grid grid-cols-10 gap-2">
                        <div className="flex flex-col gap-1.5 col-span-4">
                            <Label htmlFor="ep-birthday">{t('birthday')}</Label>
                            <Input
                                id="ep-birthday"
                                type="date"
                                value={birthday}
                                onChange={e => setBirthday(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-6">
                            <Label>{t('member-since')}</Label>
                            <div className="flex gap-1">
                                <select
                                    value={sinceMonth}
                                    onChange={e => setSinceMonth(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">{t('month')}</option>
                                    {monthOptions.map(opt => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                            disabled={isMonthDisabled(opt.value)}
                                            className="first-letter:uppercase"
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={sinceYear}
                                    onChange={e => handleSinceYearChange(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">{t('year')}</option>
                                    {yearOptions.map(y => (
                                        <option key={y} value={String(y)}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="ep-current-project">{t('current-project')}</Label>
                        <Input
                            id="ep-current-project"
                            value={currentProject}
                            onChange={e => setCurrentProject(e.target.value)}
                            placeholder={t('placeholder-current-project')}
                            maxLength={60}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>{t('interests')}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={t('placeholder-interest')}
                                disabled={tags.length >= 3}
                                maxLength={11}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddTag}
                                disabled={tags.length >= 3 || !tagInput.trim()}
                            >
                                {t('add-interest')}
                            </Button>
                        </div>
                        {tags.length >= 3 && (
                            <p className="text-xs text-muted-foreground">{t('max-interests-reached')}</p>
                        )}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {tags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        className={`gap-1 cursor-default ${resolveTagColor(tag)}`}
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(index)}
                                            className="hover:opacity-70 transition-opacity"
                                            aria-label="remove"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2 pb-1">
                        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                            {t('cancel')}
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={isPending}>
                            {t('save')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditMemberModal;
