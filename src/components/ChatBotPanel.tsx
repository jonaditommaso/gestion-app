'use client'
import { useChatBot } from "@/context/ChatBotContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Send, BotMessageSquare, Plus, History, Loader2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useResizePanel } from "@/hooks/useResizePanel";
import { useSendMessage } from "@/features/chat/api/use-send-message";
import { useGetConversations } from "@/features/chat/api/use-get-conversations";
import { useDeleteConversation } from "@/features/chat/api/use-delete-conversation";
import { ChatMessage } from "@/ai/types";
import "@/styles/chatbot.css";
import { MODELS } from "@/ai/config";
import MarkdownContent from "./MarkdownContent";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  modelName?: string; // Nombre del modelo que generó la respuesta
}

interface LocalChat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  isNew?: boolean; // true si aún no se ha guardado en la BD
}

const ChatBotPanel = () => {
  const { isOpen, toggleChatBot } = useChatBot();
  const t = useTranslations("chatbot");
  const [width, setWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [localChats, setLocalChats] = useState<LocalChat[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastModelName, setLastModelName] = useState<string>("AI");

  const resizeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Obtener conversaciones de la BD
  const { data: serverConversations, isLoading: isLoadingConversations } = useGetConversations();

  // Callback cuando se elimina una conversación exitosamente
  const handleDeleteSuccess = useCallback((conversationId: string) => {
    if (currentChatId === conversationId) {
      setCurrentChatId(null);
    }
    setLocalChats(prev => prev.filter(c => c.id !== conversationId));
  }, [currentChatId]);

  const { mutate: deleteConversation, isPending: isDeletingConversation, variables: deletingConversationId } = useDeleteConversation({
    onSuccess: handleDeleteSuccess,
  });

  // Combinar conversaciones del servidor con chats locales nuevos
  const allChats = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serverChats: LocalChat[] = (serverConversations || []).map((conv: any) => ({
      id: conv.$id,
      title: conv.title || '',
      messages: [], // Los mensajes se cargan cuando se selecciona
      createdAt: new Date(conv.$createdAt),
      isNew: false,
    }));

    // Agregar chats locales que aún no se han guardado
    const newLocalChats = localChats.filter(chat => chat.isNew);

    return [...newLocalChats, ...serverChats];
  }, [serverConversations, localChats]);

  const currentChat = useMemo(() => {
    if (!currentChatId) return null;
    return localChats.find(chat => chat.id === currentChatId) ||
           allChats.find(chat => chat.id === currentChatId);
  }, [currentChatId, localChats, allChats]);

  const messages = useMemo(() => currentChat?.messages || [], [currentChat?.messages]);
  const hasMessages = messages.length > 0;

  // Cargar mensajes cuando se selecciona una conversación existente
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId || currentChatId.startsWith('local-')) return;

      const existingChat = localChats.find(c => c.id === currentChatId);
      if (existingChat && existingChat.messages.length > 0) return; // Ya tiene mensajes

      setIsLoadingMessages(true);
      try {
        const response = await fetch(`/api/chat/conversations/${currentChatId}`);
        if (!response.ok) return;

        const { data } = await response.json();
        if (data?.messages) {
          const loadedMessages: Message[] = data.messages.map((msg: { $id: string; content: string; role: string; $createdAt: string; model?: string }) => ({
            id: msg.$id,
            content: msg.content,
            role: msg.role.toLowerCase() as 'user' | 'assistant',
            timestamp: new Date(msg.$createdAt),
            modelName: MODELS[msg.model as keyof typeof MODELS]?.displayName,
          }));

          setLocalChats(prev => {
            const exists = prev.find(c => c.id === currentChatId);
            if (exists) {
              return prev.map(c =>
                c.id === currentChatId ? { ...c, messages: loadedMessages } : c
              );
            }
            return [...prev, {
              id: currentChatId,
              title: data.title,
              messages: loadedMessages,
              createdAt: new Date(data.$createdAt),
              isNew: false,
            }];
          });
        }
      } catch {
        // Error silencioso, no bloquear la UI
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentChatId, localChats]);

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
    const newChat: LocalChat = {
      id: `local-${Date.now()}`,
      title: t("new-chat"),
      messages: [],
      createdAt: new Date(),
      isNew: true,
    };
    setLocalChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setShowHistory(false);
  };

  // Callback para manejar los chunks de streaming
  const handleChunk = useCallback((chunk: string) => {
    setLocalChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        const lastMessage = chat.messages[chat.messages.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage.id.startsWith("streaming-")) {
          // Actualizar el mensaje de streaming existente
          return {
            ...chat,
            messages: chat.messages.map((msg, idx) =>
              idx === chat.messages.length - 1
                ? { ...msg, content: msg.content + chunk }
                : msg
            ),
          };
        }
        return chat;
      })
    );
  }, [currentChatId]);

  // Callback para cuando se completa la respuesta
  const handleComplete = useCallback((fullResponse: string, newConversationId: string, modelName: string) => {
    setLastModelName(modelName);
    setLocalChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        // Actualizar el id del chat si era local y ahora tiene un id del servidor
        const updatedId = chat.isNew ? newConversationId : chat.id;

        return {
          ...chat,
          id: updatedId,
          isNew: false,
          messages: chat.messages.map((msg) =>
            msg.id.startsWith("streaming-")
              ? { ...msg, id: Date.now().toString(), content: fullResponse, modelName }
              : msg
          ),
        };
      })
    );

    // Actualizar el currentChatId si cambió
    setCurrentChatId((prevId) => {
      const chat = localChats.find(c => c.id === prevId);
      if (chat?.isNew) {
        return newConversationId;
      }
      return prevId;
    });
  }, [currentChatId, localChats]);

  const { mutate: sendMessage, isPending: isLoading } = useSendMessage({
    onChunk: handleChunk,
    onComplete: handleComplete,
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    // Crear mensaje placeholder para la respuesta del asistente
    const assistantPlaceholder: Message = {
      id: `streaming-${Date.now()}`,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };

    // Si no hay chat actual, crear uno nuevo
    if (!currentChatId) {
      const newChat: LocalChat = {
        id: `local-${Date.now()}`,
        title: inputValue.substring(0, 100),
        messages: [newMessage, assistantPlaceholder],
        createdAt: new Date(),
        isNew: true,
      };
      setLocalChats((prev) => [...prev, newChat]);
      setCurrentChatId(newChat.id);
      setShowHistory(false);

      // Preparar mensajes para enviar al backend
      const chatMessages: ChatMessage[] = [
        { role: 'user' as const, content: inputValue },
      ];

      setInputValue("");
      sendMessage({ messages: chatMessages });
      return;
    }

    // Actualizar el chat actual con el nuevo mensaje y el placeholder
    setLocalChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? inputValue.substring(0, 100) : chat.title,
              messages: [...chat.messages, newMessage, assistantPlaceholder]
            }
          : chat
      )
    );

    // Preparar mensajes para enviar al backend
    const chatMessages: ChatMessage[] = [
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: inputValue },
    ];

    // Determinar si enviar conversationId (solo si no es nuevo)
    const chat = localChats.find(c => c.id === currentChatId);
    const conversationId = chat?.isNew ? undefined : currentChatId;

    setInputValue("");
    sendMessage({ messages: chatMessages, conversationId });
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
        <ScrollArea className={`flex-1 p-4 chat-scrollarea ${showHistory ? 'chat-history-list' : ''}`} ref={scrollRef}>
          {showHistory ? (
            /* Historial de conversaciones */
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">{t("history-title")}</h3>
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allChats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("no-conversations")}
                </p>
              ) : (
                allChats.map((chat) => {
                  const isDeleting = isDeletingConversation && deletingConversationId === chat.id;

                  return (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors overflow-hidden ${isDeleting ? 'opacity-50' : 'hover:bg-muted'} ${
                        chat.id === currentChatId ? "bg-muted border-primary" : ""
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (isDeleting) return;
                          // Si es una conversación del servidor, cargar los mensajes
                          if (!chat.isNew) {
                            const existingLocal = localChats.find(c => c.id === chat.id);
                            if (!existingLocal) {
                              // Agregar a localChats para manejar los mensajes
                              setLocalChats(prev => [...prev, { ...chat, messages: [] }]);
                            }
                          }
                          setCurrentChatId(chat.id);
                          setShowHistory(false);
                        }}
                        className={`flex-1 min-w-0 text-left ${isDeleting ? 'pointer-events-none' : ''}`}
                        disabled={isDeleting}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {chat.title || t("empty-conversation")}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {chat.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                      {!chat.isNew && (
                        isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : isLoadingMessages ? (
            /* Estado de carga de mensajes */
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-sm">
                {t("loading-messages")}
              </p>
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
                      <div className="text-sm leading-relaxed">
                        <MarkdownContent content={message.content} />
                      </div>
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">
                        {message.modelName || lastModelName}
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
              disabled={isLoading}
              className="auto-resize-textarea flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0"
              title={t("send")}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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
