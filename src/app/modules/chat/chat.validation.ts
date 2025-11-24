import z from 'zod';

const createChat = z.object({
    body: z.object({
        participants: z
            .array(
                z.string({
                    required_error: 'Participants are required!',
                })
            )
            .min(1, 'At least one participant is required'),
    }),
});

export const ChatValidation = {
    createChat,
};
