import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CalendarEvents = () => {
    return (
        <Card className="col-span-1 max-w-lg bg-sidebar-accent">
            <Tabs defaultValue="own">
                <CardHeader className="flex justify-between flex-row">
                    <div className="pt-1">
                        <CardTitle>Calendar events</CardTitle>
                        <CardDescription>Proximos eventos</CardDescription>
                    </div>
                    <TabsList className="mt-0">
                        <TabsTrigger value="own">Mis eventos</TabsTrigger>
                        <TabsTrigger value="team">Vatican Pancho</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <TabsContent value="own">
                    <CardContent className="grid gap-4">
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Empezar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Empezar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Empezar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                    </CardContent>
                </TabsContent>
                <TabsContent value="team">
                    <CardContent className="grid gap-4">
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Terminar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Terminar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Terminar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                    </CardContent>
                </TabsContent>
            </Tabs>
        </Card>
    );
}

export default CalendarEvents;