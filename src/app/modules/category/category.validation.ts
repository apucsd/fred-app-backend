import z from 'zod';

const createCategoryValidationSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
    }),
});

export const CategoryValidation = {
    createCategoryValidationSchema,
};
