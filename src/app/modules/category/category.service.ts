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
    const categoryQuery = new QueryBuilder(prisma.category, { ...query, status: 'ACTIVE' });
    const result = await categoryQuery
        .search(['title'])
        .sort()
        .filter()
        .fields()
        .paginate()
        .customFields({
            id: true,
            title: true,
        })
        .execute();
    return result;
};

const getCategoryByIdFromDB = async (id: string) => {
    const result = await prisma.category.findUnique({
        where: {
            id,
            status: 'ACTIVE',
        },
    });
    return result;
};

const updateCategoryInDB = async (id: string, payload: Partial<ICategory>) => {
    const result = await prisma.category.update({
        where: {
            id,
            status: 'ACTIVE',
        },
        data: payload,
    });
    return result;
};

const deleteCategoryFromDB = async (id: string) => {
    const result = await prisma.category.update({
        where: {
            id,
        },
        data: {
            status: 'INACTIVE',
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
