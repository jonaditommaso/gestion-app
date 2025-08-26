interface RolesLayoutProps {
    children: React.ReactNode
}

const RolesLayout = ({children}: RolesLayoutProps) => {
    return (
        <div className="mt-20 mr-10 ml-20">
            {children}
        </div>
    );
}

export default RolesLayout;