import z from 'zod';

const createPlaylistZodSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(3, 'Name must be at least 3 characters long'),
        description: z.string({
            required_error: 'Description is required',
        }),
        coverImage: z
            .string({
                required_error: 'Cover image is required',
            })
            .url('Cover image must be a valid URL'),
        price: z
            .number()
            .refine((value) => value >= 0, {
                message: 'Price must be a positive number',
            })
            .optional(),
    }),
});
const updatePlaylistZodSchema = z.object({
    body: createPlaylistZodSchema.shape.body.partial(),
});
export const PlaylistValidation = {
    createPlaylistZodSchema,
    updatePlaylistZodSchema,
};
