import { ArrowRightLeft, Calculator, KeyRound, ListTodo, LucideIcon, Palette, UserRoundSearch } from "lucide-react";

type Service = {
    title: string,
    description: string,
    icon: LucideIcon,
    iconColor: string,
    circleColor: string,
    circlePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export const services: Service[] = [
    {
        title: 'Controla tu facturacion',
        description: 'Carga tus ingresos y egresos de manera sencilla y rapida, y obten un resumen de tus cuentas',
        icon: Calculator,
        iconColor: 'text-orange-500',
        circleColor: 'bg-orange-300',
        circlePosition: "top-right"
    },
    {
        title: 'Gestiona tu inventario',
        description: 'Monitorea la entrada y salida de productos con una interfaz clara e intuitiva para controlar el estado de tus ventas y tu stock',
        icon: ArrowRightLeft,
        iconColor: 'text-green-500',
        circleColor: 'bg-green-300',
        circlePosition: "top-right"
    },
    {
        title: 'Sigue de cerca tu proyecto',
        description: 'Te ofrecemos un tablero Kanban para que puedas visualizar y administrar el estado de tus tareas y proyectos',
        icon: ListTodo,
        iconColor: 'text-purple-500',
        circleColor: 'bg-purple-300',
        circlePosition: "bottom-left"
    },
    {
        title: 'Lleva un registro actualizado',
        description: 'Puedes cargar listados de clientes, proveedores, empleados o lo que tu quieras y necesites para tu negocio, empresa o institucion',
        icon: UserRoundSearch,
        iconColor: 'text-blue-500',
        circleColor: 'bg-blue-300',
        circlePosition: 'top-left'
    },
    {
        title: 'Administra los permisos',
        description: 'Puedes restringir el acceso a ciertas secciones de la aplicacion para que solo los usuarios autorizados puedan verlas',
        icon: KeyRound,
        iconColor: 'text-yellow-500',
        circleColor: 'bg-yellow-300',
        circlePosition: "top-right"
    },
    {
        title: 'Personaliza tu experiencia',
        description: 'Puedes escoger entre varios temas y personalizar la aplicacion a tu gusto para que te sientas comodo trabajando',
        icon: Palette,
        iconColor: 'text-pink-500',
        circleColor: 'bg-pink-300',
        circlePosition: "bottom-right"
    },
]