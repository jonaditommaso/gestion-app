import { Code, CreditCard, Database, Package } from "lucide-react";

export const productsData = [
    {
        id: "workspaces",
        title: "products-workspaces-title",
        description: "products-workspaces-description",
        color: 'text-blue-600',
        bgColor: 'from-blue-50 to-indigo-100',
        icon: <Code className="h-8 w-8 text-blue-600" />,
        items: [
            "product-workspace-item-1",
            "product-workspace-item-2",
            "product-workspace-item-3",
            "product-workspace-item-4"
        ]
    },
    {
        id: "records",
        title: "records",
        description: "products-records-description",
        color: 'text-emerald-600',
        bgColor: 'from-emerald-50 to-green-100',
        icon: <Database className="h-8 w-8 text-emerald-600" />,
        items: [
            "product-records-item-1",
            "product-records-item-2",
            "product-records-item-3",
            "product-records-item-4"
        ]
    },
    {
        id: "billing",
        title: "facturation",
        description: "products-billing-description",
        color: 'text-purple-600',
        bgColor: 'from-purple-50 to-violet-100',
        icon: <CreditCard className="h-8 w-8 text-purple-600" />,
        items: [
            "product-billing-item-1",
            "product-billing-item-2",
            "product-billing-item-3",
            "product-billing-item-4"
        ]
    },
    {
        id: "inventory",
        title: "products-inventory-title",
        description: "products-inventory-description",
        color: 'text-orange-600',
        bgColor: 'from-orange-50 to-amber-100',
        icon: <Package className="h-8 w-8 text-orange-600" />,
        items: [
            "product-inventory-item-1",
            "product-inventory-item-2",
            "product-inventory-item-3",
            "product-inventory-item-4"
        ]
    }
];