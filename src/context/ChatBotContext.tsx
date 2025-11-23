'use client'
import { createContext, useContext, useState, ReactNode } from "react";

interface ChatBotContextType {
  isOpen: boolean;
  toggleChatBot: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const ChatBotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatBot = () => setIsOpen((prev) => !prev);

  return (
    <ChatBotContext.Provider
      value={{ isOpen, toggleChatBot }}
    >
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBot must be used within a ChatBotProvider");
  }
  return context;
};
