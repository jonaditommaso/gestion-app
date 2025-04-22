import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ToDoTasksWidget = () => {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Tareas que hacer</CardTitle>
                <CardDescription>De tu tablero de actividades.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="border bg-sidebar-accent p-2 rounded-md">
                    <p className="font-medium">Terminar seccion de inicio</p>
                    <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                </div>
                <div className="border bg-sidebar-accent p-2 rounded-md">
                    <p className="font-medium">Terminar seccion de inicio</p>
                    <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                </div>
                <div className="border bg-sidebar-accent p-2 rounded-md">
                    <p className="font-medium">Terminar seccion de inicio</p>
                    <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default ToDoTasksWidget;