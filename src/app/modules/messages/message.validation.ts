import z from 'zod';

const sendMessage = z.object({
    body: z.object({
        receiverId: z.string({
            required_error: 'ReceiverId is required!',
        }),
        content: z.string().optional(),
        fileUrls: z.array(z.string()).optional(),
    }),
});

const getConversation = z.object({
    body: z.object({
        with: z.string({
            required_error: 'Other members id is required!',
        }),
    }),
});

export const messageValidation = {
    sendMessage,
    getConversation,
};
