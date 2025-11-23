import z from 'zod';

const createProductValidation = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long'),
        description: z.string().min(3, 'Description must be at least 3 characters long'),
        price: z.number({ required_error: 'Price is required' }),
        buyLink: z.string({ required_error: 'Buy link is required' }),
        categoryId: z.string({ required_error: 'Category ID is required' }),
    }),
});

export const ProductValidation = {
    createProductValidation,
};
