import z from 'zod';

const createFaqValidationSchema = z.object({
    body: z.object({
        question: z.string().min(1, 'Question is required'),
        answer: z.string().min(1, 'Answer is required'),
    }),
});

export const faqValidation = {
    createFaqValidationSchema,
};
