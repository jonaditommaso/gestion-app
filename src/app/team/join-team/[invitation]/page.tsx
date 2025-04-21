import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const JoinTeamView = () => {
    return (
        <Card className="flex flex-col items-center justify-center w-[400px] p-4 gap-4 m-auto">
            <CardTitle>Unete a [empresa]</CardTitle>
            <CardDescription>Has recibido una invitacion para unirte a [empresa]. Se registrara tu cuenta con el email que fue provisto en la invitacion. Ingresa un nombre y una contrasena para completar el registro</CardDescription>
            <Input type="email" disabled value='jona@es.es' />
            <Input type="text" placeholder="Nombre" />
            <Input type='password' placeholder="Ingresa nueva contrasena" />
            <Separator />
            <Button className="w-full">Crear cuenta</Button>
        </Card>
    );
}

export default JoinTeamView;