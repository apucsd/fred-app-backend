import z from 'zod';

const createProductValidation = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long'),
        description: z.string().min(3, 'Description must be at least 3 characters long'),
        price: z.number({ required_error: 'Price is required' }),
        images: z
            .array(z.string())
            .min(1, 'At least one image is required')
            .refine(
                (value) => value.every((url) => url.startsWith('http://') || url.startsWith('https://')),
                'All images must be valid URLs'
            ),
        buyLink: z.string({ required_error: 'Buy link is required' }).url({
            message: 'Buy link must be a valid URL',
        }),
        categoryId: z.string({ required_error: 'Category ID is required' }),
    }),
});

export const ProductValidation = {
    createProductValidation,
};
