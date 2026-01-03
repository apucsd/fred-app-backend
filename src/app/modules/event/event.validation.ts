import { z } from 'zod';

const createEventSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long'),
        description: z.string().min(3, 'Description must be at least 3 characters long'),
        location: z.string().min(3, 'Location must be at least 3 characters long'),
        image: z.string({
            required_error: 'Image is required',
        }),
        video: z
            .string({
                required_error: 'Video is required',
            })
            .optional(),
        eventDate: z
            .string({
                required_error: 'Event date is required',
            })
            .datetime(),
        price: z.number(),
    }),
});

export const EventValidation = {
    createEventSchema,
};
