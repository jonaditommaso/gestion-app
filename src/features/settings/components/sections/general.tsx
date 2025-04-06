import { Input } from "@/components/ui/input";

const General = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <h2>Nombre</h2>
                <Input type="text" className="w-[200px]" />
            </div>
            <div className="flex items-center justify-between w-full">
                <h2>Email</h2>
                <Input type="email" className="w-[200px]" disabled />
            </div>
        </div>
    );
}

export default General;