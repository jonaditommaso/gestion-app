import {  Handshake, Home, KeyRound, Mail, NotepadText, ReceiptText, UserRoundSearch, Users } from "lucide-react"; // Archive, Target

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
  {
    title: "sells",
    url: "/sells",
    icon: Handshake,
    key: 'sells'
  },
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
    title: "messages",
    url: "/messages",
    icon: Mail,
    key: 'messages'
  },
  {
    title: "team",
    url: "/team",
    icon: Users,
    key: 'team'
  },
  {
    title: "roles",
    url: "/roles",
    icon: KeyRound,
    key: 'roles'
  },
]