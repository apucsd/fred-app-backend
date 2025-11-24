import { z } from 'zod';

const toggleFollow = z.object({
    body: z.object({
        followingId: z.string({
            required_error: 'Following ID is required',
        }),
    }),
});

export const FollowValidation = {
    toggleFollow,
};
