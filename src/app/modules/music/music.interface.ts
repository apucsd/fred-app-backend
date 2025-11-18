export type IMusic = {
    id: string;
    userId: string;
    title: string;
    artist?: string | null;
    subtitle: string;
    album?: string | null;
    genre?: string | null;
    image: string;
    audio: string;
    releaseDate?: Date | null;
    duration?: number | null;
    createdAt: Date;
    updatedAt: Date;
};
