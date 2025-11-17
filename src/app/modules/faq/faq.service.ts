import { prisma } from '../../utils/prisma';
import { IFaq } from './faq.interface';

const createFaqIntoDB = async (faq: IFaq) => {
    const result = await prisma.faq.create({
        data: faq,
    });
    return result;
};

const getFaqsFromDB = async () => {
    const result = await prisma.faq.findMany();
    return result;
};

const getFaqFromDB = async (id: string) => {
    const result = await prisma.faq.findUnique({
        where: {
            id,
        },
    });
    return result;
};

const updateFaqInDB = async (id: string, faq: Partial<IFaq>) => {
    const result = await prisma.faq.update({
        where: {
            id,
        },
        data: faq,
    });
    return result;
};

const deleteFaqFromDB = async (id: string) => {
    const result = await prisma.faq.delete({
        where: {
            id,
        },
    });
    return result;
};

export const FaqService = {
    createFaqIntoDB,
    getFaqsFromDB,
    getFaqFromDB,
    updateFaqInDB,
    deleteFaqFromDB,
};
