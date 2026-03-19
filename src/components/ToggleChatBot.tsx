'use client'
import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useChatBot } from "@/context/ChatBotContext";
import { usePlanAccess } from "@/hooks/usePlanAccess";

const ToggleChatBot = () => {
    const { toggleChatBot } = useChatBot();
    const { isFree } = usePlanAccess();

    if (isFree) return null;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleChatBot}
            data-testid="chatbot-trigger"
        >
            <BotMessageSquare className="h-[1.5rem] w-[1.5rem] transition-all" />
        </Button>
    );
}

export default ToggleChatBot;