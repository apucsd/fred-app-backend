import { z } from 'zod';

const createMusicSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        subtitle: z.string().min(1, 'Subtitle is required'),
        artist: z.string().optional(),
        album: z.string().optional(),
        genre: z.string().optional(),
        releaseDate: z.string().datetime().optional(),
        duration: z.number().optional(),
    }),
});

export const MusicValidation = {
    createMusicSchema,
};
