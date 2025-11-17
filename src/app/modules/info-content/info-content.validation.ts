import { InfoContentType } from '@prisma/client';
import { z } from 'zod';

const createInfoContentValidation = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long'),
        content: z.string().min(3, 'Content must be at least 3 characters long'),
        type: z.nativeEnum(InfoContentType),
    }),
});

export const InfoContentValidation = {
    createInfoContentValidation,
};
