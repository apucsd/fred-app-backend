import { z } from 'zod';

const createReviewZodSchema = z.object({
    body: z.object({
        rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot be more than 5'),
        feedback: z.string().min(1, 'Feedback is required'),
        productId: z.string().min(1, 'Product ID is required'),
    }),
});

const updateReviewZodSchema = z.object({
    body: z.object({
        rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot be more than 5').optional(),
        feedback: z.string().min(1, 'Feedback is required').optional(),
        productId: z.string().min(1, 'Product ID is required').optional(),
    }),
});

export const ReviewValidation = {
    createReviewZodSchema,
    updateReviewZodSchema,
};
