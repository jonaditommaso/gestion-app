import { FolderOpen, PackageSearch, Receipt, Workflow } from "lucide-react";

export const products: { title: string; href: string; description: string, icon: JSX.Element }[] = [
  {
    title: "navbar-products-workspaces-title",
    href: "/products#workspaces",
    description: "navbar-products-workspaces-description",
    icon: <Workflow className="h-5 w-5" />
  },
  {
    title: "navbar-products-records-title",
    href: "/products#registers",
    description: "navbar-products-records-description",
    icon: <FolderOpen className="h-5 w-5" />
  },
  {
    title: "navbar-products-billing-title",
    href: "/products#billing",
    description: "navbar-products-billing-description",
    icon: <Receipt className="h-5 w-5" />
  },
  {
    title: "navbar-products-inventory-title",
    href: "/products#inventory",
    description: "navbar-products-inventory-description",
    icon: <PackageSearch className="h-5 w-5" />
  },
]