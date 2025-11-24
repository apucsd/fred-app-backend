import z from 'zod';

const sendMessage = z.object({
    body: z.object({
        chatId: z.string({
            required_error: 'ChatId is required!',
        }),
        text: z.string(),
        file: z.string().optional(),
    }),
});

export const messageValidation = {
    sendMessage,
};
