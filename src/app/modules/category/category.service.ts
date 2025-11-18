import QueryBuilder from '../../builder/QueryBuilder';
import { prisma } from '../../utils/prisma';
import { ICategory } from './category.interface';

const createCategoryInDB = async (payload: ICategory) => {
    const result = await prisma.category.create({
        data: payload,
    });
    return result;
};

const getAllCategoriesFromDB = async (query: Record<string, any>) => {
    const categoryQuery = new QueryBuilder(prisma.category, query);
    const result = await categoryQuery.search(['title']).sort().filter().fields().paginate().execute();
    return result;
};

const getCategoryByIdFromDB = async (id: string) => {
    const result = await prisma.category.findUnique({
        where: {
            id,
        },
    });
    return result;
};

const updateCategoryInDB = async (id: string, payload: Partial<ICategory>) => {
    const result = await prisma.category.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
};

const deleteCategoryFromDB = async (id: string) => {
    const result = await prisma.category.delete({
        where: {
            id,
        },
    });
    return result;
};

export const CategoryService = {
    createCategoryInDB,
    getAllCategoriesFromDB,
    getCategoryByIdFromDB,
    updateCategoryInDB,
    deleteCategoryFromDB,
};
