export const CEREBRAS_MODEL = 'zai-glm-4.7';
export const GROQ_MODEL = 'openai/gpt-oss-120b';

export const MODELS = {
    [GROQ_MODEL]: {
        provider: "groq",
        displayName: "Groq · GPT-OSS 120B",
        tier: "free",
    },
    [CEREBRAS_MODEL]: {
        provider: "cerebras",
        displayName: "Cerebras · Zai-GLM 4.7",
        tier: "free",
    }
}
