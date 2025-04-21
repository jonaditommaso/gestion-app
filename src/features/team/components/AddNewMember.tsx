'use client'
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const AddNewMember = () => {
    const t = useTranslations('team');

    return (
        <Button>+ {t('add-new-member')}</Button>
    );
}

export default AddNewMember;