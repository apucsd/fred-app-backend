import QueryBuilder from '../../builder/QueryBuilder';
import { prisma } from '../../utils/prisma';
import { IFaq } from './faq.interface';

const createFaqIntoDB = async (faq: IFaq) => {
    const result = await prisma.faq.create({
        data: faq,
    });
    return result;
};

const getFaqsFromDB = async (query: Record<string, any>) => {
    const faqQuery = new QueryBuilder(prisma.faq, query);
    const result = await faqQuery
        .search(['question', 'answer'])
        .sort()
        .filter()
        .fields()
        .exclude()
        .paginate()
        .execute();
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
