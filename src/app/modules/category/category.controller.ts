import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryService } from './category.service';
import httpStatus from 'http-status';

const createCategory = catchAsync(async (req, res) => {
    const result = await CategoryService.createCategoryInDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Category created successfully',
        data: result,
    });
});

const getAllCategories = catchAsync(async (req, res) => {
    const { data, meta } = await CategoryService.getAllCategoriesFromDB(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Categories retrieved successfully',
        data,
        meta,
    });
});

const getCategoryById = catchAsync(async (req, res) => {
    const result = await CategoryService.getCategoryByIdFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Category retrieved successfully',
        data: result,
    });
});

const updateCategory = catchAsync(async (req, res) => {
    const result = await CategoryService.updateCategoryInDB(req.params.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Category updated successfully',
        data: result,
    });
});

const deleteCategory = catchAsync(async (req, res) => {
    const result = await CategoryService.deleteCategoryFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Category deleted successfully',
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
