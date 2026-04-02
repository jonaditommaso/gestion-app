import { Handshake, Home, KeyRound, Mail, NotepadText, ReceiptText, Users } from "lucide-react"; // Archive, Target
import { OrganizationPlan } from "@/features/team/types";

export type SidebarItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    key: string;
    plans?: OrganizationPlan[];
};

const ALL_PLANS: OrganizationPlan[] = ['FREE', 'PLUS', 'PRO', 'ENTERPRISE'];
const PAID_PLANS: OrganizationPlan[] = ['PLUS', 'PRO', 'ENTERPRISE'];

export const initialItem: SidebarItem[] = [
  {
    title: "home",
    url: "/",
    icon: Home,
    key: 'home',
    plans: ALL_PLANS,
  },
]

export const sidebarItems: SidebarItem[] = [
  {
    title: "billing",
    url: "/billing-management",
    icon: ReceiptText,
    key: 'billing-management',
    plans: PAID_PLANS,
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
    key: 'sells',
    plans: ALL_PLANS,
  },
  // {
  //   title: "Marketing",
  //   url: "/marketing",
  //   icon: Target,
  //   key: 'marketing'
  // },
  // {
  //   title: "records",
  //   url: "/records",
  //   icon: UserRoundSearch,
  //   key: 'records'
  // },
  {
    title: "activities",
    url: "/workspaces",
    icon: NotepadText,
    key: 'workspaces',
    plans: ALL_PLANS,
  },
]

export const sidebarBottomItems: SidebarItem[] = [
  {
    title: "messages",
    url: "/messages",
    icon: Mail,
    key: 'messages',
    plans: PAID_PLANS,
  },
  {
    title: "team",
    url: "/team",
    icon: Users,
    key: 'team',
    plans: ALL_PLANS,
  },
  {
    title: "roles",
    url: "/roles",
    icon: KeyRound,
    key: 'roles',
    plans: PAID_PLANS,
  },
]