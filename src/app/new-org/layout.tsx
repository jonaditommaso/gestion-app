import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

interface NewOrgLayoutProps {
    children: React.ReactNode;
}

const NewOrgLayout = async ({ children }: NewOrgLayoutProps) => {
    const user = await getCurrent();

    if (!user) redirect('/login');

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
            {children}
        </main>
    );
};

export default NewOrgLayout;
