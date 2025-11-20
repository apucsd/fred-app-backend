import z from 'zod';

const createSubscriptionPaymentLinkSchema = z.object({
    body: z.object({
        packageId: z.string({
            required_error: 'Package ID is required',
        }),
    }),
});

const cancelSubscriptionFromStripeSchema = z.object({
    body: z.object({
        packageId: z.string({
            required_error: 'Package ID is required',
        }),
    }),
});

export const SubscriptionValidation = {
    createSubscriptionPaymentLinkSchema,
    cancelSubscriptionFromStripeSchema,
};
