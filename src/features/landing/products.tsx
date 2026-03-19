import { Bot, Receipt, TrendingUp, Workflow } from "lucide-react";

export const products: { title: string; href: string; description: string, icon: JSX.Element }[] = [
  {
    title: "navbar-products-workspaces-title",
    href: "/products#workspaces",
    description: "navbar-products-workspaces-description",
    icon: <Workflow className="h-5 w-5" />
  },
  {
    title: "navbar-products-billing-title",
    href: "/products#billing",
    description: "navbar-products-billing-description",
    icon: <Receipt className="h-5 w-5" />
  },
  {
    title: "navbar-products-sells-title",
    href: "/products#sells",
    description: "navbar-products-sells-description",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    title: "navbar-products-chatbot-title",
    href: "/products#chatbot",
    description: "navbar-products-chatbot-description",
    icon: <Bot className="h-5 w-5" />
  },
]