import { LucideIcon } from "lucide-react";

export type ViewType = 'details' | 'calendar' | 'followup' | 'categories' | 'incomes' | 'expenses' | 'drafts' | 'archived';

export interface ViewConfig {
    icon: LucideIcon;
    titleKey: string;
    descriptionKey: string;
    colorClass: string;
}