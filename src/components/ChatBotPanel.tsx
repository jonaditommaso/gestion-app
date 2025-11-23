'use client'
import { useChatBot } from "@/context/ChatBotContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Send, BotMessageSquare, Plus, History } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useResizePanel } from "@/hooks/useResizePanel";
import "@/styles/chatbot.css";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
}

const ChatBotPanel = () => {
  const { isOpen, toggleChatBot } = useChatBot();
  const t = useTranslations("chatbot");
  const [width, setWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>("1");
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const resizeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = useMemo(() => currentChat?.messages || [], [currentChat?.messages]);
  const hasMessages = messages.length > 0;

  // Custom hook para manejar el resize del panel
  useResizePanel({
    isOpen,
    isResizing,
    minWidth: 300,
    setWidth,
    setIsResizing,
  });

  // Auto-resize textarea con field-sizing o fallback
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set the height based on scrollHeight, with a max height
    const maxHeight = 200; // máximo de 200px
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [inputValue]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setShowHistory(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    // Actualizar el chat actual con el nuevo mensaje
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );
    setInputValue("");

    // Aquí puedes agregar la lógica para enviar el mensaje a tu backend
    // y recibir la respuesta del chatbot

    // Simulación de respuesta (eliminar cuando conectes el backend)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: t("bot-response"),
        role: "assistant",
        timestamp: new Date(),
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, botResponse] }
            : chat
        )
      );
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={toggleChatBot}
      />

      {/* Panel del ChatBot */}
      <div
        className={`chatbot-panel fixed top-0 right-0 h-full bg-background border-l shadow-2xl z-50 flex flex-col ${
          isResizing ? 'resizing' : ''
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="resize-handle absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">{t("title")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-8 w-8"
              title={t("new-chat")}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="h-8 w-8"
              title={t("history")}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChatBot}
              className="h-8 w-8"
              title={t("close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 chat-scrollarea" ref={scrollRef}>
          {showHistory ? (
            /* Historial de conversaciones */
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">{t("history-title")}</h3>
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    setShowHistory(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted ${
                    chat.id === currentChatId ? "bg-muted border-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {chat.messages.length > 0
                        ? chat.messages[0].content.substring(0, 40) + "..."
                        : t("empty-conversation")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {chat.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chat.messages.length} {chat.messages.length !== 1 ? t("messages") : t("message")}
                  </p>
                </button>
              ))}
            </div>
          ) : hasMessages ? (
            /* Conversación activa */
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${
                    message.role === "user"
                      ? "flex justify-end"
                      : "group"
                  }`}
                >
                  {message.role === "user" ? (
                    /* Mensaje del usuario - estilo burbuja */
                    <div className="max-w-[80%] rounded-lg p-3 bg-primary text-primary-foreground">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    /* Mensaje de la IA - estilo plano con hover */
                    <div className="w-full">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">
                        {t("model-name")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Estado vacío - Pantalla de bienvenida */
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <BotMessageSquare className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {t("welcome-title")}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                {t("welcome-description")}
              </p>
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              placeholder={t("placeholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="auto-resize-textarea flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="icon"
              className="h-10 w-10 shrink-0"
              title={t("send")}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("input-hint")}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatBotPanel;
