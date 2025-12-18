import { Workflow, Users, Palette, LucideIcon } from "lucide-react";

export interface FeatureIncluded {
    key: string;
    translationKey: string;
    icon: LucideIcon;
}

export const FEATURES_INCLUDED: FeatureIncluded[] = [
    {
        key: 'three-views',
        translationKey: 'three-views',
        icon: Workflow,
    },
    {
        key: 'workflow-configured',
        translationKey: 'workflow-configured',
        icon: Users,
    },
    {
        key: 'fully-customizable',
        translationKey: 'fully-customizable',
        icon: Palette,
    },
];
