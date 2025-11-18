import z from 'zod';

const createProductValidation = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long'),
        description: z.string().min(3, 'Description must be at least 3 characters long'),
        price: z.number(),
        categoryId: z.string(),
    }),
});

export const ProductValidation = {
    createProductValidation,
};
