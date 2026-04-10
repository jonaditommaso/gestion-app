'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { Task } from '@/features/tasks/types';
import type { BillingDoc, DealWithAssignees } from '@/lib/demo-data';
import type { Message } from '@/features/home/components/messages/types';
import type { NoteData } from '@/features/home/types';
import {
    DEMO_TASKS_INITIAL,
    DEMO_DEALS_INITIAL,
    DEMO_BILLING_INITIAL,
    DEMO_BILLING_DRAFTS_INITIAL,
    DEMO_BILLING_ARCHIVED_INITIAL,
    DEMO_MESSAGES,
    DEMO_NOTES_INITIAL,
} from '@/lib/demo-data';

type DemoDataContextType = {
    tasks: Task[];
    deals: DealWithAssignees[];
    billingOps: BillingDoc[];
    billingDrafts: BillingDoc[];
    billingArchived: BillingDoc[];
    messages: Message[];
    notes: NoteData[];
    addTask: (task: Task) => void;
    updateTask: (id: string, patch: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    addDeal: (deal: DealWithAssignees) => void;
    updateDeal: (id: string, patch: Partial<DealWithAssignees>) => void;
    deleteDeal: (id: string) => void;
    addBillingOp: (op: BillingDoc) => void;
    updateBillingOp: (id: string, patch: Partial<BillingDoc>) => void;
    deleteBillingOp: (id: string) => void;
    addMessage: (msg: Message) => void;
    addNote: (note: NoteData) => void;
    updateNote: (id: string, patch: Partial<NoteData>) => void;
    deleteNote: (id: string) => void;
};

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

export const DemoDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS_INITIAL);
    const [deals, setDeals] = useState<DealWithAssignees[]>(DEMO_DEALS_INITIAL);
    const [billingOps, setBillingOps] = useState<BillingDoc[]>(DEMO_BILLING_INITIAL);
    const [billingDrafts] = useState<BillingDoc[]>(DEMO_BILLING_DRAFTS_INITIAL);
    const [billingArchived] = useState<BillingDoc[]>(DEMO_BILLING_ARCHIVED_INITIAL);
    const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
    const [notes, setNotes] = useState<NoteData[]>(DEMO_NOTES_INITIAL);

    const addTask = useCallback((task: Task) => setTasks(prev => [task, ...prev]), []);
    const updateTask = useCallback((id: string, patch: Partial<Task>) =>
        setTasks(prev => prev.map(t => t.$id === id ? { ...t, ...patch } : t)), []);
    const deleteTask = useCallback((id: string) =>
        setTasks(prev => prev.filter(t => t.$id !== id)), []);

    const addDeal = useCallback((deal: DealWithAssignees) => setDeals(prev => [deal, ...prev]), []);
    const updateDeal = useCallback((id: string, patch: Partial<DealWithAssignees>) =>
        setDeals(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d)), []);
    const deleteDeal = useCallback((id: string) =>
        setDeals(prev => prev.filter(d => d.id !== id)), []);

    const addBillingOp = useCallback((op: BillingDoc) => setBillingOps(prev => [op, ...prev]), []);
    const updateBillingOp = useCallback((id: string, patch: Partial<BillingDoc>) =>
        setBillingOps(prev => prev.map(o => o.$id === id ? { ...o, ...patch } : o)), []);
    const deleteBillingOp = useCallback((id: string) =>
        setBillingOps(prev => prev.filter(o => o.$id !== id)), []);

    const addMessage = useCallback((msg: Message) => setMessages(prev => [msg, ...prev]), []);

    const addNote = useCallback((note: NoteData) => setNotes(prev => [note, ...prev]), []);
    const updateNote = useCallback((id: string, patch: Partial<NoteData>) =>
        setNotes(prev => prev.map(n => n.$id === id ? { ...n, ...patch } : n)), []);
    const deleteNote = useCallback((id: string) =>
        setNotes(prev => prev.filter(n => n.$id !== id)), []);

    return (
        <DemoDataContext.Provider value={{
            tasks, deals, billingOps, billingDrafts, billingArchived, messages, notes,
            addTask, updateTask, deleteTask,
            addDeal, updateDeal, deleteDeal,
            addBillingOp, updateBillingOp, deleteBillingOp,
            addMessage,
            addNote, updateNote, deleteNote,
        }}>
            {children}
        </DemoDataContext.Provider>
    );
};

export const useDemoData = () => {
    const context = useContext(DemoDataContext);
    if (!context) throw new Error('useDemoData must be used within DemoDataProvider');
    return context;
};
