import { groqService } from "./groq";
import { AIService } from "./types";

const services: AIService[] = [
    groqService,
    // other AI services can be added here
];

let currentServiceIndex = 0;

export function getNextService(): AIService {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}