import { useMutation } from "@tanstack/react-query";

interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
}

export const useSendGmail = () => {
    return useMutation<void, Error, SendEmailPayload>({
        mutationFn: async (payload: SendEmailPayload): Promise<void> => {
            const res = await fetch('/api/sells/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json() as { error?: string };
                throw new Error(data.error ?? 'Failed to send email');
            }
        },
    });
};
