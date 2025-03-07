//import { LandingNavbar } from "@/features/landing/components/LandingNavbar";

interface LandingLayoutProps {
    children: React.ReactNode
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
    return (
        <div>
            {children}
        </div>
    );
}

export default LandingLayout;