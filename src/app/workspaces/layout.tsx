interface WorkspacesLayoutProps {
    children: React.ReactNode
}

const WorkspacesLayout = ({ children }: WorkspacesLayoutProps) => {
    return (
        <div className="ml-[0px] flex justify-center mt-[70px] gap-10">
            {children}
        </div>
    );
}

export default WorkspacesLayout;