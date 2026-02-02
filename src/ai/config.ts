export const CEREBRAS_MODEL = 'zai-glm-4.7';
export const GROQ_MODEL = 'moonshotai/kimi-k2-instruct-0905';

export const MODELS = {
    [GROQ_MODEL]: {
        provider: "groq",
        displayName: "Groq · Kimi K2",
        tier: "free",
    },
    [CEREBRAS_MODEL]: {
        provider: "cerebras",
        displayName: "Cerebras · Zai-GLM 4.7",
        tier: "free",
    }
}
