import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CopyIcon } from "lucide-react";

const WorkspaceSettings = () => { //todo, without translation
    return (
        <div className="flex justify-evenly gap-3 mt-10">
            <Card className="w-[400px]">
                <CardHeader className="flex items-center justify-center text-center p-4">
                    <CardTitle>General</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-6">
                        <label>Nombre</label>
                        <Input className="max-w-52"/>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <label>Codigo de invitacion</label>
                            <span>.....................</span>
                        </div>
                        <Button variant='outline'>
                            <CopyIcon />
                        </Button>
                    </div>
                    {/* <div>Agregar miembros</div> */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <label>Privacidad</label>
                            <span className="text-zinc-400 text-sm">Privado</span>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <label>Creacion de tareas</label>
                            <span className="text-zinc-400 text-sm">Solo usuarios Admin</span>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
            <Card className="w-[400px]">
                <CardHeader className="flex items-center justify-center text-center p-4">
                    <CardTitle>Caracteristicas</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-7">
                    <div className="flex justify-between mb-6">
                        <div className="flex flex-col">
                            <label>Color de fondo</label>
                            <span className="text-zinc-400 text-sm text-balance">Puedes cambiar el color de fondo de
                            tu workspace por el que más te guste</span>
                        </div>
                        <Input type="color" className="max-w-14" />
                    </div>
                    {/* <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <label>Copiar estructura</label>
                            <span className="text-zinc-400 text-sm text-balance">Puedes crear un nuevo workspace
                            copiando la misma estructura que este</span>
                        </div>
                        <Button variant='outline'>
                            <CopyIcon />
                        </Button>
                    </div> */}
                </CardContent>
            </Card>
            <Card className="w-[400px] border-red-600 border-2">
                <CardHeader className="flex items-center justify-center text-center p-4">
                    <CardTitle className="text-red-600">Zona de peligro</CardTitle>
                </CardHeader>
                <Separator className="bg-red-600" />
                <CardContent className="p-7 border-red-600">
                    <div className="flex justify-between mb-6">
                        <div className="flex flex-col">
                            <label className="text-red-600">Archivar workspace</label>
                            <span className="text-red-400 text-sm text-balance">Solo lectura para usuarios Admin</span>
                        </div>
                        <Button variant='destructive'>
                            Archivar
                        </Button>
                    </div>
                    <div className="flex justify-between mb-6">
                        <div className="flex flex-col">
                            <label className="text-red-600">Eliminar workspace</label>
                            <span className="text-red-500 text-sm text-balance">Esta accion es irreversible</span>
                        </div>
                        <Button variant='destructive'>
                            Eliminar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default WorkspaceSettings;