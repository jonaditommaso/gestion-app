'use client';

import { useChatBot } from "@/context/ChatBotContext";
import ChatBotPanel from "./ChatBotPanel";

export const ChatBot = () => {
    const { isOpen, toggleChatBot } = useChatBot();

    if (isOpen) return <ChatBotPanel isOpen={isOpen} toggleChatBot={toggleChatBot} />;
}