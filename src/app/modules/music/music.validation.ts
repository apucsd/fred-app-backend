import { z } from 'zod';

const createMusicSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        // subtitle: z.string().min(1, 'Subtitle is required'),
        playlistId: z.string().min(1, 'Playlist ID is required'),
        image: z
            .string({
                required_error: 'Image is required',
            })
            .url({
                message: 'Image must be a valid URL',
            }),
        audio: z
            .string({
                required_error: 'Audio is required',
            })
            .url({
                message: 'Audio must be a valid URL',
            }),
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
