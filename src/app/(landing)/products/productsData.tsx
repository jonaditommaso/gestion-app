import { Bot, Code, CreditCard, TrendingUp } from "lucide-react";

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
        id: "sells",
        title: "products-sells-title",
        description: "products-sells-description",
        color: 'text-emerald-600',
        bgColor: 'from-emerald-50 to-teal-100',
        icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
        items: [
            "product-sells-item-1",
            "product-sells-item-2",
            "product-sells-item-3",
            "product-sells-item-4"
        ]
    },
    {
        id: "billing",
        title: "products-billing-title",
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
        id: "chatbot",
        title: "products-chatbot-title",
        description: "products-chatbot-description",
        color: 'text-orange-600',
        bgColor: 'from-orange-50 to-amber-100',
        icon: <Bot className="h-8 w-8 text-orange-600" />,
        items: [
            "product-chatbot-item-1",
            "product-chatbot-item-2",
            "product-chatbot-item-3",
            "product-chatbot-item-4"
        ]
    }
];