import { Suspense } from "react";
import OnboardingView from "@/features/auth/components/OnboardingView";

const OnboardingPage = () => {
    return (
        <Suspense>
            <OnboardingView />
        </Suspense>
    );
};

export default OnboardingPage;
