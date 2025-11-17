import { InfoContentType } from '@prisma/client';

export interface InfoContent {
    id: string;
    title: string;
    content: string;
    type: InfoContentType;
    createdAt: Date;
    updatedAt: Date;
}
