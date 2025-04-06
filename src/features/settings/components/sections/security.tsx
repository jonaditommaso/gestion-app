import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Security = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <h2>Password</h2>
                <Input type="password" className="w-[200px]" />
            </div>
            <div className="flex items-center justify-between w-full">
                <h2>Autenticacion en 2 pasos</h2>
                <Button variant='outline'>Agregar</Button>
            </div>
        </div>
    );
}

export default Security;