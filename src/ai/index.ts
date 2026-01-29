import { cerebrasService } from "./cerebras";
import { groqService } from "./groq";
import { AIService } from "./types";

const services: AIService[] = [
    groqService,
    cerebrasService,
];

let currentServiceIndex = 0;

export function getNextService(): AIService {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}