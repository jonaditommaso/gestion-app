import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator';
import { z } from "zod";
import { getNextService } from "@/ai";
import { ChatMessage } from "@/ai/types";

const chatMessageSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
    }))
});

const app = new Hono()
    .post(
        '/',
        zValidator('json', chatMessageSchema),
        async (ctx) => {
            const { messages } = ctx.req.valid('json') as { messages: ChatMessage[] };
            const service = getNextService();
            const stream = await service.chat(messages);

            // Crear un ReadableStream desde el AsyncIterable
            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of stream) {
                            if (chunk) {
                                controller.enqueue(new TextEncoder().encode(chunk));
                            }
                        }
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                }
            });

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            });
        }
    );

export default app;
