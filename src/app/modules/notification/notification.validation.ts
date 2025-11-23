import { z } from 'zod';

const createNotification = z.object({
    body: z.object({
        recipientId: z.string({
            required_error: 'Recipient ID is required',
        }),
        type: z.enum(['INFO', 'MESSAGE', 'FOLLOW', 'SUBSCRIPTION']).default('INFO'),
        message: z
            .string({
                required_error: 'Message is required',
            })
            .min(10, 'Message must be at least 10 characters long'),
    }),
});

export const notificationValidation = {
    createNotification,
};
