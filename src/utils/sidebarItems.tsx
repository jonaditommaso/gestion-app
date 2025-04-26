import {  Home, NotepadText, ReceiptText, UserRoundSearch, Users } from "lucide-react"; // Archive, Handshake, Target, KeyRound, MessagesSquare,

export const initialItem = [
  {
    title: "home",
    url: "/",
    icon: Home,
    key: 'home'
  },
]

export const sidebarItems = [
  {
    title: "billing",
    url: "/billing-management",
    icon: ReceiptText,
    key: 'billing-management'
  },
  // {
  //   title: "Inventario",
  //   url: "/inventory",
  //   icon: Archive,
  //   key: 'inventory'
  // },
  // {
  //   title: "Ventas",
  //   url: "/sells",
  //   icon: Handshake,
  //   key: 'sells'
  // },
  // {
  //   title: "Marketing",
  //   url: "/marketing",
  //   icon: Target,
  //   key: 'marketing'
  // },
  {
    title: "records",
    url: "/records",
    icon: UserRoundSearch,
    key: 'records'
  },
  {
    title: "activities",
    url: "/workspaces",
    icon: NotepadText,
    key: 'workspaces'
  },
]

export const sidebarBottomItems = [
  {
    title: "team",
    url: "/team",
    icon: Users,
    key: 'team'
  },
  // {
  //   title: "Chat",
  //   url: "/chat",
  //   icon: MessagesSquare,
  //   key: 'chat'
  // },
  // {
  //   title: "Permisos",
  //   url: "/permissions",
  //   icon: KeyRound,
  //   key: 'permission'
  // },
]