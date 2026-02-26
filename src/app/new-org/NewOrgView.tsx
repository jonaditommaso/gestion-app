'use client'
import { useRouter } from "next/navigation";
import OnboardingView from "@/features/auth/components/OnboardingView";

const NewOrgView = () => {
    const router = useRouter();
    return <OnboardingView isNewOrgFlow onSkip={() => router.push('/')} />;
};

export default NewOrgView;
