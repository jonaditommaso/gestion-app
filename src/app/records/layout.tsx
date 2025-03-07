interface RecordsLayoutProps {
    children: React.ReactNode
}

const RecordsLayout = ({children}: RecordsLayoutProps) => {
    return (
        <div className="flex flex-col items-center w-full mt-[70px]">
            {children}
        </div>
    );
}

export default RecordsLayout;