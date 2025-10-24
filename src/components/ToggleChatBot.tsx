'use client'
import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useChatBot } from "@/context/ChatBotContext";

const ToggleChatBot = () => {
    const { toggleChatBot } = useChatBot();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleChatBot}
        >
            <BotMessageSquare className="h-[1.5rem] w-[1.5rem] transition-all" />
        </Button>
    );
}

export default ToggleChatBot;