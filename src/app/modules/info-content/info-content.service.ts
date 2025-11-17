import { prisma } from '../../utils/prisma';
import { InfoContent } from './info-content.interface';

const createInfoContentInDB = async (infoContent: InfoContent) => {
    const result = await prisma.infoContent.upsert({
        where: {
            type: infoContent.type,
        },
        update: {
            title: infoContent.title,
            content: infoContent.content,
        },
        create: infoContent,
    });
    return result;
};

const getAllInfoContentFromDB = async () => {
    const result = await prisma.infoContent.findMany();
    return result;
};

export const InfoContentService = {
    createInfoContentInDB,
    getAllInfoContentFromDB,
};
