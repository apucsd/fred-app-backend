import z from 'zod';

const createWishlistValidation = z.object({
    body: z.object({
        productId: z.string(),
    }),
});

export const WishlistValidation = {
    createWishlistValidation,
};
