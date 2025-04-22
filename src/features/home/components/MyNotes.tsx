import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import Note from "./Note";

const MyNotes = () => {
    return (
        <Card className="col-span-1 row-span-2 flex flex-col justify-start items-center bg-sidebar-accent">
            <CardTitle className="p-4">My notes</CardTitle>
            <CardContent className="flex flex-col gap-y-4 w-full mt-2">
                <div className="flex flex-col gap-2">
                    <Input placeholder="Titulo" className="bg-sidebar" />
                    <Textarea placeholder="Recordar que..." maxLength={256} className="resize-none h-40 bg-sidebar" />
                    <div className="flex justify-end">
                        <Button><Plus /> Add note</Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 justify-center">
                    <Note content='Terminar esta tarea antes de irme a dormir para sentir un avance copado' />
                    <Note content='Terminar esta tarea antes de irme a dormir para sentir un avance copado' />
                    <Note content='Terminar esta tarea antes de irme a dormir para sentir un avance copado' />
                    <Note content='Terminar esta tarea antes de irme a dormir para sentir un avance copado' />
                </div>
            </CardContent>
        </Card>
    );
}

export default MyNotes;